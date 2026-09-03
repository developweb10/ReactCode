import { ApiServiceInstance } from "../api-service";
import {
  DistrictManagerModel,
  HrManagerModel,
  RegionalManagerModel,
  PrimaryLineManagerModel,
  SecondaryLineManagerModel,
} from "@models/managers.models";

export class ManagersApi {
  static async fetchRegionalManagers(search?: string) {
    return await ApiServiceInstance.get<RegionalManagerModel[]>(
      `/private/regional-managers/`,
      { params: { search } }
    );
  }

  static async fetchHrManagers(search?: string) {
    return await ApiServiceInstance.get<HrManagerModel[]>(
      `/private/hr-managers/`,
      { params: { search } }
    );
  }
  static async fetchDistrictManagers(search?: string) {
    return await ApiServiceInstance.get<DistrictManagerModel[]>(
      `/private/district-managers/`,
      { params: { search } }
    );
  }

  static async fetchPrimaryLineManagers(search?: string) {
    return await ApiServiceInstance.get<PrimaryLineManagerModel[]>(
      `/private/primary-line-managers/`,
      { params: { search } }
    );
  }
  static async fetchSecondaryLineManagers(search?: string) {
    return await ApiServiceInstance.get<SecondaryLineManagerModel[]>(
      `/private/secondary-line-managers/`,
      { params: { search } }
    );
  }
}
