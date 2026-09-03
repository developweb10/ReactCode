import { applyTransaction } from "@datorama/akita";
import { EmployeesStore, employeesStore } from "./employees.store";
import { EmployeesApi } from "@api/employees/employees.api";
import { FilesApi } from "@api/files/files.api";
import {
  EmployeeFetchParams,
  EmployeeType,
  EmployeeCreateDto,
  EmployeeEditDto,
} from "@models/employee.models";
import { snackbarService } from "@store/snackbar/snackbar.service";

export class EmployeesService {
  constructor(private employeesStore: EmployeesStore) {}
  async fetchEmployees({
    size = 20,
    page = 1,
    sort = "",
    search = "",
    employeeType,
    ...rest
  }: EmployeeFetchParams) {
    this.employeesStore.setLoading(true);

    try {
      const response = await EmployeesApi.fetchEmployees({
        size,
        page: page - 1,
        sort,
        search,
        employeeType,
        ...rest,
      });
      applyTransaction(() => {
        this.employeesStore.set(response.data.result);
        this.employeesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
      });
    } catch (error) {
      applyTransaction(() => {
        this.employeesStore.set([]);
        this.employeesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.employeesStore.setLoading(false);
      });
    }
  }

  async uploadEmployees(formData: FormData) {
    try {
      await EmployeesApi.uploadEmployees(formData);
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully uploaded employees",
      });

      this.fetchEmployees({
        employeeType: EmployeeType.EMPLOYEED,
      });
    } catch (error) {
      throw error;
    }
  }

  async createEmployee(formData: EmployeeCreateDto, avatarData?: FormData) {
    try {
      let avatarId;
      if (avatarData) {
        const newAvatarId = await this.uploadAvatar(avatarData);
        avatarId = newAvatarId;
      }
      formData.avatarId = avatarId;
      await EmployeesApi.createEmployee(formData);
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added  New Employee",
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(avatarData: FormData) {
    try {
      const fileRes = await FilesApi.uploadFile(avatarData);
      return fileRes.data.id;
    } catch (error) {
      throw error;
    }
  }

  async editEmployee(formData: EmployeeEditDto, id: number) {
    try {
      const response = await EmployeesApi.editEmployee(formData, id);
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Updated Employee",
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteEmployee(id: number) {
    try {
      await EmployeesApi.deleteEmployee(id);
    } catch (error) {
      throw error;
    }
  }
}

export const employeesService = new EmployeesService(employeesStore);
