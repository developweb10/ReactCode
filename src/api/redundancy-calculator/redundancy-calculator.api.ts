import { ApiServiceInstance } from "../api-service";

import {
  CalculatorModel,
  CalculatorFetchParams,
  EditCalculatorDto,
} from "@models/redundancy-calculator.models";

export class CalculatorApi {
  static async getCalculatorData(params: CalculatorFetchParams) {
    return await ApiServiceInstance.get<{
      result: CalculatorModel[];
      total: number;
    }>(`/private/redundancy-calculator/`, { params });
  }

  static async addCalculatorRow(employeeId: number) {
    return await ApiServiceInstance.post<CalculatorModel>(
      `/private/redundancy-calculator/`,
      { employeeId }
    );
  }

  static async updateCalculatorRow(id: number, dto: EditCalculatorDto) {
    return await ApiServiceInstance.put<CalculatorModel>(
      `/private/redundancy-calculator/${id}`,
      dto
    );
  }

  static async deleteCalculatorRow(id: number) {
    return await ApiServiceInstance.delete(
      `/private/redundancy-calculator/${id}`
    );
  }

  static async deleteAll() {
    return await ApiServiceInstance.delete(`/private/redundancy-calculator`);
  }
}
