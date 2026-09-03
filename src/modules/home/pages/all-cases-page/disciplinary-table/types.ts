import { FilterEntity } from "@components/filter/types";

export interface DisciplinaryCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  discipliningDateFilter: FilterEntity<string>;
  suspendedFilter: FilterEntity<boolean>;
}
