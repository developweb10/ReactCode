import { ID } from "@datorama/akita";

export interface DriverModel {
  id: number;
  name: string;
  profilePicture?: string;
  status: 'Confirmed' | 'Unconfirmed' | 'Pending' | 'Holiday' | 'Sick';
  vehicle?: string | null;
  availability: AvailabilityModel[];
  lastConfirmed?: string; // Date of last confirmation
}

export interface AvailabilityModel {
  date: string; // YYYY-MM-DD
  status: 'available' | 'unavailable' | 'confirmed' | 'requested';
  timeRange: string; // e.g., "08:00-16:00"
  confirmedAt?: string; // ISO timestamp for availability confirmation
}

export interface ShiftModel {
  id: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  driverId?: ID;
  // status: 'Confirmed' | 'Unconfirmed' | 'Pending';
  status: 'Confirmed' | 'Unconfirmed' | 'Pending' | 'Sick' | 'Holiday';
}

export interface NotificationModel {
  id: number;
  timeSent: string; // ISO date string
  target: ID[]; // Array of driver IDs
  type: 'Auto' | 'Manual';
  status: 'Sent' | 'Failed' | 'Pending';
}