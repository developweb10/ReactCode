const PHP_API_BASE_URL =
  process.env.REACT_APP_PHP_BASE_URL;

export interface SchedulingDriver {
  id: number;
  first_name: string;
  middle_name?: string | null;
  surname: string;
  availability_start_time?: string | null;
  availability_end_time?: string | null;
  availability_confirmed_time?: string | null;
  is_driver_confirmed?: string | boolean | null;
  availability_id?: number;
}

interface DriversResponse {
  status: number;
  message?: string;
  drivers: SchedulingDriver[];
}

export interface SchedulingVehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_rph: string;
  vehicle_nos: string;
  vehicle_status: string;
}

interface VehiclesResponse {
  status: number;
  message?: string;
  vehicles: SchedulingVehicle[];
}

export interface SchedulingServiceType {
  id?: number | string;
  service_id?: number | string;
  service_name?: string;
  name?: string;
  abbreviation?: string;
  abbrev?: string;
  no_of_drivers?: number | string;
  quota?: number | string;
  total?: number | string;
  wave_ids?: string | number[];
}

export interface ServiceTypesResponse {
  status?: number;
  message?: string;
  service_types?: SchedulingServiceType[];
  data?: SchedulingServiceType[];
}

export class SchedulingApi {
  static async getAvailableDrivers(
    date?: string,
    signal?: AbortSignal,
  ): Promise<DriversResponse> {
    const url = date
      ? `${PHP_API_BASE_URL}/available_drivers?start_date=${date}`
      : `${PHP_API_BASE_URL}/available_drivers`;
    const response = await fetch(url, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Drivers request failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async getStandbyDrivers(
    date?: string,
    signal?: AbortSignal,
  ): Promise<DriversResponse> {
    const url = date
      ? `${PHP_API_BASE_URL}/standby_drivers?start_date=${date}`
      : `${PHP_API_BASE_URL}/standby_drivers`;
    const response = await fetch(url, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Standby drivers request failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async getVehicles(date?: string, signal?: AbortSignal): Promise<VehiclesResponse> {
    const url = date
      ? `${PHP_API_BASE_URL}/active_vehicles_list?start_date=${date}`
      : `${PHP_API_BASE_URL}/active_vehicles_list`;
    const response = await fetch(url, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Vehicles request failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async getServiceTypes(signal?: AbortSignal): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/list_service_types`, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Service types request failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

   static async getAllDrivers(signal?: AbortSignal): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/all_drivers`, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Service types request failed with status ${response.status}`,
      );
    }

    return await response.json();
  }	

  static async addStandbyDriver(
    availability_id: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/add_standby_driver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ availability_id }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Add standby driver failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async removeStandbyDriver(
    availability_id: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/remove_standby_driver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ availability_id }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Remove standby driver failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async getServiceTypeById(
    serviceId: number | string,
    date?: string,
    signal?: AbortSignal,
  ): Promise<any> {
    const url = date
      ? `${PHP_API_BASE_URL}/service_type/${serviceId}/${date}`
      : `${PHP_API_BASE_URL}/service_type/${serviceId}`;
    const response = await fetch(url, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Get service type by ID failed with status ${response.status}`,
      );
    }

    return await response.json();
  }


  static async addServiceType(
    payload: {
      service_name: string;
      no_of_drivers: number;
      wave_ids: string;
      abbreviation: string;
    },
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/add_service_type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Add service type failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async updateServiceType(
    payload: {
      service_id: number | string;
      service_name: string;
      no_of_drivers: number;
      wave_ids: string;
      abbreviation: string;
    },
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/update_service_type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Update service type failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async deleteServiceType(
    service_id: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/delete_service_type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ service_id }),
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Delete service type failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async addServiceTypeWavesDrivers(
    payload: {
      service_id: number | string;
      wave_id: number | string;
      driver_ids: number[];
      service_date?: string;
    },
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/add_service_type_waves_drivers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Add service type waves drivers failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async assignDriverVehicle(
    payload: {
      vehicle_id: number | string;
      driver_id: number | string;
      assignd_date: string;
    },
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/assign_driver_vehicle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Assign driver vehicle failed with status ${response.status}`);
    }

    return await response.json();
  }

  static async removeServiceTypeWavesDriver(
    id: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(
      `${PHP_API_BASE_URL}/remove_service_type_waves_driver/${id}`,
      {
        method: "GET",
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Remove service type waves driver failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async removeDriverVehicle(
    id: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(
      `${PHP_API_BASE_URL}/removed_driver_vehicle/${id}`,
      {
        method: "GET",
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Remove driver vehicle failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async addDriverAvailability(
    payload: {
      driver_id: number | string;
      availability_status: string;
      availability_name: string;
      availability_start_time: string;
      availability_end_time: string;
      availability_date: string;
    },
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(`${PHP_API_BASE_URL}/add_driver_availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Add driver availability failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async deleteDriverAvailability(
    availabilityId: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    let response = await fetch(
      `${PHP_API_BASE_URL}/delete_driver_availability/${availabilityId}`,
      {
        method: "GET",
        signal,
      },
    );

    if (response.status === 405) {
      response = await fetch(
        `${PHP_API_BASE_URL}/delete_driver_availability/${availabilityId}`,
        {
          method: "DELETE",
          signal,
        },
      );
    }

    if (!response.ok) {
      throw new Error(
        `Delete driver availability failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async confirmDriverAvailability(
    availabilityId: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(
      `${PHP_API_BASE_URL}/confirm_driver_availability/${availabilityId}`,
      {
        method: "GET",
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Confirm driver availability failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async unconfirmDriverAvailability(
    availabilityId: number | string,
    signal?: AbortSignal,
  ): Promise<any> {
    const response = await fetch(
      `${PHP_API_BASE_URL}/unconfirm_driver_availability/${availabilityId}`,
      {
        method: "GET",
        signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Unconfirm driver availability failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async clearRosterData(
    date: string,
    signal?: AbortSignal,
  ): Promise<any> {
    const baseUrl = PHP_API_BASE_URL || "https://api-stage-hrs.srul.co.uk/api";
    const url = `${baseUrl}/clear_roster_data/${date}`;
    let response = await fetch(url, {
      method: "GET",
      signal,
    });

    if (response.status === 405) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
        signal,
      });
      if (response.status === 405) {
        response = await fetch(url, {
          method: "DELETE",
          signal,
        });
      }
    }

    if (!response.ok) {
      throw new Error(
        `Clear roster data failed with status ${response.status}`,
      );
    }

    return await response.json();
  }

  static async getExcelPreviewDate(signal?: AbortSignal): Promise<any> {
    const baseUrl =
      PHP_API_BASE_URL || "https://api-stage-hrs.srul.co.uk/api";

    const response = await fetch(`${baseUrl}/get_excel_preview_date`, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Get excel preview date failed with status ${response.status}`,
      );
    }

    return await response.json();
  }
}





