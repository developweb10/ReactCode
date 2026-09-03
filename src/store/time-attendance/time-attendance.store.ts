import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import {
  TimeAndAttendanceModel,
  AssignmentTimesheetModel,
  TimesheetStatus,
  AssignmentType,
} from "@models/time-attendance.models";

export interface TimeAttendanceState
  extends EntityState<AssignmentTimesheetModel, number>,
    Omit<TimeAndAttendanceModel, "assigmentTimesheet"> {
  assignmentTypes: AssignmentType[];
}

const initialState = {
  periodId: 0,
  status: TimesheetStatus.CREATED,
  workedMinutes: 0,
  contractedMinutes: 0,
  contractedHourlyRate: 0,
  contractedPay: 0,
  assignmentTypes: [],
};

@StoreConfig({ name: "time-attendance", idKey: "id" })
export class TimeAttendanceStore extends EntityStore<TimeAttendanceState> {
  constructor() {
    super(initialState);
  }
}

export const timeAttendanceStore = new TimeAttendanceStore();
