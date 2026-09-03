import { RouteProps } from "react-router";
import { AuthRouterNames } from "./auth-router.names";
import LoginPage from "../pages/login-page";
import ForgotPassword from "../pages/forgot-password-page";
import ResetPassword from "../pages/reset-password-page";

export const authRouterConfig: RouteProps[] = [
  {
    path: `/${AuthRouterNames.LOGIN}`,
    component: LoginPage,
    exact: true,
  },
  {
    path: `/${AuthRouterNames.FORGOT_PASSWORD}`,
    component: ForgotPassword,
    exact: true,
  },
  {
    path: `/${AuthRouterNames.RESET_PASSWORD}`,
    component: ResetPassword,
    exact: true,
  },
];
