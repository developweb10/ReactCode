import { EmployeeModel } from "@models/employee.models";
import { TableColumn } from "@components/table/types";
import { FilterEntity } from "@components/filter/types";

export type EmployeesTableColumns = TableColumn<EmployeeModel>[];

export interface IEmployeesFilters {
  employeeIdsFilter: FilterEntity<number>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  positionsFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  storeNumbersFilter: FilterEntity<number>;
  startDatesFilter: FilterEntity<string>;
  leaveDatesFilter: FilterEntity<string>;
}
