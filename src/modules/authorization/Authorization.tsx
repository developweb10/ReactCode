import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { authRouterConfig } from "./config/auth-router.config";
import { AuthRouterNames } from "./config/auth-router.names";
import { AuthorizationLayout } from "./layouts/AuthorizationLayout/AuthorizationLayout";

const Authorization = () => {
  return (
    <AuthorizationLayout>
      {(location) => (
        <Switch location={location}>
          {authRouterConfig.map((route) => (
            <Route key={route.path as string} {...route} />
          ))}
          <Redirect from="*" exact to={`/${AuthRouterNames.LOGIN}`} />
        </Switch>
      )}
    </AuthorizationLayout>
  );
};

export default Authorization;
