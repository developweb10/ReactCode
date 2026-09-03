import { FilterEntity } from "@components/filter/types";

export interface AppealCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  appealDateFilter: FilterEntity<string>;
  suspendedFilter: FilterEntity<boolean>;
}
