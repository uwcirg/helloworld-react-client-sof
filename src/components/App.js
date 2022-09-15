import {useEffect, useState} from "react";
import FhirClientProvider from "../FhirClientProvider";
import Summary from "./Summary";
import "../style/App.scss";
import {fetchEnvData, getEnvs} from "../util/util.js";

export default function App() {
  const [appReady, setAppReady] = useState(false);
  useEffect(() => {
    fetchEnvData();
    setAppReady(true); // state change to make sure the environment variables are loaded
    console.log("environment variables ", getEnvs());
  }, []);
  return (
    <>
      {
        appReady &&
        <FhirClientProvider>
          {<Summary></Summary>}
          {/* add other components as needed */}
        </FhirClientProvider>
      }
    </>
  );
}

