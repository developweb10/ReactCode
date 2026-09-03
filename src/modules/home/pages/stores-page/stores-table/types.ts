import { StoreModel } from "@models/store.models";
import { TableColumn } from "@components/table/types";
import { FilterEntity } from "@components/filter/types";

export type StoresTableColumns = TableColumn<StoreModel>[];

export interface StoreFilters {
  districtManagersFilter: FilterEntity<number>;
  regionalManagersFilter: FilterEntity<number>;
  hrManagersFilter: FilterEntity<number>;
  storeNames: FilterEntity<string>;
}
