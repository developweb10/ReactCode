import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { UserModel } from "@models/users.models";

export interface UsersState extends EntityState<UserModel, number> {}

@StoreConfig({ name: "users", idKey: "userId" })
export class UsersStore extends EntityStore<UsersState> {}

export const usersStore = new UsersStore();
