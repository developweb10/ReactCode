import { Store, StoreConfig } from "@datorama/akita";
import { Notification } from "reapop";

export interface SnackbarState {
  notifications: Notification[];
}

export function createInitialState(): SnackbarState {
  return {
    notifications: [],
  };
}
@StoreConfig({ name: "snackbar" })
export class SnackbarStore extends Store<SnackbarState> {
  constructor() {
    super(createInitialState());
  }
}

export const snackbarStore = new SnackbarStore();
