import { ApiServiceInstance } from "../api-service";
import { MinUserDto } from "@models/users.models";

import {
  AssignmentType,
  TimeAndAttendanceModel,
  GetTimesheetParams,
  AssignmentRequestDto,
  AssignmentTimesheetModel,
  ClockOutDto,
  TimesheetStatus,
  GetUsersTimesheetParams,
  ExportTimesheetParams,
} from "@models/time-attendance.models";
import { AddMessageDto, MessageModel } from "@models/message.models";

export class TimeAttendanceApi {
  static async getTimesheet(params: GetTimesheetParams) {
    return await ApiServiceInstance.get<TimeAndAttendanceModel>(
      `/private/assigment-timesheet`,
      { params }
    );
  }

  static async addTimesheetAssignment(dto: AssignmentRequestDto) {
    return await ApiServiceInstance.post<AssignmentTimesheetModel>(
      `/private/assigment-timesheet`,
      dto
    );
  }

  static async editTimesheetAssignment(
    dto: AssignmentRequestDto,
    assigmentTimesheetId: number
  ) {
    return await ApiServiceInstance.put<AssignmentTimesheetModel>(
      `/private/assigment-timesheet/${assigmentTimesheetId}`,
      dto
    );
  }

  static async deleteTimesheetAssignment(assigmentTimesheetId: number) {
    return await ApiServiceInstance.delete(
      `/private/assigment-timesheet/${assigmentTimesheetId}`
    );
  }

  static async addDayComment(dayId: number, dto: AddMessageDto) {
    return await ApiServiceInstance.post<MessageModel>(
      `/private/assigment-timesheet/per-days/${dayId}/messages`,
      dto
    );
  }

  static async updateTimesheetStatus(
    periodId: number,
    status: TimesheetStatus
  ) {
    return await ApiServiceInstance.patch(
      `/private/assigment-periods/${periodId}/status`,
      { status }
    );
  }

  static async exportTimesheet(params: ExportTimesheetParams) {
    return await ApiServiceInstance.get<Blob>(
      `/private/assigment-timesheet/export`,
      {
        params,
        responseType: "blob",
      }
    );
  }

  static async getUsersTimesheet(params: GetUsersTimesheetParams) {
    return await ApiServiceInstance.get<MinUserDto[]>(
      `/private/assigment-approvals`,
      { params }
    );
  }

  static async timesheetAssignmentClockOut(
    assigmentTimesheetId: number,
    dto: ClockOutDto
  ) {
    return await ApiServiceInstance.patch(
      `/private/assigment-timesheet/${assigmentTimesheetId}/clock-out`,
      dto
    );
  }

  static async fetchAssignmentOptions() {
    return await ApiServiceInstance.get<AssignmentType[]>(
      `/private/assigment-types`
    );
  }
}
