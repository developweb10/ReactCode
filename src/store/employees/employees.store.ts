import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import { EmployeeModel } from "@models/employee.models";

export interface EmployeesState extends EntityState<EmployeeModel, number> {
  total: number;
  ui: {
    pagesCount: number;
  };
}

const initialState = {
  ui: { pagesCount: 0 },
  total: 0,
};

@StoreConfig({ name: "employees", idKey: "id" })
export class EmployeesStore extends EntityStore<EmployeesState> {
  constructor() {
    super(initialState);
  }
}

export const employeesStore = new EmployeesStore();
