import { EmployeeModel } from "@models/employee.models";

export interface CalculatorFetchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface CalculatorModel extends EmployeeModel {
  employeeId: number;
  statRedWkly?: number;
  weakly?: number;
  redWksDue?: number;
  statRedundancy?: number;
  noticePeriod?: number;
  unworkedNoticePeriod?: number;
  pilon?: number;
  grandTotal?: number;
}

export interface EditCalculatorDto {
  noticePeriod?: number | null;
  unworkedNoticePeriod?: number | null;
}
