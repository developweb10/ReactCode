import { ApiServiceInstance } from "../api-service";
import {
  EmployeeModel,
  EmployeeFetchParams,
  EmployeeCreateDto,
  EmployeeEditDto,
  EmployeeGetUniqueFieldsDto,
} from "@models/employee.models";

export class EmployeesApi {
  static async fetchEmployees(params: EmployeeFetchParams) {
    return await ApiServiceInstance.get<{
      result: EmployeeModel[];
      total: number;
    }>("/private/employees", {
      params,
    });
  }

  static async uploadEmployees(formData: FormData) {
    return await ApiServiceInstance.post("/private/employees/upload", formData);
  }

  static async createEmployee(dto: EmployeeCreateDto) {
    return ApiServiceInstance.post("/private/employees", dto);
  }

  static async editEmployee(dto: EmployeeEditDto, id: number) {
    return ApiServiceInstance.put<EmployeeModel>(
      `/private/employees/${id}`,
      dto
    );
  }

  static async getUniqueFields(params: EmployeeGetUniqueFieldsDto) {
    return ApiServiceInstance.get<{
      result: { value: string }[];
      total: number;
    }>(`/private/employee-unique_fields`, { params });
  }

  static async deleteEmployee(id: number) {
    return ApiServiceInstance.delete(`/private/employees/${id}`);
  }

  static async getNationalities() {
    return await ApiServiceInstance.get<string[]>("/private/nationalities");
  }

  static async getCountries() {
    return await ApiServiceInstance.get<string[]>("/private/countries");
  }
  static async getRelationships() {
    return await ApiServiceInstance.get<string[]>("/private/relationships");
  }

  static async getJobTitle(search?: string) {
    return await ApiServiceInstance.get<string[]>("/private/job-titles", {
      params: { search },
    });
  }
  static async getJobSpecifications() {
    return await ApiServiceInstance.get<string[]>(
      "/private/job-specifications"
    );
  }

  static async getEthnicities() {
    return await ApiServiceInstance.get<string[]>("/private/ethnicities");
  }

  static async getFunctions() {
    return await ApiServiceInstance.get<string[]>("/private/functions");
  }
  static async getEmploymentStatuses() {
    return await ApiServiceInstance.get<string[]>(
      "/private/employment-statuses"
    );
  }
  static async getDepartments() {
    return await ApiServiceInstance.get<string[]>("/private/departments");
  }

  static async getContractDetails() {
    return await ApiServiceInstance.get<string[]>("/private/contract-details");
  }
}
