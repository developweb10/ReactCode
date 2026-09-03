import { applyTransaction } from "@datorama/akita";
import {
  CalculatorStore,
  calculatorStore,
} from "./redundancy-calculator.store";
import { CalculatorApi } from "@api/redundancy-calculator/redundancy-calculator.api";
import {
  CalculatorFetchParams,
  EditCalculatorDto,
} from "@models/redundancy-calculator.models";
import { snackbarService } from "@store/snackbar/snackbar.service";

export class CalculatorService {
  constructor(private calculatorStore: CalculatorStore) {}

  async fetchCalculator({
    size = 20,
    page = 1,
    sort = "",
    search = "",
  }: CalculatorFetchParams) {
    this.calculatorStore.setLoading(true);

    try {
      const response = await CalculatorApi.getCalculatorData({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        search,
      });
      applyTransaction(() => {
        this.calculatorStore.set(response.data.result);
        this.calculatorStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
      });
    } catch (error) {
      this.calculatorStore.setLoading(false);
    }
  }
  async addCalculatorRow(employeeId: number) {
    this.calculatorStore.setLoading(true);
    try {
      await CalculatorApi.addCalculatorRow(employeeId);
      this.calculatorStore.setLoading(false);
    } catch (error) {
      this.calculatorStore.setLoading(false);
      throw error;
    }
  }

  async updateCalculatorRow(id: number, dto: EditCalculatorDto) {
    this.calculatorStore.setLoading(true);
    try {
      const res = await CalculatorApi.updateCalculatorRow(id, dto);
      applyTransaction(() => {
        this.calculatorStore.update(id, res.data);
        this.calculatorStore.setLoading(false);
        snackbarService.upsertNotification({
          status: "success",
          message: "Notice Period Has Been Updated",
        });
      });
    } catch (error) {
      this.calculatorStore.setLoading(false);
      throw error;
    }
  }

  async deleteCalculatorRow(id: number) {
    this.calculatorStore.setLoading(true);
    try {
      await CalculatorApi.deleteCalculatorRow(id);
      this.calculatorStore.setLoading(false);
    } catch (error) {
      this.calculatorStore.setLoading(false);
      throw error;
    }
  }

  async deleteAll() {
    this.calculatorStore.setLoading(true);
    try {
      await CalculatorApi.deleteAll();
      snackbarService.upsertNotification({
        status: "success",
        message: "Table Has Been Reset",
      });
      applyTransaction(() => {
        this.calculatorStore.set([]);
        this.calculatorStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.calculatorStore.setLoading(false);
      });
    } catch (error) {
      this.calculatorStore.setLoading(false);
      throw error;
    }
  }
}

export const calculatorService = new CalculatorService(calculatorStore);
