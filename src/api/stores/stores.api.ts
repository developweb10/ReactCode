import { ApiServiceInstance } from "../api-service";
import {
  StoreModel,
  StoreFetchParams,
  CreateStoreDto,
  EditStoreDto,
} from "@models/store.models";

export class StoresApi {
  static async fetchStores(params: StoreFetchParams) {
    return await ApiServiceInstance.get<{
      result: StoreModel[];
      total: number;
    }>(`/private/store-details/`, {
      params,
    });
  }

  static async createStore(dto: CreateStoreDto) {
    return await ApiServiceInstance.post("/private/store-details", dto);
  }
  static async editStore(dto: EditStoreDto, id: number) {
    return await ApiServiceInstance.put<StoreModel>(
      `/private/store-details/${id}`,
      dto
    );
  }
  static async deleteStore(id: number) {
    return await ApiServiceInstance.delete(`/private/store-details/${id}`);
  }
}
