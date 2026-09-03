export type ManagerType = {
  id: number;
  name: string;
};

export interface RegionalManagerModel extends ManagerType {}
export interface HrManagerModel extends ManagerType {}
export interface DistrictManagerModel extends ManagerType {}
export interface PrimaryLineManagerModel extends ManagerType {}
export interface SecondaryLineManagerModel extends ManagerType {}
