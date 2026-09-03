import {
  DialogManagerStore,
  dialogManagerStore,
  DialogType,
} from "./dialog.store";

export { DialogType } from "./dialog.store";
export class DialogManagerService {
  constructor(private dialogManagerStore: DialogManagerStore) {}

  openDialog<T = any>(dialogType: DialogType, dialogProps: T) {
    this.dialogManagerStore.update((state) => ({
      ...state,
      dialogs: [{ dialogType, dialogProps, dialogOpen: true }],
    }));
  }

  pushDialog<T = any>(dialogType: DialogType, dialogProps: T) {
    this.dialogManagerStore.update((state) => {
      const existingIndex = state.dialogs.findIndex(
        (d) => d.dialogType === dialogType
      );

      if (existingIndex !== -1) {
        return {
          dialogs: state.dialogs.map((d, i) =>
            i === existingIndex ? { ...d, dialogOpen: true } : d
          ),
        };
      }

      return {
        dialogs: [
          ...state.dialogs,
          { dialogType, dialogProps, dialogOpen: true },
        ],
      };
    });
  }

  closeDialog(dialogType: DialogType) {
    this.dialogManagerStore.update((state) => {
      return {
        ...state,
        dialogs: state.dialogs.map((dialog) =>
          dialogType === dialog.dialogType
            ? { ...dialog, dialogOpen: false }
            : dialog
        ),
      };
    });
  }

  closeAll() {
    this.dialogManagerStore.update((state) => {
      return {
        ...state,
        dialogs: state.dialogs.map((dialog) => ({
          ...dialog,
          dialogOpen: false,
        })),
      };
    });
  }
}

export const dialogManagerService = new DialogManagerService(
  dialogManagerStore
);
