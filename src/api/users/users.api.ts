import { ApiServiceInstance } from "../api-service";
import { UserModel, GetUsersParams } from "@models/users.models";

export class UsersApi {
  static async getUsers(params?: GetUsersParams) {
    return await ApiServiceInstance.get<UserModel[]>(`/private/users`, {
      params,
    });
  }
}
