import { SnackbarStore, snackbarStore } from "./snackbar.store";
import { Notification } from "reapop";
import { DEFAULTS } from "./config";

export class SnackbarService {
  constructor(private snackbarStore: SnackbarStore) {}

  upsertNotification(notification: Partial<Notification>) {
    const notif = {
      ...DEFAULTS,
      ...notification,
      id: Math.random().toString(36).slice(2, 7),
      buttons: [],
    } as Notification;

    this.snackbarStore.update((state) => ({
      ...state,
      notifications: [...state.notifications, notif],
    }));
  }

  dismissNotification(id: string) {
    this.snackbarStore.update((state) => ({
      ...state,
      notifications: state.notifications.filter((not) => not.id !== id),
    }));
  }
}

export const snackbarService = new SnackbarService(snackbarStore);
