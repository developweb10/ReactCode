import { RequestsStore, requestsStore } from "./requests.store";
import { CalendarStore, calendarStore } from "@store/calendar/calendar.store";
import { applyTransaction } from "@datorama/akita";
import { RequestsApi } from "@api/requests/requests.api";
import {
  FetchRequestsParams,
  UpdateStatusRequestReqDto,
  UpdateRequestReqDto,
} from "@models/requests.models";

import { snackbarService } from "@store/snackbar/snackbar.service";
import { getDuration } from "@utils/date/get-duration";

export class RequestsService {
  constructor(
    private requestsStore: RequestsStore,
    private calendarStore: CalendarStore
  ) {}

  async fetchRequests({ size = 20, sort, page = 1 }: FetchRequestsParams) {
    this.requestsStore.setLoading(true);
    try {
      const res = await RequestsApi.getRequests({
        size,
        sort: sort || "id,desc",
        page: page - 1,
      });
      applyTransaction(() => {
        this.requestsStore.set(res.data.result);
        this.requestsStore.update({
          ui: {
            pagesCount: Math.ceil(res.data.total / size),
          },
          total: res.data.total,
        });
        this.requestsStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.requestsStore.setLoading(false);
      });
    }
  }

  async updateRequestStatus(id: number, dto: UpdateStatusRequestReqDto) {
    try {
      await RequestsApi.updateRequestStatus(dto, id);
      applyTransaction(() => {
        this.requestsStore.update(id, { ...dto });
      });

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Changed Request Status",
      });
    } catch (error) {
      applyTransaction(() => {
        this.requestsStore.setError({ text: "Update Error" });
      });
      throw error;
    }
  }

  async deleteRequest(id: number) {
    try {
      await RequestsApi.deleteRequest(id);
      applyTransaction(() => {
        this.calendarStore.remove(id);
      });
    } catch (error) {
      applyTransaction(() => {
        this.requestsStore.setError({ text: "Update Error" });
      });
      throw error;
    }
  }

  async editRequest(dto: UpdateRequestReqDto, id: number) {
    try {
      const { data: updatedRequest } = await RequestsApi.editRequest(dto, id);

      applyTransaction(() => {
        this.requestsStore.update(id, updatedRequest);
        this.calendarStore.update(id, (entity) => {
          return {
            ...entity,
            startDate: updatedRequest.startDate,
            endDate: updatedRequest.endDate,
            notes: updatedRequest.notes,
            status: updatedRequest.status,
            days:
              getDuration(updatedRequest.startDate, updatedRequest.endDate) + 1,
          };
        });
      });
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Updated Request",
      });
    } catch (error) {
      throw error;
    }
  }
}

export const requestsService = new RequestsService(
  requestsStore,
  calendarStore
);
