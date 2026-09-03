import { applyTransaction } from "@datorama/akita";
import {
  TimeAttendanceStore,
  timeAttendanceStore,
} from "./time-attendance.store";
import { authorizationQuery } from "../authorization/authorization.query";
import { TimeAttendanceApi } from "@api/time-attendance/time-attendance.api";
import { MessagesApi } from "@api/messages/messages.api";

import {
  GetTimesheetParams,
  AssignmentRequestDto,
  TrackerLocalStorageData,
  ClockInDto,
  ClockOutDto,
  TimesheetStatus,
  GetUsersTimesheetParams,
  ExportTimesheetParams,
} from "@models/time-attendance.models";

import { snackbarService } from "@store/snackbar/snackbar.service";
import moment from "moment";
import { getTotalFormattedCount } from "@utils/date/time-attendance/utils";
import { downloadBlob } from "@utils/saveFile";

export class TimeAttendanceService {
  constructor(private timeAttendanceStore: TimeAttendanceStore) {}

  async getAssignmentTimesheet(params: GetTimesheetParams) {
    this.timeAttendanceStore.setLoading(true);
    try {
      const {
        data: { assigmentTimesheet, ...rest },
      } = await TimeAttendanceApi.getTimesheet(params);

      applyTransaction(() => {
        this.timeAttendanceStore.set(assigmentTimesheet);
        this.timeAttendanceStore.update({
          ...rest,
        });
      });
    } catch (error) {
      this.timeAttendanceStore.setLoading(false);
    }
  }

  async getAssignmentTypes() {
    try {
      const response = await TimeAttendanceApi.fetchAssignmentOptions();
      applyTransaction(() => {
        this.timeAttendanceStore.update({
          assignmentTypes: response.data,
        });
      });
    } catch (error) {}
  }

  async addAssignmentRow(dto: AssignmentRequestDto) {
    const storeValues = this.timeAttendanceStore.getValue();

    try {
      const response = await TimeAttendanceApi.addTimesheetAssignment(dto);

      if (storeValues.periodId) {
        applyTransaction(() => {
          this.timeAttendanceStore.add(response.data);
        });
      } else {
        await this.getAssignmentTimesheet({
          dateFrom: dto.dateFrom,
          dateTo: dto.dateTo,
          userId: dto.userId,
        });
      }

      snackbarService.upsertNotification({
        status: "success",
        message: "Assignment Row Has Been Added",
      });
    } catch (error) {
      throw error;
    }
  }

