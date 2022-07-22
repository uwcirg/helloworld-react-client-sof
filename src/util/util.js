import ChartConfig from "../config/chart_config.js";

export async function getInterventionLogicLib(interventionId) {
  if (!interventionId) throw new Error("No intervention id specified");
  let elmJson, valueSetJson;
  try {
    elmJson = await import(
      `../cql/${interventionId.toUpperCase()}_InterventionLogicLibrary.json`
    ).then((module) => module.default);
    valueSetJson = await import(`../cql/valueset-db.json`).then(
      (module) => module.default
    );
  } catch (e) {
    throw new Error("Error loading Cql ELM library " + e);
  }
  return [elmJson, valueSetJson];
}

export function getFHIRResourcePaths(patientId) {
  if (!patientId) return [];
  const resourcesToLoad = getEnv("REACT_APP_FHIR_RESOURCES");
  let resources = resourcesToLoad
    ? resourcesToLoad.split(",")
    : ["QuestionnaireResponse"];
  return resources.map((resource) => {
    let path = `/${resource}`;
    const observationCategories = getEnv(
      "REACT_APP_FHIR_OBSERVATION_CATEGORIES"
    );
    path =
      path +
      (resource.toLowerCase() !== "questionnaire"
        ? `?patient=${patientId}`
        : "");
    if (resource.toLowerCase() === "observation" && observationCategories) {
      let categories = observationCategories.split(",");
      path +=
        "&" +
        encodeURIComponent(
          categories.map((cat) => "category=" + cat).join("&")
        );
    }
    return path;
  });
}

export const getFhirResources = async (client, patientid) => {
  if (!client) throw new Error("invalid client specified");
  if (!patientid) throw new Error("Patient id is missing");
  const resources = getFHIRResourcePaths(patientid);
  const requests = resources.map((resource) => client.request(resource));
  return Promise.allSettled(requests).then((results) => {
    let bundle = [];
    results.forEach((item) => {
      if (item.status === "rejected") {
        console.log("Fhir resource retrieval error ", item.reason);
        return true;
      }
      const result = item.value;
      if (result.resourceType === "Bundle" && result.entry) {
        result.entry.forEach((o) => {
          if (o && o.resource) bundle.push({ resource: o.resource });
        });
      } else if (Array.isArray(result)) {
        result.forEach((o) => {
          if (o.resourceType) bundle.push({ resource: o });
        });
      } else {
        bundle.push({ resource: result });
      }
    });
    return bundle;
  });
};

export const getChartConfig = (questionnaire) =>
  ChartConfig[questionnaire.toLowerCase()] || ChartConfig["default"];

export const queryPatientIdKey = "launch_queryPatientId";

export const getEnv = (key) => {
  if (!process || !process.env) return "";
  return process.env[key];
};

export function imageOK(img) {
  if (!img) {
    return false;
  }
  if (!img.getAttribute("src")) {
    return false;
  }
  if (!img.complete) {
    return false;
  }
  if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
    return false;
  }
  return true;
};

export function injectFaviconByProject() {
  let faviconEl = document.querySelector("link[rel*='icon']");
  if (!faviconEl) return;
  const projectId = getEnv("REACT_APP_PROJECT_ID");
  if (!projectId) return;
  faviconEl.href = `/assets/${projectId}/favicon.ico`;
} 
