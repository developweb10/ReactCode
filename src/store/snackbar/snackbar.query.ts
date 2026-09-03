import { Query } from "@datorama/akita";
import { SnackbarState, SnackbarStore, snackbarStore } from "./snackbar.store";

export class SnackbarQuery extends Query<SnackbarState> {
  snackbar$ = this.select();

  constructor(protected store: SnackbarStore) {
    super(store);
  }
}

export const snackbarQuery = new SnackbarQuery(snackbarStore);
