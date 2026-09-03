import { createMuiTheme } from "@material-ui/core";

import template from "./sass/template/template.module.scss";

declare module "@material-ui/core/styles/createBreakpoints" {
  interface BreakpointOverrides {
    xs: true;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    phone: true;
    smartphone: true;
    tablet: true;
    laptop: true;
    desktop: true;
    fullhd: true;
    ultra: true;
  }
}

let theme = createMuiTheme({
  palette: {
    primary: {
      main: template.primary,
      dark: template.primaryDark,
      light: template.primaryLight,
    },
    secondary: {
      main: template.secondary,
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      phone: 320,
      smartphone: 576,
      tablet: 768,
      laptop: 992,
      desktop: 1280,
      fullhd: 1920,
      ultra: 3800,
    },
  },

  typography: {
    fontFamily: template.regular,
    htmlFontSize: 10,
    h1: {
      fontFamily: template.medium,
    },
    h2: {
      fontFamily: template.medium,
    },
    h3: {
      fontFamily: template.medium,
    },

    h4: {
      fontFamily: template.medium,
      fontSize: "2rem",
    },
    h5: {
      fontFamily: template.medium,
      fontSize: "1.8rem",
    },
    h6: {
      fontFamily: template.semibold,
      fontSize: "1.4rem",
    },

    body1: {
      fontSize: "1.3rem",
      "@media (min-width:1920px)": {
        fontSize: "1.5rem",
      },
    },
    button: {
      textTransform: "initial",
    },
  },
  overrides: {
    MuiButton: {
      root: {
        "&:hover": {
          background: "#eee",
        },
      },
      containedPrimary: {
        color: "white",
      },
      contained: {
        "&$disabled": {
          color: "#fff",
        },
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        "&": {
          borderRadius: 4,
        },
        "& h4": {
          color: "#fff",
        },
        "& h6": {
          color: "#fff",
          fontFamily: template.semibold,
        },
        "& h3": {
          color: "#fff",
          fontFamily: template.semibold,
        },
      },
    },

    MuiPickerDTTabs: {
      tabs: {
        "& svg": {
          fill: "#fff",
        },
        "& .MuiTabs-indicator": {
          height: 3,
          backgroundColor: "#fff",
        },
      },
    },
    MuiPickersCalendarHeader: {
      dayLabel: {
        color: "#000",
        textTransform: "uppercase",
        fontFamily: template.semibold,
        letterSpacing: 1,
        fontSize: 9,
      },
      transitionContainer: {
        "& p": {
          fontFamily: template.semibold,
          fontSize: 15,
        },
      },
    },
    MuiPickersDay: {
      day: {
        color: "#000",

        "& p": {
          fontFamily: template.medium,
          fontSize: "1.5rem",
        },
      },
      daySelected: {
        color: "#fff",
      },
      dayDisabled: {
        color: "#dce0e0",
      },
    },
  },
});

export const materialTheme = theme;
