import NotificationsSystem, { wyboTheme } from "reapop";

import { useObservableState } from "observable-hooks";
import { snackbarQuery } from "@store/snackbar/snackbar.query";
import { snackbarService } from "@store/snackbar/snackbar.service";

export const Snackbar = () => {
  const snackbarState = useObservableState(snackbarQuery.snackbar$, {
    notifications: [],
  });

  return (
    <NotificationsSystem
      notifications={snackbarState.notifications}
      dismissNotification={(id) => snackbarService.dismissNotification(id)}
      theme={wyboTheme}
    />
  );
};
