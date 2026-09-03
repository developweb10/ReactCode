import { FilterEntity } from "@components/filter/types";

export interface LTSCaseFilters {
  positionsFilter: FilterEntity<string>;
  firstnamesFilter: FilterEntity<string>;
  surnamesFilter: FilterEntity<string>;
  storeNamesFilter: FilterEntity<string>;
  hrNamesFilter: FilterEntity<number>;
  districtManagerNamesFilter: FilterEntity<number>;
  dateOfSicknessFilter: FilterEntity<string>;
  fitNoteExpiresOnFilter: FilterEntity<string>;
  ailmentFilter: FilterEntity<string>;
}
