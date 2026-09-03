import {
  applyTransaction,
  arrayAdd,
  arrayUpdate,
  arrayRemove,
} from "@datorama/akita";
import { TasksStore, tasksStore } from "./tasks.store";
import { authorizationQuery } from "../authorization/authorization.query";
import { TasksApi } from "@api/tasks/tasks.api";

import { MessagesApi } from "@api/messages/messages.api";
import {
  TaskModel,
  TasksFetchParams,
  TaskStatus,
  TaskPriority,
  TasksStatsFetchParams,
  TaskAddDtoRequest,
  TaskUpdateDtoRequest,
} from "@models/tasks.models";

import { AddMessageDto } from "@models/message.models";

import { snackbarService } from "@store/snackbar/snackbar.service";
import { storeTaskPriority } from "@utils/task-priority-storage";

export class TasksService {
  constructor(private tasksStore: TasksStore) {}

  async initialFetchTasks(params: TasksFetchParams) {
    this.tasksStore.setLoading(true);

    try {
      const response = await TasksApi.fetchTasks(params);

      const total = response.data.total;

      let newCounter = 0;

      response.data.result.forEach((task) => {
        if (task.isNew) {
          newCounter++;
        }
        const newMessagesCount = task.messages
          ? task.messages.filter((m) => m.isNew).length
          : 0;

        newCounter += newMessagesCount;
      });

      applyTransaction(() => {
        this.tasksStore.set(response.data.result);
        this.tasksStore.update((state) => ({
          ...state,
          total,
          newTasksCount: state.newTasksCount - newCounter,
        }));
        this.tasksStore.setLoading(false);
      });
    } catch (error) {
      this.tasksStore.setLoading(false);
    }
  }

  async fetchTasksStats(params: TasksStatsFetchParams) {
    try {
      const response = await TasksApi.fetchTasksStats(params);
      applyTransaction(() => {
        this.tasksStore.update({
          stats: response.data,
        });
        this.tasksStore.setLoading(false);
      });
    } catch (error) {
      this.tasksStore.setLoading(false);
    }
  }

  async fetchTasksAndStats({
    date,
    taskType,
    fromDate,
    toDate,
  }: TasksFetchParams & TasksStatsFetchParams) {
    try {
      this.tasksStore.update((state) => ({
        refetchRequired: false,
      }));

      const tasksReq = TasksApi.fetchTasks({ date, taskType });
      const statsReq = TasksApi.fetchTasksStats({ fromDate, toDate });

      const tasksRes = await tasksReq;
      const statsRes = await statsReq;

      let newCounter = 0;
      const { entities } = this.tasksStore.getValue();

      const newTasks = tasksRes.data.result;

      const smartMergedTasks = newTasks.map((nextTask) => {
        if (nextTask.isNew) {
          newCounter++;
        }
        const returnedTask = { ...nextTask };
        if (entities && entities[nextTask.id]) {
          const currentTask = entities[nextTask.id];
          if (currentTask.isNew && !nextTask.isNew) {
            returnedTask.isNew = true;
          }

          const currentNewMessages: { [key: number]: number } = {};
          const currentTaskMsgs = currentTask.messages;

          if (currentTaskMsgs) {
            currentTaskMsgs.forEach((m) => {
              if (m.isNew) {
                currentNewMessages[m.id] = m.id;
              }
            });
          }

          if (nextTask.messages) {
            returnedTask.messages = nextTask.messages.map((m) => {
              if (m.isNew) {
                newCounter++;
              }
              const newMessage = { ...m };
              if (currentNewMessages[m.id] && !m.isNew) {
                newMessage.isNew = true;
              }
              return newMessage;
            });
          }
        }
        return returnedTask;
      });

      applyTransaction(() => {
        this.tasksStore.set(smartMergedTasks);
        this.tasksStore.update((state) => ({
          stats: statsRes.data,
          total: tasksRes.data.total,
          newTasksCount: state.newTasksCount - newCounter,
        }));
      });
    } catch (error) {}
  }

  removeNewFromTask(taskId: number) {
    this.tasksStore.update(taskId, {
      isNew: false,
    });
  }

  removeNewFromTaskMessages(taskId: number) {
    this.tasksStore.update(taskId, ({ messages }) => ({
      messages: arrayUpdate(messages, (m) => m.isNew, { isNew: false }),
    }));
  }

