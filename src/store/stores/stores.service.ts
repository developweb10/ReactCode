import { applyTransaction } from "@datorama/akita";
import { StoresStore, storesStore } from "./stores.store";
import { employeesStore, EmployeesStore } from "../employees/employees.store";
import { StoresApi } from "@api/stores/stores.api";
import {
  StoreFetchParams,
  CreateStoreDto,
  EditStoreDto,
} from "@models/store.models";

import { snackbarService } from "@store/snackbar/snackbar.service";
export class StoresService {
  constructor(
    private storesStore: StoresStore,
    private employeesStore: EmployeesStore
  ) {}

  async fetchStores({
    size = 20,
    page = 1,
    sort = "",
    search = "",
    ...rest
  }: StoreFetchParams) {
    this.storesStore.setLoading(true);
    try {
      const response = await StoresApi.fetchStores({
        size,
        page: page - 1,
        sort,
        search,
        ...rest,
      });
      applyTransaction(() => {
        this.storesStore.set(response.data.result);
        this.storesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.storesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.storesStore.setLoading(false);
        this.storesStore.setError({ text: "Unable to load data" });
      });
    }
  }

  async createStore(dto: CreateStoreDto) {
    try {
      await StoresApi.createStore(dto);

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added Location",
      });
    } catch (error) {
      throw error;
    }
  }

  async editStore(dto: EditStoreDto, id: number) {
    try {
      const { data: updatedStore } = await StoresApi.editStore(dto, id);
      this.storesStore.replace(id, updatedStore);

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Updated Location",
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteStore(id: number) {
    try {
      await StoresApi.deleteStore(id);
    } catch (error) {
      throw error;
    }
  }
}

export const storesService = new StoresService(storesStore, employeesStore);
