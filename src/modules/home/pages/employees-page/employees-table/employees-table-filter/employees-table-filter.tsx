import { useMemo } from "react";

import { IEmployeesFilters } from "../types";
import { EmployeeType } from "@models/employee.models";

import { StoresApi } from "@api/stores/stores.api";
import { EmployeesApi } from "@api/employees/employees.api";

import { FilterItem } from "@components/filter/filter-item/filter-item";
import { FilterDateItem } from "@components/filter/filter-date-item/filter-date-item";
import { FilterDrawer } from "@components/filter-drawer/filter-drawer";

interface EmployeesFilterProps {
  filters: IEmployeesFilters;
  onFilterApply: (filters: IEmployeesFilters) => void;
  onFilterReset: () => void;
  employeeType: EmployeeType;
}

export const EmployeesFilter: React.FC<EmployeesFilterProps> = ({
  filters,
  employeeType,
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
                  employeeType,
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
                  employeeType,
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
              label="Location No"
              header="Select Location No"
              activeFilter={activeFilter}
              appliedFilters={filters.storeNumbersFilter.appliedFilters}
              fetchOptions={async (search: string) => {
                const result = await StoresApi.fetchStores({
                  idsLike: [search],
                  fields: ["id"],
                  sort: "id,asc",
                });
                return result.data.result.map((item) => ({
                  name: `${item.id}`,
                  value: item.id,
                }));
              }}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  storeNumbersFilter: {
                    ...filters.storeNumbersFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            <FilterDateItem
              label="Start Date"
              header="Select Start Date"
              activeFilter={activeFilter}
              appliedFilters={filters.startDatesFilter.appliedFilters}
              onLabelClick={(label) => handleActiveChange(label)}
              onApply={(newAppliedFilters) => {
                onFilterApply({
                  ...filters,
                  startDatesFilter: {
                    ...filters.startDatesFilter,
                    appliedFilters: newAppliedFilters,
                  },
                });
              }}
            />
            {employeeType === EmployeeType.LEAVER && (
              <FilterDateItem
                label="Leave Date"
                header="Select Leave Date"
                activeFilter={activeFilter}
                appliedFilters={filters.leaveDatesFilter.appliedFilters}
                onLabelClick={(label) => handleActiveChange(label)}
                onApply={(newAppliedFilters) => {
                  onFilterApply({
                    ...filters,
                    leaveDatesFilter: {
                      ...filters.leaveDatesFilter,
                      appliedFilters: newAppliedFilters,
                    },
                  });
                }}
              />
            )}
          </>
        );
      }}
    </FilterDrawer>
  );
};