  async editAssignmentRow(
    dto: AssignmentRequestDto,
    assigmentTimesheetId: number
  ) {
    try {
      const response = await TimeAttendanceApi.editTimesheetAssignment(
        dto,
        assigmentTimesheetId
      );

      applyTransaction(() => {
        this.timeAttendanceStore.update(assigmentTimesheetId, response.data);
      });
      snackbarService.upsertNotification({
        status: "success",
        message: "Assignment Row Has Been Updated",
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAssignmentRow(id: number) {
    try {
      await TimeAttendanceApi.deleteTimesheetAssignment(id);
      applyTransaction(() => {
        this.timeAttendanceStore.remove(id);
      });
    } catch (error) {
      throw error;
    }
  }

  async addDayComment(dayId: number, assignmentId: number, message: string) {
    try {
      const response = await TimeAttendanceApi.addDayComment(dayId, {
        message,
      });

      this.timeAttendanceStore.update(assignmentId, ({ perDays }) => {
        const newPerDays = perDays.map((p) => {
          if (p.id === dayId) {
            return {
              ...p,
              messages: p.messages
                ? [...p.messages, response.data]
                : [response.data],
            };
          }
          return p;
        });
        return { perDays: newPerDays };
      });

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added Comment",
      });
    } catch (error) {
      throw error;
    }
  }

  async updateDayComment(
    dayId: number,
    assignmentId: number,
    message: string,
    messageId: number
  ) {
    try {
      const response = await MessagesApi.updateMessage(messageId, message);

      this.timeAttendanceStore.update(assignmentId, ({ perDays }) => {
        const newPerDays = perDays.map((p) => {
          if (p.id === dayId) {
            return {
              ...p,
              messages: (p.messages || []).map((m) =>
                m.id === messageId ? response.data : m
              ),
            };
          }
          return p;
        });
        return { perDays: newPerDays };
      });

      snackbarService.upsertNotification({
        status: "success",
        message: "Comment Has Been Updated",
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteDayComment(
    dayId: number,
    assignmentId: number,
    messageId: number
  ) {
    try {
      await MessagesApi.deleteMessage(messageId);

      this.timeAttendanceStore.update(assignmentId, ({ perDays }) => {
        const newPerDays = perDays.map((p) => {
          if (p.id === dayId) {
            return {
              ...p,
              messages: (p.messages || []).filter((m) => m.id !== messageId),
            };
          }
          return p;
        });
        return { perDays: newPerDays };
      });

      snackbarService.upsertNotification({
        status: "success",
        message: "Comment Has Been Deleted",
      });
    } catch (error) {
      throw error;
    }
  }

  async updateTimesheetStatus(status: TimesheetStatus) {
    try {
      const periodId = this.timeAttendanceStore.getValue().periodId;
      await TimeAttendanceApi.updateTimesheetStatus(periodId, status);
      applyTransaction(() => {
        this.timeAttendanceStore.update({
          status,
        });
      });
      let message = "";
      switch (status) {
        case TimesheetStatus.PENDING:
          message = "Timesheet Period Has Been Submitted";
          break;
        case TimesheetStatus.REJECTED:
          message = "Timesheet Period Has Been Rejected";
          break;
        case TimesheetStatus.APPROVED:
          message = "Timesheet Period Has Been Approved";
          break;
        default:
          break;
      }
      snackbarService.upsertNotification({
        status: "success",
        message,
      });
    } catch (error) {
      throw error;
    }
  }

  async timesheetClockOut(assigmentTimesheetId: number, dto: ClockOutDto) {
    const now = moment().format("YYYY-MM-DD");
    try {
      await TimeAttendanceApi.timesheetAssignmentClockOut(
        assigmentTimesheetId,
        dto
      );

      this.timeAttendanceStore.update(assigmentTimesheetId, ({ perDays }) => {
        const newPerDays = perDays.map((p) => {
          if (p.date === now) {
            return {
              ...p,
              actualSpentTimeMin: p.actualSpentTimeMin + dto.actualSpentTimeMin,
            };
          }
          return p;
        });
        return { perDays: newPerDays };
      });
      snackbarService.upsertNotification({
        status: "success",
        message: `Successfully tracked ${getTotalFormattedCount(
          dto.actualSpentTimeMin
        )}`,
      });
    } catch (error) {
      throw error;
    }
  }

  // TRACKER METHODS

  getTrackerData(): TrackerLocalStorageData | null {
    const currentUserId = authorizationQuery.getValue().user?.userId;
    const trackerString = localStorage.getItem("tracker");
    // Not Found
    if (!trackerString) return null;

    const trackerData: TrackerLocalStorageData = JSON.parse(trackerString);

    // Another period started
    const now = moment();
    const started = moment(trackerData.startDate).endOf("week");
    if (now.isAfter(started)) {
      this.deleteTrackerData();
      return null;
    }

    // Different User
    if (trackerData.userId !== currentUserId) return null;

    return trackerData;
  }

  saveTrackerData(dto: ClockInDto) {
    const currentUserId = authorizationQuery.getValue().user?.userId;
    localStorage.setItem(
      "tracker",
      JSON.stringify({
        ...dto,
        userId: currentUserId,
      })
    );
  }

  deleteTrackerData() {
    localStorage.removeItem("tracker");
  }

  // ADMIN USERS METHODS

  async getUsersTimesheet(params: GetUsersTimesheetParams) {
    try {
      const response = await TimeAttendanceApi.getUsersTimesheet(params);

      return response.data;
    } catch (error) {}
  }

  async exportTimesheet(params: ExportTimesheetParams) {
    try {
      const response = await TimeAttendanceApi.exportTimesheet(params);
      downloadBlob(
        response,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (error) {
      throw error;
    }
  }
}

export const timeAttendanceService = new TimeAttendanceService(
  timeAttendanceStore
);