  async completeTask(task: TaskModel) {
    this.tasksStore.setLoading(true);
    try {
      await TasksApi.updateTaskStatus(task.id, TaskStatus.COMPLETED);
      const currentUser = authorizationQuery.getValue().user!;
      const taskIsAssignedToMe = currentUser.userId === task.to.userId;
      const completedMultiplier = taskIsAssignedToMe ? 1 : 0;
      applyTransaction(() => {
        this.tasksStore.update(task.id, {
          taskStatus: TaskStatus.COMPLETED,
          completedDate: new Date().toISOString(),
          isNew: false,
        });
        this.tasksStore.update((state) => {
          return {
            ...state,
            stats: {
              ...state.stats,
              completedTasks:
                state.stats.completedTasks + 1 * completedMultiplier,
            },
          };
        });
        this.tasksStore.setLoading(false);
      });
      snackbarService.upsertNotification({
        status: "success",
        message: "Task Has Been Completed",
      });
    } catch (error) {
      this.tasksStore.setLoading(false);
      throw error;
    }
  }

  async updateTaskPriority(task: TaskModel, priority: TaskPriority) {
    try {
      const response = await TasksApi.updateTaskPriority(task, priority);
      this.tasksStore.update(task.id, response.data);
      storeTaskPriority(task.id, priority);
      snackbarService.upsertNotification({
        status: "success",
        message: "Task Priority Has Been Updated",
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createTask(dto: TaskAddDtoRequest) {
    this.tasksStore.setLoading(true);
    try {
      const response = await TasksApi.addTask(dto);
      storeTaskPriority(response.data.id, dto.priority);
      if (dto.isNoticeboard) {
        await TasksApi.sendNoticeboardTask({
          message: dto.note || "New Noticeboard task",
          target: dto.noticeboardTarget || "INDIVIDUAL",
          hrId: dto.hrId,
          dueDate: dto.dueDate || null,
        });
      }
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Created New Task",
      });

      const currentUser = authorizationQuery.getValue().user!;
      const taskIsAssignedToMe = currentUser.userId === response.data.to.userId;
      const totalMultiplier = taskIsAssignedToMe ? 1 : 0;

      applyTransaction(() => {
        this.tasksStore.update((state) => {
          return {
            ...state,
            total: state.total + 1,
            stats: {
              totalTasks: state.stats.totalTasks + 1 * totalMultiplier,
              completedTasks: state.stats.completedTasks,
            },
          };
        });
        this.tasksStore.setLoading(false);
      });
      this.tasksStore.setLoading(false);
    } catch (error) {
      this.tasksStore.setLoading(false);
      throw error;
    }
  }

  async updateTask(dto: TaskUpdateDtoRequest, taskId: number) {
    try {
      const response = await TasksApi.updateTask(dto, taskId);
      storeTaskPriority(taskId, dto.priority);

      this.tasksStore.replace(taskId, response.data);

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Updated Case",
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removeTask(task: TaskModel) {
    this.tasksStore.setLoading(true);
    try {
      await TasksApi.removeTask(task.id);
      const currentUser = authorizationQuery.getValue().user!;
      const taskIsAssignedToMe = currentUser.userId === task.to.userId;
      const completedMultiplier =
        task.taskStatus === TaskStatus.COMPLETED && taskIsAssignedToMe ? 1 : 0;

      const totalMultiplier = taskIsAssignedToMe ? 1 : 0;

      applyTransaction(() => {
        this.tasksStore.remove(task.id);
        this.tasksStore.update((state) => {
          return {
            ...state,
            total: state.total - 1,
            stats: {
              totalTasks: state.stats.totalTasks - 1 * totalMultiplier,
              completedTasks:
                state.stats.completedTasks - 1 * completedMultiplier,
            },
          };
        });
        this.tasksStore.setLoading(false);
      });
    } catch (error) {
      this.tasksStore.setLoading(false);
      throw error;
    }
  }

  async addMessage(taskId: number, dto: AddMessageDto) {
    try {
      const response = await TasksApi.addMessage(taskId, dto);
      this.tasksStore.update(taskId, ({ messages }) => ({
        messages: arrayAdd(messages, response.data, { prepend: true }),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added Message",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(id: number, taskId: number) {
    try {
      await MessagesApi.deleteMessage(id);
      this.tasksStore.update(taskId, ({ messages }) => ({
        messages: arrayRemove(messages, id),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Message Has Been Deleted",
      });
    } catch (error) {
      throw error;
    }
  }

  async updateMessage(id: number, message: string, taskId: number) {
    try {
      const response = await MessagesApi.updateMessage(id, message);
      this.tasksStore.update(taskId, ({ messages }) => ({
        messages: arrayUpdate(messages, id, response.data),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Message Has Been Updated",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const tasksService = new TasksService(tasksStore);
