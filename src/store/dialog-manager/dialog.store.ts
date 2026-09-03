import { Store, StoreConfig } from "@datorama/akita";

export enum DialogType {
  UNKNOWN = "UNKNOWN",
  // REQUEST DIALOGS
  CREATE_REQUEST = "CREATE_REQUEST",
  EDIT_REQUEST = "EDIT_REQUEST",
  VIEW_REQUEST = "VIEW_REQUEST",
  VIEW_NOTE_OR_REASON = "VIEW_NOTE_OR_REASON",
  REJECT_REQUEST = "REJECT_REQUEST",
  DELETE_REQUEST = "DELETE_REQUEST",

  // STORES DIALOGS

  CREATE_STORE = "CREATE_STORE",
  EDIT_STORE = "EDIT_STORE",
  DELETE_STORE = "DELETE_STORE",

  // EMPLOYEES DIALOGS

  ADD_EMPLOYEE = "ADD_EMPLOYEE",
  DELETE_EMPLOYEE = "DELETE_EMPLOYEE",

  // CASES DIALOGS

  ADD_CASE = "ADD_CASE",
  VIEW_CASE = "VIEW_CASE",
  DELETE_CASE = "DELETE_CASE",

  // TASKS DIALOGS

  TASKS_DATE_RANGE = "TASKS_DATE_RANGE",
  ADD_TASK = "ADD_TASK",
  VIEW_TASK = "VIEW_TASK",
  DELETE_TASK = "DELETE_TASK",

  // TIME & ATTENDANCE DIALOGS

  ADD_ASSIGNMENT = "ADD_ASSIGNMENT",
  EDIT_ASSIGNMENT = "EDIT_ASSIGNMENT",
  DELETE_ASSIGNMENT = "DELETE_ASSIGNMENT",
  TRACKER_CLOCK_IN = "TRACKER_CLOCK_IN",
  TRACKER_CLOCK_OUT = "TRACKER_CLOCK_OUT",
  TRACKER_CLOCK_OUT_WARNING = "TRACKER_CLOCK_OUT_WARNING",
  STATUS_CHANGE_TIMESHEET = "STATUS_CHANGE_TIMESHEET",
}

export interface DialogEntity {
  dialogType: DialogType;
  dialogOpen: boolean;
  dialogProps: any;
}
export interface DialogManagerState {
  dialogs: DialogEntity[];
}

export function createInitialState(): DialogManagerState {
  return {
    dialogs: [],
  };
}

@StoreConfig({ name: "dialog-manager" })
export class DialogManagerStore extends Store<DialogManagerState> {
  constructor() {
    super(createInitialState());
  }
}

export const dialogManagerStore = new DialogManagerStore();
