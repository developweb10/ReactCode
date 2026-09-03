import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import { TaskModel, TaskStatsDomain } from "@models/tasks.models";

export interface TasksState extends EntityState<TaskModel, number> {
  total: number;
  stats: TaskStatsDomain;
  newTasksCount: number;
  refetchRequired: boolean;
}

const initialState = {
  total: 0,
  stats: {
    totalTasks: 0,
    completedTasks: 0,
  },
  newTasksCount: 0,
  refetchRequired: false,
};

@StoreConfig({ name: "tasks", idKey: "id" })
export class TasksStore extends EntityStore<TasksState> {
  constructor() {
    super(initialState);
  }
}

export const tasksStore = new TasksStore();
