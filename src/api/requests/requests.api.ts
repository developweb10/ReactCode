import { ApiServiceInstance } from "../api-service";
import {
  CalendarResponseDto,
  FetchCalendarRequestsParams,
} from "@models/calendar.models";

import {
  CreateRequestReqDto,
  CreateRequestResponseDto,
  UpdateRequestReqDto,
  UpdateRequestResponseDto,
  UpdateStatusRequestReqDto,
  FetchRequestsParams,
  RequestModel,
} from "@models/requests.models";

export class RequestsApi {
  static async getRequests(params?: FetchRequestsParams) {
    return await ApiServiceInstance.get<{
      result: RequestModel[];
      total: number;
    }>(`/private/requests`, {
      params,
    });
  }
  static async addNewRequest(dto: CreateRequestReqDto) {
    return await ApiServiceInstance.post<CreateRequestResponseDto>(
      "/private/requests",
      dto
    );
  }

  static async updateRequestStatus(dto: UpdateStatusRequestReqDto, id: number) {
    return await ApiServiceInstance.patch(
      `/private/requests/${id}/status`,
      dto
    );
  }

  static async editRequest(dto: UpdateRequestReqDto, id: number) {
    return await ApiServiceInstance.put<UpdateRequestResponseDto>(
      `/private/requests/${id}`,
      dto
    );
  }

  static async deleteRequest(id: number) {
    return await ApiServiceInstance.delete(`/private/requests/${id}`);
  }

  static async getCalendarRequests(params: FetchCalendarRequestsParams) {
    return await ApiServiceInstance.get<CalendarResponseDto[]>(
      `/private/requests/calendar`,
      { params }
    );
  }
}
