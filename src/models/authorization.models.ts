import { UserRoleEnum } from "./users.models";

export interface UserAuthModel {
  userId: number;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  role: UserRoleEnum;
}

export type SignInDto = {
  email: string;
  password: string;
};

export type SignInResDto = UserAuthModel & {
  newTasks: number;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  newPassword: string;
  token: string;
};
