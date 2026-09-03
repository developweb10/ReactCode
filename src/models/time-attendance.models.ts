import { MessageModel } from "./message.models";

export enum TimesheetStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
export interface GetTimesheetParams {
  // 2021-04-15 format : YYYY-MM-DD
  dateFrom: string;
  dateTo: string;
  userId?: number;
}

export interface ExportTimesheetParams {
  // 2021-04-15 format : YYYY-MM-DD
  dateFrom: string;
  dateTo: string;
  userId?: number;
}

export interface AssigmentPerDayDto {
  date: string;
  expectedSpentTimeMin: number;
}
export interface AssigmentPerDayModel extends AssigmentPerDayDto {
  id: number;
  actualSpentTimeMin: number;
  messages: MessageModel[] | null;
}

export interface AssignmentTimesheetModel {
  id: number;
  assigmentTypeId: number;
  note: string;
  perDays: AssigmentPerDayModel[];
}

export interface AssignmentTimesheetWithNameModel
  extends AssignmentTimesheetModel {
  name: string;
}

export interface TimeAndAttendanceModel {
  periodId: number;
  status: TimesheetStatus;
  workedMinutes: number;
  contractedMinutes: number;
  contractedHourlyRate: number;
  contractedPay: number;
  assigmentTimesheet: AssignmentTimesheetModel[];
}

export interface TimeAndAttendanceStats {
  status: TimesheetStatus;
  workedMinutes: number;
  contractedMinutes: number;
  contractedHourlyRate: number;
  contractedPay: number;
}

export interface AssignmentRequestDto {
  assigmentTypeId: number;
  note: string;
  dateFrom: string;
  dateTo: string;
  perDays: AssigmentPerDayDto[];
  userId?: number;
}

export interface AssignmentType {
  id: number;
  name: string;
}

export interface ClockInDto {
  note: string;
  assignmentName: string;
  assigmentTimesheetId: number;
  assigmentTypeId: number;
  perDayId: number;
  perDayDate: string;
}
export interface TrackerLocalStorageData extends ClockInDto {
  startDate: string;
  userId: number;
}

export interface ClockOutDto {
  actualSpentTimeMin: number;
  note: string;
}

export interface GetUsersTimesheetParams {
  dateFrom: string;
  dateTo: string;
  search?: string;
  sort?: string;
}

export interface TimesheetTableRouteState {
  weekRange: {
    from: string;
    to: string;
  };
  userId: number;
  userName: string;
  backPath: string;
}

export interface UsersTableRouteState {
  weekRange: {
    from: string;
    to: string;
  };
}
export interface TimesheetRouteState {
  timesheetTableState?: TimesheetTableRouteState;
  usersTableState?: UsersTableRouteState;
}
