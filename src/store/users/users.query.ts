import { QueryEntity } from "@datorama/akita";
import { UsersState, UsersStore, usersStore } from "./users.store";

export class UsersQuery extends QueryEntity<UsersState> {
  users$ = this.selectAll();
  loading$ = this.selectLoading();
  constructor(protected store: UsersStore) {
    super(store);
  }
}

export const usersQuery = new UsersQuery(usersStore);
