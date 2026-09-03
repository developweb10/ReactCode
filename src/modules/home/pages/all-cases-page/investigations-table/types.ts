import { FilterEntity } from "@components/filter/types";

export interface InvestigationCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  investigationDateFilter: FilterEntity<string>;
  suspendedFilter: FilterEntity<boolean>;
}
