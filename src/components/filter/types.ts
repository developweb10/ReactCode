export interface AppliedFilterItem<T = any> {
  name: string;
  value: T;
}
export interface FilterEntity<T> {
  mapParamsProp: string;
  appliedFilters: AppliedFilterItem<T>[];
}
