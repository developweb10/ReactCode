import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, StylesProvider } from "@material-ui/core/styles";
import { materialTheme } from "./styles/material-theme";
import { useObservableState } from "observable-hooks";
import { AuthState } from "@store/authorization/authorization.store";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { authorizationService } from "@store/authorization/authorization.service";
import Authorization from "@modules/authorization/Authorization";
import Home from "@modules/home/Home";
import { Snackbar } from "@components/snackbar/snackbar";

function App() {
  const authState = useObservableState(
    authorizationQuery.authState$,
    AuthState.UNKNOWN
  );

  useEffect(() => {
    authorizationService.checkTokenStatus();
  }, []);

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={materialTheme}>
        <Router>
          {authState === AuthState.UNAUTHORIZED && <Authorization />}
          {authState === AuthState.SIGNED_IN && <Home />}
        </Router>
        <Snackbar />
      </ThemeProvider>
    </StylesProvider>
  );
}

export default App;
