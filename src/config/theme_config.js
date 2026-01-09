import { createTheme } from "@mui/material/styles";
import { grey, blue, indigo, orange, red} from "@mui/material/colors";
import { getEnvProjectId } from "@util";
const defaultOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1400,
    },
  },
};
export const themes = {
  default: createTheme({
    ...defaultOptions,
    palette: {
      background: {
        main: "#FaFaFa",
      },
      lightest: {
        main: "#fafafa",
      },
      lighter: {
        main: indigo[50],
      },
      light: {
        main: indigo[300],
      },
      primary: {
        main: indigo[800],
      },
      accent: {
        main: orange[900]
      },
      dark: {
        main: indigo[900],
      },
      secondary: {
        main: grey[800],
      },
      link: {
        main: blue[700],
      },
      muted: {
        main: grey[700],
      },
      muter: {
        main: grey[400]
      },
      border: {
        main: "#f5f5f5",
      },
      error: {
        main: red[900]
      },
      warning: {
        main: orange[900]
      }
    },
  }),
  //project dependent theme here
  /*
   [siteId]: createTheme({
    ...defaultOptions,
    palette: {
        ....
    }
   })
   */
};
export const getTheme = () => {
  const projectId = getEnvProjectId();
  return themes[String(projectId).toLowerCase()] || themes["default"];
};
