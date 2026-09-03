import {
  HrManagerModel,
  DistrictManagerModel,
  RegionalManagerModel,
} from "./managers.models";
export interface StoreModel {
  id: number;
  name: string;
  address1: string;
  address2?: string;
  address3?: string;
  postcode: string;
  mobileNumber?: string;
  district: number;
  number: number;
  region: number;
  grade: number;
  districtManager: DistrictManagerModel;
  regionalManager: RegionalManagerModel;
  hrManager: HrManagerModel;
  contactInfo?: string;
  isEditable: boolean;
  isLineManager?: boolean;
}

export type StoreFilterParams = {
  names?: string[];
  namesLike?: string[];
  idsLike?: string[];
  districtManagerIds?: number[];
  regionalManagerIds?: number[];
  hrManagerIds?: number[];
};

export type StoreFetchParams = {
  page?: number;
  search?: string;
  size?: number;
  sort?: string;
  fields?: string[];
} & StoreFilterParams;

export type CreateStoreDto = {
  name: string;
  mobileNumber?: string;
  regionalManagerId: number;
  districtManagerId: number;
  hrManagerId: number;
  contactInfo?: string;
  isLineManager?: boolean;
};

export type EditStoreDto = {
  name?: string;
  mobileNumber?: string;
  regionalManagerId: number;
  districtManagerId: number;
  hrManagerId: number;
  contactInfo?: string;
  isLineManager?: boolean;
};
