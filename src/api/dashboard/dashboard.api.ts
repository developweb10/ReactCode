import { ApiServiceInstance } from "../api-service";
import {
  DashboardDto,
  CasesByManagerStatisticDto,
  GetCaseNumberParams,
  CasesByDateStatisticDto,
  FleetVehiclePayload,
  FleetVehiclesResponse,
} from "@models/dashboard.models";

const PHP_API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;

export class DashboardApi {
  static async getStats() {
    return await ApiServiceInstance.get<DashboardDto>("/private/stats", {
      params: { personal: false },
    });
  }
  static async getRegionalManagerStats(districtManagerIds: number[]) {
    return await ApiServiceInstance.get<CasesByManagerStatisticDto>(
      "/private/stats/regional-managers",
      {
        params: { districtManagerId: districtManagerIds },
      }
    );
  }
  static async getDistrictManagerStats(districtManagerIds: number[]) {
    return await ApiServiceInstance.get<CasesByManagerStatisticDto>(
      "/private/stats/district-managers",
      {
        params: { districtManagerId: districtManagerIds },
      }
    );
  }

  static async getCasesNumber(params: GetCaseNumberParams) {
    return await ApiServiceInstance.get<CasesByDateStatisticDto>(
      "/private/stats/n-cases",
      {
        params,
      }
    );
  }

  static async getFleetVehicles(): Promise<FleetVehiclesResponse> {
    const response = await fetch(`${PHP_API_BASE_URL}/admin_vehicles_list`);
    return await response.json();
  }

  static async addFleetVehicle(vehicle: FleetVehiclePayload) {
    const response = await fetch(`${PHP_API_BASE_URL}/add_vehicle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehicle),
    });
    return await response.json();
  }

  static async updateFleetVehicle(vehicle: FleetVehiclePayload) {
    const response = await fetch(`${PHP_API_BASE_URL}/update_vehicle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vehicle),
    });
    return await response.json();
  }

  static async deactivateFleetVehicle(vehicleNumber: string) {
    const response = await fetch(`${PHP_API_BASE_URL}/delete_vehicle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vehicle_number: vehicleNumber }),
    });
    return await response.json();
  }
}
