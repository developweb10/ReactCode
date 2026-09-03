import { QueryEntity, combineQueries } from "@datorama/akita";

import { tasksStore, TasksState, TasksStore } from "./tasks.store";

export class TasksQuery extends QueryEntity<TasksState> {
  loading$ = this.selectLoading();

  newTasksCount$ = this.select((state) => state.newTasksCount);

  tasks$ = this.selectAll();

  taskStats$ = this.select((state) => {
    return {
      completedTasks: state.stats.completedTasks,
      totalTasks: state.stats.totalTasks,
    };
  });

  refetchRequired$ = this.select((state) => state.refetchRequired);

  tasksState$ = combineQueries([this.tasks$, this.loading$]);

  constructor(protected store: TasksStore) {
    super(store);
  }
}

export const tasksQuery = new TasksQuery(tasksStore);
