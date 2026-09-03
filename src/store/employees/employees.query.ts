import { QueryEntity, combineQueries } from "@datorama/akita";

import {
  EmployeesState,
  EmployeesStore,
  employeesStore,
} from "./employees.store";

export class EmployeesQuery extends QueryEntity<EmployeesState> {
  loading$ = this.selectLoading();

  employeesState$ = combineQueries([
    this.selectAll(),
    this.select((state) => ({
      total: state.total,
      pagesCount: state.ui.pagesCount,
    })),
  ]);

  constructor(protected store: EmployeesStore) {
    super(store);
  }
}

export const employeesQuery = new EmployeesQuery(employeesStore);
