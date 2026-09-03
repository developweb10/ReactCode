import { EntityState, ID } from '@datorama/akita';

// Defines the structure of a Driver
export interface Driver {
  _id: ID;
  name: string;
  avatar?: string; // Optional avatar URL
}

// Defines statuses for shifts and availability
export type AvailabilityStatus = 'Available' | 'Not Available' | 'On Leave';

// Defines a driver's availability for a specific day
export interface Availability {
  driverId: ID;
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
}

// Defines a Shift
export interface Shift {
  _id: ID;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  vehicle: 'Van' | 'Car' | 'Truck'; // Example vehicle type
  driverId: ID | null; // null if unassigned
  date: string | null; // YYYY-MM-DD, null if unassigned
}

// Defines the overall state for the scheduling module
export interface SchedulingState extends EntityState<Driver, ID> {
  shifts: Shift[];
  availabilities: Availability[];
  ui: {
    viewDate: string; // The starting date of the week being viewed
  };
}