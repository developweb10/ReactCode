import { UserRoleEnum } from "@models/users.models";

export const getRole = (role: UserRoleEnum) => {
  switch (role) {
    case UserRoleEnum.ROLE_ADMIN:
      return "Super User";
    case UserRoleEnum.ROLE_HR:
      return "User";
    case UserRoleEnum.ROLE_EMPLOYEE:
      return "Employee";
    default:
      return "Employee";
  }
};
