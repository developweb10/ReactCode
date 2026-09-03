import { FilterEntity } from "@components/filter/types";

export interface GrievanceCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  dateGrievanceRaisedFilter: FilterEntity<string>;
  dateGrievanceHearingFilter: FilterEntity<string>;
}
