import PropTypes from "prop-types";
import React, { useRef, useContext, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import { isImagefileExist, getEnvAppTitle, getEnvProjectId, imageOK, toAbsoluteUrl } from "@util";
import { FhirClientContext } from "@context/FhirClientContext";
import PatientInfo from "@components/PatientInfo";

export default function Header(props) {
  const theme = useTheme();
  const { patient } = useContext(FhirClientContext);
  const desktopImgRef = useRef(null);
  const mobileImgRef = useRef(null);

  const { returnURL, inEHR } = props;
  const getDesktopImgSrc = async () => {
    const projectUrl = toAbsoluteUrl(`/assets/${getEnvProjectId()}/img/logo.png`);
    const ok = await isImagefileExist(projectUrl).catch(() => false);
    return ok ? projectUrl : toAbsoluteUrl(`/assets/default/img/logo.png`);
  };
  const getMobileImgSrc = async () => {
    const projectUrl = toAbsoluteUrl(`/assets/${getEnvProjectId()}/img/logo_mobile.png`);
    const ok = await isImagefileExist(projectUrl).catch(() => false);
    return ok ? projectUrl : toAbsoluteUrl(`/assets/default/img/logo_mobile.png`);
  };
  const handleImageLoaded = (e) => {
    if (!e.target) {
      return false;
    }
    let imageLoaded = imageOK(e.target);
    if (!imageLoaded) {
      e.target.classList.add("ghost");
      return;
    }
    e.target.classList.remove("ghost");
  };
  const shouldHideReturnButton = () => !returnURL || inEHR;

  const renderTitle = () => {
    const appTitle = getEnvAppTitle();
    return (
      <Typography
        variant="h5"
        component="h1"
        color="primary"
        sx={{
          fontSize: "1.3rem",
          display: inEHR ? "block" : { xs: "none", sm: "none", md: "block" },
        }}
      >
        {appTitle}
      </Typography>
    );
  };

  const renderLogo = () => {
    const projectID = getEnvProjectId();
    if (!projectID) return <DashboardIcon fontSize="large" color="primary"></DashboardIcon>;
    else
      return (
        <>
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "inline-flex",
              },
            }}
          >
            <button
              onClick={() => (window.location = returnURL + "/clear_session")}
              style={{
                background: "none",
                border: 0,
              }}
            >
              <img
                className="logo header-logo ghost"
                ref={desktopImgRef}
                alt={"project logo"}
                style={{
                  height: 40,
                  cursor: "pointer",
                }}
                onLoad={handleImageLoaded}
                onError={handleImageLoaded}
              ></img>
            </button>
          </Box>
          <Box
            sx={{
              display: {
                xs: "inline-flex",
                sm: "inline-flex",
                md: "none",
              },
            }}
          >
            <button
              onClick={() => (window.location = returnURL + "/clear_session")}
              style={{
                background: "none",
                border: 0,
              }}
            >
              <img
                ref={mobileImgRef}
                alt={"project logo"}
                onLoad={handleImageLoaded}
                onError={handleImageLoaded}
                className="logo ghost"
                style={{
                  cursor: "pointer",
                  height: 40,
                }}
              ></img>
            </button>
          </Box>
        </>
      );
  };
  const renderPatientInfo = () => <PatientInfo patient={patient}></PatientInfo>;
  const renderReturnButton = (props) => {
    return (
      <Box className="print-hidden">
        <Button
          color="primary"
          href={returnURL + "/clear_session"}
          className="btn-return-url"
          startIcon={<ArrowBackIcon></ArrowBackIcon>}
          size="medium"
          variant="contained"
          {...props}
        >
          Patient List
        </Button>
      </Box>
    );
  };

  useEffect(() => {
    if (!desktopImgRef.current) return;
    getDesktopImgSrc().then((url) => (desktopImgRef.current.src = url));
  }, []);

  useEffect(() => {
    if (!mobileImgRef.current) return;
    getMobileImgSrc().then((url) => (mobileImgRef.current.src = url));
  }, []);

  return (
    <>
      <AppBar position="fixed" elevation={1} sx={{ paddingRight: "0 !important", paddingLeft: "0 !important" }}>
        <Toolbar
          sx={{
            backgroundColor: theme.palette.lighter ? theme.palette.lighter.main : "#FFF",
            color: theme.palette.secondary ? theme.palette.secondary.main : "#444",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
          }}
          disableGutters
          variant="dense"
        >
          <Stack
            direction={"row"}
            spacing={{
              xs: 1,
              sm: 1,
              md: 1.25,
            }}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            {renderLogo()}
            {renderTitle()}
            <Stack direction={"row"} sx={{ flex: "1 1" }} alignItems="center">
              {!inEHR && renderPatientInfo()}
              {!shouldHideReturnButton && renderReturnButton()}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
}

Header.propTypes = {
  returnURL: PropTypes.string,
  inEHR: PropTypes.bool,
};
