import { StoreModel } from "./store.models";

import {
  PrimaryLineManagerModel,
  SecondaryLineManagerModel,
} from "./managers.models";

export enum EmployeeType {
  EMPLOYEED = "EMPLOYEED",
  LEAVER = "LEAVER",
  SICK = "SICK",
}

interface EmployeeCore {
  id: number;
  firstname: string;
  surname: string;
  email: string;
}

export interface EmployeePartData {
  middleName: string;
  avatarId: number;
  gender: string;
  knowAs: string;
  smoker: string;
  ethnicity: string;
  nationality: string;
  address1: string;
  address2: string;
  city: string;
  town: string;
  country: string;
  postCode: string;
  mobileNumber: string;
  houseNumber: string;
  dateOfBirth: string;
  personalEmail: string;
  otherEmail: string;
  lengthOfService: number;
  ecFirstName: string;
  ecLastName: string;
  ecMobile: string;
  ecHomeTelephone: string;
  ecWorkTelephone: string;
  ecRelationship: string;
  jobTitle: string;
  jobSpecifications: string;
  employmentStatus: string;
  type: EmployeeType;
  function: string;
  department: string;
  startDate: string;
  endDate: string;
  joinDate: string;
  leaveDate: string;
  contractDetails: string;
  hoursPerWeek: number;
  hourlyRate: number;
  salary: number;
  isEditable: boolean;
  store: StoreModel;
  storeId: number;
  otherId: string | number;
  primaryLineManager: PrimaryLineManagerModel;
  secondaryLineManager: SecondaryLineManagerModel;
}

export interface EmployeeMinDto {
  id: number;
  name: string;
}
export interface EmployeeModel
  extends EmployeeCore,
    Partial<EmployeePartData> {}

export interface EmployeeCreateDto
  extends Omit<EmployeeCore, "id">,
    Omit<Partial<EmployeePartData>, "store"> {
  primaryLineManagerId?: number;
  secondaryLineManagerId?: number;
}

export interface EmployeeEditDto
  extends Omit<EmployeeCore, "id">,
    Omit<Partial<EmployeePartData>, "store"> {}

export type EmployeeFilterParams = {
  employeeIds?: number[];
  firstnames?: string[];
  surnames?: string[];
  positions?: string[];
  storeNames?: string[];
  storeNumbers?: number[];
  startDate?: string[];
  leaveDate?: string;
};

export type EmployeeGetUniqueFieldsDto = {
  employeeType?: EmployeeType;
  fieldName: string;
  value?: string;
  page?: number;
  search?: string;
  size?: number;
  sort?: string;
};

export type EmployeeFetchParams = {
  employeeType?: EmployeeType;
  page?: number;
  search?: string;
  size?: number;
  sort?: string;
  fields?: string[];
  storeId?: number;
} & EmployeeFilterParams;

export type EmployeesFetchByStoreIdParams = EmployeeFetchParams & {
  id: number;
};
