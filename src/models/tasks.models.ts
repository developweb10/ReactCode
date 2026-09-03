import { UserModel } from "./users.models";
import { CaseTableModel } from "./cases.models";
import { MessageModel } from "./message.models";
import { EmployeeModel } from "./employee.models";

export enum TaskType {
  CREATED_BY_ME = "CREATED_BY_ME",
  CREATED_TO_ME = "CREATED_TO_ME",
}

export enum TaskStatus {
  INCOMPLETE = "INCOMPLETE",
  COMPLETED = "COMPLETED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface TaskModel {
  id: number;
  trackerCase?: CaseTableModel;
  to: UserModel;
  from: UserModel;
  note?: string;
  taskStatus: TaskStatus;
  priority?: TaskPriority;
  completedDate?: string;
  createdDate: string;
  dueDate: string;
  isNew: boolean;
  isNoticeboard?: boolean;
  noticeboardTarget?: "ALL" | "INDIVIDUAL";
  messages: MessageModel[];
  employee?: EmployeeModel;
}

export interface TaskStatsDomain {
  totalTasks: number;
  completedTasks: number;
}

export interface TasksFetchParams {
  taskType: TaskType;
  // 2021-04-15 format : YYYY-MM-DD
  date: string;
}

export interface TasksStatsFetchParams {
  // 2021-04-15 format : YYYY-MM-DD
  fromDate: string;
  toDate: string;
}

export interface TaskAddDtoRequest {
  caseId?: number;
  hrId: number;
  dueDate?: string;
  note?: string;
  employeeId?: number;
  messages?: string[];
  messageDtos?: {
    message: string;
    attachmentIds?: number[];
  }[];
  isNoticeboard?: boolean;
  noticeboardTarget?: "ALL" | "INDIVIDUAL";
  priority?: TaskPriority;
}

export interface TaskUpdateDtoRequest {
  caseId?: number;
  hrId: number;
  dueDate?: string;
  note?: string;
  employeeId?: number;
  isNoticeboard?: boolean;
  noticeboardTarget?: "ALL" | "INDIVIDUAL";
  priority?: TaskPriority;
}
