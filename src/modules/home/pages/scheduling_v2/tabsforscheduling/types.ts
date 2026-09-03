export const ItemTypes = {
  SHIFT: "shift",
};

export type ShiftStatus = "Available" | "Unavailable" | "On Leave" | "Assigned";
export type FilterMode = "all" | "availability" | "assigned" | "vehicle";
export type ConfirmationFilter =
  | "all"
  | "confirmed_manager"
  | "outstanding_manager"
  | "hasVehicle"
  | "confirmed_driver"
  | "unconfirmed_driver"
  | "availability_submitted"
  | "cancellation_requests";

export type SortKey = "name" | "earliestShift" | "latestShift";
export type SortOrder = "asc" | "desc";
export type ReportType =
  | "daySummary"
  | "weekSummary"
  | "monthSummary"
  | "assignedVehicleDaySummary"
  | "assignedVehicleWeekSummary"
  | "assignedVehicleMonthSummary"
  | "workingDriversRoster";
export type PreviewSortKey = "arrival_time" | "wave" | "van_registration";

export interface DailyPreviewRow {
  name: string;
  arrivalTime: string;
  wave: string;
  vanRegistration: string;
  loadingPad: string;
  routeCode: string;
  stagingLocation: string;
}

export interface CancellationInfo {
  cancellation_status?: "pending" | "approved" | "rejected" | null;
  cancel_reason?: string;
  cancelled_by_driver?: number;
  admin_reply?: string | null;
}

export interface Shift extends CancellationInfo {
  id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  shift_status: string;
  shift_type: "availability" | "assigned";
  is_driver_confirmed?: string;
  assigned_shift_id?: number;
  isConfirmedByManager?: boolean;
  service_id?: number | string;
}

export interface AssignedVehicle {
  id: number;
  name: string;
  number: string;
  notes?: string;
  assigned_vehicle_id?: number;
}

export interface Employee {
  id: number;
  first_name: string;
  only_first_name?: string;
  surname?: string;
  middle_name?: string;
  email: string;
  avatar_id: string;
  join_date: string;
  schedule: {
    [date: string]: {
      availability?: Shift | null;
      assigned?: Shift | null;
      assignedVehicle?: AssignedVehicle | null;
    };
  };
}

export interface Vehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_rph: string;
  vehicle_nos: string;
  vehicle_status: string;
}

export interface VehiclePayload {
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_nos: string;
  vehicle_status: "1" | "0";
  vehicle_rph: string;
}
