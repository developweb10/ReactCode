import { ApiServiceInstance } from "../api-service";
import {
  TasksFetchParams,
  TasksStatsFetchParams,
  TaskStatsDomain,
  TaskModel,
  TaskAddDtoRequest,
  TaskUpdateDtoRequest,
  TaskStatus,
  TaskPriority,
} from "@models/tasks.models";
import { AddMessageDto, MessageModel } from "@models/message.models";

const PHP_API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;

export class TasksApi {
  static async fetchTasks(params: TasksFetchParams) {
    return await ApiServiceInstance.get<{
      result: TaskModel[];
      total: number;
    }>(`/private/tasks/by-date`, {
      params: {
        ...params,
        page: 0,
        sort: "createdDate,desc",
        size: "MAX_INT",
      },
    });
  }

  static async fetchTasksStats(params: TasksStatsFetchParams) {
    return await ApiServiceInstance.get<TaskStatsDomain>(
      `/private/tasks/stats`,
      {
        params,
      }
    );
  }

  static async addTask(dto: TaskAddDtoRequest) {
    return await ApiServiceInstance.post<TaskModel>(`/private/tasks/`, dto);
  }

  static async updateTaskStatus(taskId: number, taskStatus: TaskStatus) {
    return await ApiServiceInstance.patch<TaskModel>(
      `/private/tasks/${taskId}`,
      {
        taskStatus,
      }
    );
  }

  static async updateTaskPriority(task: TaskModel, priority: TaskPriority) {
    return await TasksApi.updateTask(
      {
        caseId: task.trackerCase?.id,
        hrId: task.to.userId,
        dueDate: task.dueDate,
        note: task.note,
        employeeId: task.employee?.id,
        isNoticeboard: task.isNoticeboard,
        noticeboardTarget: task.noticeboardTarget,
        priority,
      },
      task.id
    );
  }

  static async updateTask(dto: TaskUpdateDtoRequest, taskId: number) {
    return await ApiServiceInstance.put<TaskModel>(
      `/private/tasks/${taskId}`,
      dto
    );
  }
  static async removeTask(taskId: number) {
    return await ApiServiceInstance.delete<TaskModel>(
      `/private/tasks/${taskId}`
    );
  }

  static async addMessage(taskId: number, dto: AddMessageDto) {
    return await ApiServiceInstance.post<MessageModel>(
      `/private/tasks/${taskId}/messages`,
      dto
    );
  }

  static async sendNoticeboardTask(dto: {
    message: string;
    target: "ALL" | "INDIVIDUAL";
    hrId?: number | null;
    hrName?: string;
    dueDate?: string | null;
  }) {
    if (!PHP_API_BASE_URL) return null;

    const targetDisplay =
      dto.target === "ALL"
        ? "To all Noticeboard users"
        : `To Noticeboard user: ${dto.hrName || dto.hrId || "Selected HR"}`;

    const response = await fetch(`${PHP_API_BASE_URL}/send_notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notification_type: "noticeboard_task",
        notification_text: dto.message,
        delivery_status: "sent",
        delivered_by_id: "core_system",
        sendToTarget:
          dto.target === "ALL" ? "allNoticeboardUsers" : `individual-${dto.hrId}`,
        send_to_target_display: targetDisplay,
        driver_id: dto.target === "ALL" ? null : dto.hrId,
        due_date: dto.dueDate || null,
      }),
    });

    return await response.json();
  }
}
