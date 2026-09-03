import { UserModel } from "./users.models";
export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum RequestType {
  HOLIDAY = "HOLIDAY",
  SICKNESS = "SICKNESS",
}

export interface RequestDto {
  startDate: string;
  endDate: string;
  type: RequestType;
  notes?: string;
}

export interface RequestResponseDto {
  id: number;
  startDate: string;
  endDate: string;
  requestType: RequestType;
  status: RequestStatus;
  notes?: string;
  user: UserModel;
  rejectedReason?: string;
  dateOfCreation: string;
}
export interface CreateRequestReqDto extends RequestDto {}
export interface CreateRequestResponseDto extends RequestResponseDto {}

export interface UpdateRequestReqDto extends RequestDto {
  id: number;
  status: RequestStatus;
}

export interface UpdateRequestResponseDto extends RequestResponseDto {}
export interface UpdateStatusRequestReqDto {
  rejectedReason?: string;
  status: RequestStatus;
}
export interface FetchRequestsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface RequestModel extends RequestResponseDto {}
