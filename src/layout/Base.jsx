import PropTypes from "prop-types";
import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import "../style/App.scss";
import { FhirClientContext } from "@context/FhirClientContext";
import {
  getEnvDashboardURL,
  shouldShowPatientInfo,
} from "../util";
import Header from "./Header";

export default function Content({ children }) {
  const { client } = useContext(FhirClientContext);
  const showPatientInfo = shouldShowPatientInfo(client);
  return (
    client && (
      <Box sx={{ display: "flex" }}>
        <Header returnURL={getEnvDashboardURL()} inEHR={!showPatientInfo} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar variant="dense" />
          {children}
          {/* add other components as needed */}
        </Box>
      </Box>
    )
  );
}

Content.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
};
