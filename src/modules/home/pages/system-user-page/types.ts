export type UserRole = 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_EMPLOYEE';

export interface User {
  userId?: number;
  firstname: string;
  surname: string;
  email: string;
  password?: string;
  role: UserRole;
  hoursPerWeek: number;
  hourlyRate: number;
  salary: number;
}

export interface UserFormData extends Omit<User, 'userId'> {}