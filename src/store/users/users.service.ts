import { UsersStore, usersStore } from "./users.store";
import { UsersApi } from "@api/users/users.api";
import { GetUsersParams } from "@models/users.models";

export class UsersService {
  constructor(private requestsStore: UsersStore) {}

  async fetchUsers(params?: GetUsersParams) {
    try {
      const res = await UsersApi.getUsers({
        sort: "firstname,asc",
        ...(params || {}),
      });
      this.requestsStore.set(res.data);
    } catch (error) {}
  }
}

export const usersService = new UsersService(usersStore);
