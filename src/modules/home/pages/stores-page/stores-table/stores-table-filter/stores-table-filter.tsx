import { useMemo } from "react";

import { StoreFilters } from "../types";

import { ManagersApi } from "@api/managers/managers.api";
import { StoresApi } from "@api/stores/stores.api";

import { FilterItem } from "@components/filter/filter-item/filter-item";
import { FilterDrawer } from "@components/filter-drawer/filter-drawer";

interface StoreFilterProps {
  filters: StoreFilters;
  onFilterApply: (filters: StoreFilters) => void;
  onFilterReset: () => void;
}

export const StoresFilter: React.FC<StoreFilterProps> = ({
  filters,
  onFilterApply,
  onFilterReset,
}) => {
  const appliedFiltersCount = useMemo(() => {
    let count = 0;

    for (const tupple of Object.entries(filters)) {
      if (!!tupple[1].appliedFilters.length) count++;
    }
    return count;
  }, [filters]);

  return (
    <FilterDrawer
      appliedFiltersCount={appliedFiltersCount}
      onFilterReset={onFilterReset}
    >
      {({ toggleDrawer, handleActiveChange, activeFilter }) => {
        return (
          <>
            <FilterItem
              label="Location Name"
              header="Select Location Name"
              activeFilter={activeFilter}
              appliedFilters={filters.storeNames.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await StoresApi.fetchStores({
                  namesLike: [search],
                  fields: ["name"],
                  sort: "name,asc",
                });
                return result.data.result.map((item) => ({
                  name: item.name,
                  value: item.name,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  storeNames: {
                    ...filters.storeNames,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="District Manager"
              header="Select District Manager"
              activeFilter={activeFilter}
              appliedFilters={filters.districtManagersFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await ManagersApi.fetchDistrictManagers(search);
                return result.data.map((item) => ({
                  name: item.name,
                  value: item.id,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  districtManagersFilter: {
                    ...filters.districtManagersFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />

            <FilterItem
              label="Regional Manager"
              header="Select Regional Manager"
              activeFilter={activeFilter}
              appliedFilters={filters.regionalManagersFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await ManagersApi.fetchRegionalManagers(search);
                return result.data.map((item) => ({
                  name: item.name,
                  value: item.id,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  regionalManagersFilter: {
                    ...filters.regionalManagersFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />

            <FilterItem
              label="HR User"
              header="Select HR User"
              activeFilter={activeFilter}
              appliedFilters={filters.hrManagersFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await ManagersApi.fetchHrManagers(search);
                return result.data.map((item) => ({
                  name: item.name,
                  value: item.id,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  hrManagersFilter: {
                    ...filters.hrManagersFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
          </>
        );
      }}
    </FilterDrawer>
  );
};
