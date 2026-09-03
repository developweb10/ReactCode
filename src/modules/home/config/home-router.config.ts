import { RouteProps } from "react-router";
import { UserRoleEnum } from "@models/users.models";
import { HomeRouterNames } from "./home-router.names";
import React from "react";

export interface RouteConfig extends RouteProps {
  permission?: UserRoleEnum[];
}
export const homeRouterConfig: RouteConfig[] = [
  {
    path: `/${HomeRouterNames.DASHBOARD}`,
    component: React.lazy(() => import("../pages/dashboard-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.EMPLOYEES}`,
    component: React.lazy(() => import("../pages/employees-page")),
  },
  {
    path: `/${HomeRouterNames.SYSTEM_USER}`,
    component: React.lazy(() => import("../pages/system-user-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.SYSTEM_SETTING}`,
    component: React.lazy(() => import("../pages/system-setting-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.UPCOMING_NOTIFICATIONS}`,
    component: React.lazy(
      () => import("../pages/upcoming-notifications-page")
    ),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.ALL_CASES}/:caseType`,
    component: React.lazy(() => import("../pages/all-cases-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.REQUESTS}`,
    component: React.lazy(() => import("../pages/requests-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.CALENDAR}`,
    component: React.lazy(() => import("../pages/calendar-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.REDUNDANCY_CALCULATOR}`,
    component: React.lazy(() => import("../pages/redundancy-calc-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.STORE_DETAILS}`,
    component: React.lazy(() => import("../pages/stores-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.STORE_DETAILS}/employees`,
    component: React.lazy(() => import("../pages/stores-page/store-employees")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.TASKS}`,
    component: React.lazy(() => import("../pages/tasks-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.TIME_ATTENDANCE}`,
    component: React.lazy(() => import("../pages/time-attendance-page")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.SCHEDULING}`,
    component: React.lazy(() => import("../pages/scheduling_v2")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.NOTIFICATION_LOGS}`,
    component: React.lazy(() => import("../pages/notification-log")),
    exact: true,
  },
  {
    path: `/${HomeRouterNames.CANDIDATES}`,
    component: React.lazy(() => import("../pages/candidates-page")),
    exact: true,
  },
];
