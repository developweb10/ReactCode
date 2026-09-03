export enum UserRoleEnum {
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_EMPLOYEE = "ROLE_EMPLOYEE",
  ROLE_HR = "ROLE_HR",
}

export interface UserModel {
  avatarId?: string;
  email: string;
  firstname: string;
  role: UserRoleEnum;
  surname: string;
  userId: number;
}

export interface GetUsersParams {
  year?: number;
  month?: number;
  sort?: string;
  search?: string;
}

export interface MinUserDto {
  avatarId?: string;
  email: string;
  firstname: string;
  role: UserRoleEnum;
  surname: string;
  id: number;
}
