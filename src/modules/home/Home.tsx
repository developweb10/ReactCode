import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { Redirect, Route, Switch } from "react-router";
import { useObservableState } from "observable-hooks";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { authorizationService } from "@store/authorization/authorization.service";
import { homeRouterConfig } from "@modules/home/config/home-router.config";
import { getAllowedRoutes } from "@modules/home/config/get-allowed-routes";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import { HomeLayout } from "@home/layouts/home-layout/home-layout";
import { DialogManager } from "@components/dialog-manager/dialog-manager";
import { useInterval } from "@hooks/useInterval";

import moment from "moment";
import "moment/locale/en-gb";
import "moment-duration-format";

moment.locale("en-gb");

const Home: React.FC = () => {
  const currentUser = useObservableState(authorizationQuery.user$);
  useInterval(() => {
    authorizationService.checkNewTasks();
  }, 1000 * 60);
  if (!currentUser) return null;
  const allowedRoutes = getAllowedRoutes(homeRouterConfig, currentUser.role);

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <HomeLayout currentUser={currentUser}>
        <Switch>
          {allowedRoutes.map((route) => (
            <Route key={route.path as string} {...route} />
          ))}
          <Redirect from="*" exact to={`/${HomeRouterNames.DASHBOARD}`} />
        </Switch>
        <DialogManager currentUser={currentUser} />
      </HomeLayout>
    </MuiPickersUtilsProvider>
  );
};

export default Home;
