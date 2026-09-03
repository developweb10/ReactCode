import { RouteConfig } from "./home-router.config";
import { UserRoleEnum } from "@models/users.models";

export const getAllowedRoutes = (
  routes: RouteConfig[],
  userRole: UserRoleEnum
) => {
  return routes.filter(({ permission }) => {
    if (!permission) return true;
    return permission.includes(userRole);
  });
};
