import { applyTransaction } from "@datorama/akita";
import { CalendarStore, calendarStore } from "./calendar.store";
import { RequestsApi } from "@api/requests/requests.api";

import { FetchCalendarRequestsParams } from "@models/calendar.models";

import { CreateRequestReqDto } from "@models/requests.models";

import { snackbarService } from "@store/snackbar/snackbar.service";

import { getDuration } from "@utils/date/get-duration";

export class CalendarService {
  constructor(private calendarStore: CalendarStore) {}

  async fetchRequests(params: FetchCalendarRequestsParams) {
    this.calendarStore.setLoading(true);
    try {
      const res = await RequestsApi.getCalendarRequests(params);
      applyTransaction(() => {
        this.calendarStore.set(res.data);
        this.calendarStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.calendarStore.setLoading(false);
        this.calendarStore.setError({ text: "Unable to load data" });
      });
    }
  }

  async createRequest(newRequestData: CreateRequestReqDto) {
    try {
      const res = await RequestsApi.addNewRequest(newRequestData);
      const newRequest = res.data;
      const duration =
        getDuration(newRequest.startDate, newRequest.endDate) + 1;

      const createdRequest = {
        requestId: newRequest.id,
        type: newRequest.requestType,
        days: duration,
        notes: newRequest.notes,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        status: newRequest.status,
        userId: newRequest.user.userId,
      };

      this.calendarStore.add(createdRequest);

      snackbarService.upsertNotification({
        status: "success",
        message: `Successfully added your request`,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        throw error;
      }
    }
  }
}

export const calendarService = new CalendarService(calendarStore);
