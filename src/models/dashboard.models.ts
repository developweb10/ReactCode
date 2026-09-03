export interface TypeStatistic {
  type: string;
  percentage: number;
}

export interface AgeStatistic {
  ageRange: string;
  percentage: number;
}

export interface WorkforceGender {
  gender: string;
  percentage: number;
}

export interface FleetVehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_rph: string;
  vehicle_nos: string;
  vehicle_status: string;
}

export interface FleetVehiclesResponse {
  status: number;
  message?: string;
  vehicles: FleetVehicle[];
}

export interface FleetVehiclePayload {
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_nos: string;
  vehicle_status: "1" | "0";
  vehicle_rph: string;
}

export interface DashboardDto {
  numberOfEmployees: number;
  numberOfTasks: number;
  caseTypes: TypeStatistic[];
  employeeAges: AgeStatistic[];
  positionTypes: TypeStatistic[];
  workforceGenders: WorkforceGender[];
}

export interface Dataset {
  label: string;
  data: number[];
}

export interface CasesByManagerStatisticDto {
  labels: number[];
  datasets: Dataset[];
}

export interface GetCaseNumberParams {
  from: string;
  to: string;
}

export interface CasesByDateStatisticDto {
  labels: string[];
  data: number[];
}
