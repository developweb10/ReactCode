import { RequestType, RequestStatus } from "./requests.models";

export interface ISelectedDate {
  month: number;
  year: number;
}

export interface IMonthInfo {
  daysCount: number;
  firstDayWeekday: number;
}

export interface FetchCalendarRequestsParams {
  year: number;
  month: number;
}
export interface CalendarResponseDto {
  days: number;
  endDate: string;
  notes?: string;
  requestId: number;
  startDate: string;
  status: RequestStatus;
  type: RequestType;
  userId: number;
}

export interface CalendarRequestModel extends CalendarResponseDto {}

export interface ICalendarUserRequest extends CalendarRequestModel {
  startDay: number;
  endDay: number;
}

export interface ICalendarUserRequests {
  [key: number]: ICalendarUserRequest;
}

export interface ICalendarUserRequestWithDate extends ICalendarUserRequest {
  requestDayNumber: number;
  requestFullDate: string;
}
