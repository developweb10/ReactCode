import { ApiServiceInstance } from "../api-service";
import {
  SignInDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInResDto,
} from "@models/authorization.models";

export class AuthorizationApi {
  static async checkUser() {
    return ApiServiceInstance.get<SignInResDto>("/private/auth/me");
  }

  static async signIn(dto: SignInDto) {
    return ApiServiceInstance.post<SignInResDto, SignInDto>(
      "/public/auth/sign-in",
      dto
    );
  }

  static async forgotPassword(dto: ForgotPasswordDto) {
    return ApiServiceInstance.post<unknown, ForgotPasswordDto>(
      "/public/auth/forgot-password/step-1",
      dto
    );
  }

  static async resetPassword(dto: ResetPasswordDto) {
    return ApiServiceInstance.post<unknown, ResetPasswordDto>(
      "/public/auth/forgot-password/step-2",
      dto
    );
  }
}
