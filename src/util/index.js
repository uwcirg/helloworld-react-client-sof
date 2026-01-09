import { queryNeedPatientBanner } from "../consts";

export function isEmptyArray(o) {
  return !o || !Array.isArray(o) || !o.length;
}

export async function fetchEnvData() {
  return new Promise((resolve) => {
    const nodeEnvs = getNodeProcessEnvs();
    if (window && window["appConfig"] && !isEmptyArray(Object.keys(window["appConfig"]))) {
      console.log("Window config variables added. ");
      resolve({
        ...window["appConfig"],
        ...nodeEnvs,
      });
    }
    const url = "/env.json";
    if (window) window["appConfig"] = {};
    fetch(url)
      .then((response) => response.json())
      .catch((e) => {
        console.log(e);
        resolve(nodeEnvs);
      })
      .then((results) => {
        // assign window process env variables for access by app
        // won't be overridden when Node initializing env variables
        const envObj = results ? results : {};
        if (window) {
          for (let key in envObj) {
            window["appConfig"][key] = envObj[key];
          }
        }
        resolve({
          ...envObj,
          ...nodeEnvs,
        });
      })
      .catch((e) => {
        console.log(e);
        resolve(nodeEnvs);
      });
  });
}

export function getEnv(key) {
  //window application global variables
  if (window && window["appConfig"] && window["appConfig"][key]) return window["appConfig"][key];
  const envDefined = typeof import.meta.env !== "undefined" && import.meta.env;
  //enviroment variables as defined in Node
  if (envDefined && import.meta.env[key]) return import.meta.env[key];
  return "";
}

export function getNodeProcessEnvs() {
  return typeof import.meta.env !== "undefined" && import.meta.env ? import.meta.env : {};
}

export function getEnvs() {
  const appConfig = window && window["appConfig"] ? window["appConfig"] : {};
  return {
    ...appConfig,
    ...getNodeProcessEnvs(),
  };
}

export function getEnvProjectId() {
  return getEnv("REACT_APP_PROJECT_ID");
}

export function getEnvSystemType() {
  return getEnv("REACT_APP_SYSTEM_TYPE");
}

export function getEnvAppTitle() {
  return getEnv("REACT_APP_TITLE") || "SOF APP";
}

export function getEnvDashboardURL() {
  return getEnv("REACT_APP_DASHBOARD_URL");
}

export function shouldShowPatientInfo(client) {
  // from query string
  if (sessionStorage.getItem(queryNeedPatientBanner) !== null) {
    return String(sessionStorage.getItem(queryNeedPatientBanner)) === "true";
  }
  // check token response,
  const tokenResponse = client ? client.getState("tokenResponse") : null;
  //check need_patient_banner launch context parameter
  if (tokenResponse && tokenResponse["need_patient_banner"]) {
    return String(tokenResponse["need_patient_banner"]).toLowerCase() === "true";
  }
  return String(getEnv("REACT_APP_DISABLE_HEADER")).toLowerCase() !== "true";
}

export const queryPatientIdKey = "launch_queryPatientId";

export function injectFaviconByProject() {
  let faviconEl = document.querySelector("link[rel*='icon']");
  if (!faviconEl) return;
  const projectId = getEnv("REACT_APP_PROJECT_ID");
  if (!projectId) return;
  faviconEl.href = `/assets/${projectId}/img/favicon.ico`;
}

export function toAbsoluteUrl(path) {
  try {
    const base =
      (typeof window !== "undefined" && window.location?.origin) ||
      (typeof document !== "undefined" && document.baseURI) ||
      (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) ||
      "http://localhost"; // test fallback
    return new URL(path, base).toString();
  } catch {
    // Absolute already or cannot resolve — just return as-is
    return path;
  }
}

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
}

export async function isImagefileExist(url) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    return response.ok && contentType && contentType.startsWith("image/"); // Returns true if status is 200-299
  } catch (error) {
    console.log(error);
    return false; // Request failed or URL is invalid
  }
}
