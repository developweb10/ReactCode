import { FilterEntity } from "@components/filter/types";

export interface PerformanceCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  reviewFromFilter: FilterEntity<string>;
  reviewToFilter: FilterEntity<string>;
}
