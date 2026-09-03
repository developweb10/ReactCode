import { useMemo } from "react";

import { DisciplinaryCaseFilters } from "../types";

import { ManagersApi } from "@api/managers/managers.api";
import { StoresApi } from "@api/stores/stores.api";

import { EmployeesApi } from "@api/employees/employees.api";

import { FilterItem } from "@components/filter/filter-item/filter-item";
import { FilterDateItem } from "@components/filter/filter-date-item/filter-date-item";
import { FilterRadioItem } from "@components/filter/filter-radio-item/filter-radio-item";
import { FilterDrawer } from "@components/filter-drawer/filter-drawer";

interface DisciplinaryCaseFilterProps {
  filters: DisciplinaryCaseFilters;
  onFilterApply: (filters: DisciplinaryCaseFilters) => void;
  onFilterReset: () => void;
}

export const DisciplinaryFilter: React.FC<DisciplinaryCaseFilterProps> = ({
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
              label="First Name"
              header="Select First Name"
              activeFilter={activeFilter}
              appliedFilters={filters.firstnamesFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const res = await EmployeesApi.getUniqueFields({
                  fieldName: "firstname",
                  value: search,
                  sort: "firstname,asc",
                });
                return res.data.result.map((item) => ({
                  name: item.value,
                  value: item.value,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  firstnamesFilter: {
                    ...filters.firstnamesFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="Last Name"
              header="Select Last Name"
              activeFilter={activeFilter}
              appliedFilters={filters.surnamesFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const res = await EmployeesApi.getUniqueFields({
                  fieldName: "surname",
                  value: search,
                  sort: "surname,asc",
                });
                return res.data.result.map((item) => ({
                  name: item.value,
                  value: item.value,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  surnamesFilter: {
                    ...filters.surnamesFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="Position"
              header="Select Position"
              activeFilter={activeFilter}
              appliedFilters={filters.positionsFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await EmployeesApi.getJobTitle(search);
                return result.data.map((item) => ({
                  name: item,
                  value: item,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  positionsFilter: {
                    ...filters.positionsFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="Location Name"
              header="Select Location Name"
              activeFilter={activeFilter}
              appliedFilters={filters.storeNamesFilter.appliedFilters}
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
                  storeNamesFilter: {
                    ...filters.storeNamesFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="District Manager"
              header="Select District Manager"
              activeFilter={activeFilter}
              appliedFilters={filters.districtManagerNamesFilter.appliedFilters}
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
                  districtManagerNamesFilter: {
                    ...filters.districtManagerNamesFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterDateItem
              label="Date Of Disciplinary"
              header="Select Disciplinary Date"
              activeFilter={activeFilter}
              appliedFilters={filters.discipliningDateFilter.appliedFilters}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  discipliningDateFilter: {
                    ...filters.discipliningDateFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterRadioItem
              label="Suspended"
              header="Show Suspended Cases"
              activeFilter={activeFilter}
              appliedFilters={filters.suspendedFilter.appliedFilters}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  suspendedFilter: {
                    ...filters.suspendedFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterItem
              label="HR User"
              header="Select HR User"
              activeFilter={activeFilter}
              appliedFilters={filters.hrNamesFilter.appliedFilters}
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
                  hrNamesFilter: {
                    ...filters.hrNamesFilter,
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
