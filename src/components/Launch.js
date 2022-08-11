import React from "react";
import FHIR from "fhirclient";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorComponent from "./ErrorComponent";
import { fetchEnvData, getEnv, queryPatientIdKey } from "../util/util.js";
import "../style/App.scss";


const fetchContextJson = async (authURL) => {
  if (!authURL) {
    // default, if no auth url provided
    return {
      clientId: "hello_world_client",
      scope: "profile roles email patient/*.read",
    };
  }
  const response = await fetch(authURL, {
    // include cookies in request
    credentials: "include",
  }).catch((e) => console.log("Error retrieving context json via auth url ", e));
  const contextJson = await response
    .json()
    .catch((e) => console.log("Context json parsing error ", e));
  return contextJson;
};

export default function Launch() {
  const [error, setError] = React.useState("");

  React.useEffect(() => fetchEnvData(), []);
  React.useEffect(() => {
    const backendURL = getEnv("REACT_APP_BACKEND_URL");
    const authURL = backendURL
      ? `${backendURL}/auth/auth-info`
      : "launch-context.json";
    const urlParams = new URLSearchParams(window.location.search);
    //retrieve patient id from URL querystring if any
    const patientId = urlParams.get("patient");
    console.log("patient id from url query string: ", patientId);
    console.log("Auth url ", authURL);
    fetchContextJson(authURL).then(json => {
       if (patientId) {
         //only do this IF patient id comes from url queryString
         json.patientId = patientId;
         sessionStorage.setItem(queryPatientIdKey, patientId);
       }
       const envClientId = getEnv("REACT_APP_CLIENT_ID");
       if (envClientId) json.clientId = envClientId;
       //allow auth scopes to be updated via environment variable
       //see https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html
       const envAuthScopes = getEnv("REACT_APP_AUTH_SCOPES");
       if (envAuthScopes) json.scope = envAuthScopes;
       console.log("launch context json ", json);
       FHIR.oauth2.authorize(json).catch((e) => {
         setError(e);
       });
    });
  }, []);

  return (
    <React.Fragment>
      {error && <ErrorComponent message={error.message}></ErrorComponent>}
      {!error && (
        <Stack
          spacing={2}
          direction="row"
          style={{ padding: "24px" }}
          alignItems="center"
        >
          <CircularProgress></CircularProgress>
          <div>Launching ...</div>
        </Stack>
      )}
    </React.Fragment>
  );
}
