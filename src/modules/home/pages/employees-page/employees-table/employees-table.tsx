import React, { useState, useEffect, useCallback } from "react";

import styles from "./employees-table.module.scss";
import EmployeesIcon from "@assets/images/employees-yellow-icon.svg";
import StoresIcon from "@assets/images/stores-yellow-icon.svg";
import AddIcon from "@material-ui/icons/Add";
import ArrowIcon from "@assets/images/arrow-down-icon.svg";

import { employeesService } from "@store/employees/employees.service";
import { employeesQuery } from "@store/employees/employees.query";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";

import { EmployeeModel, EmployeeFilterParams } from "@models/employee.models";
import { StoreModel } from "@models/store.models";
import { IEmployeesFilters } from "./types";

import { useTableControls } from "@hooks/useTableControls";

import { serializeFilters } from "@utils/filters/serialize-filters";

import { ButtonBase, Typography } from "@material-ui/core";

import { PageHeader } from "@components/page-header/page-header";
import { Table } from "@components/table/table";
import { Tabs } from "@components/tabs/tabs";
import { SearchInput } from "@components/search-input/search-input";

// TABLE CONFIG
import { TABS_LIST, getEmployeeTypeByTabValue } from "./config/table-config";
import { EmployeesFilter } from "./employees-table-filter/employees-table-filter";

import { useTableColumns } from "./useTableColumns";

interface EmployeesTableProps {
  employees: EmployeeModel[];
  selectedStore?: StoreModel;
  total: number;
  pagesCount: number;
  historyState?: any;
  openEmployeeDefails: (employee: EmployeeModel) => void;
  openStoreDetails?: (store: StoreModel) => void;
  onBack?: () => void;
}

const API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  selectedStore,
  total,
  pagesCount,
  historyState,
  openEmployeeDefails,
  openStoreDetails,
  onBack,
}) => {
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);

  const {
    values: { page, size, sort, tab, search, filters },
    handlers: {
      handlePageChange,
      handleSearchChange,
      handleSizeChange,
      handleSortChange,
      handleTabChange,
      handleFilterChange,
      handleFilterReset,
    },
  } = useTableControls<IEmployeesFilters>({
    historyState,
    initialValues: {
      sort: "surname,asc",
      filters: {
        employeeIdsFilter: {
          mapParamsProp: "employeeIds",
          appliedFilters: [],
        },
        firstnamesFilter: {
          mapParamsProp: "firstnames",
          appliedFilters: [],
        },
        surnamesFilter: {
          mapParamsProp: "surnames",
          appliedFilters: [],
        },
        positionsFilter: {
          mapParamsProp: "positions",
          appliedFilters: [],
        },
        storeNamesFilter: {
          mapParamsProp: "storeNames",
          appliedFilters: [],
        },
        storeNumbersFilter: {
          mapParamsProp: "storeNumbers",
          appliedFilters: [],
        },
        startDatesFilter: {
          mapParamsProp: "startDates",
          appliedFilters: [],
        },
        leaveDatesFilter: {
          mapParamsProp: "leaveDates",
          appliedFilters: [],
        },
      },
    },
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  // MAIN FETCH FUNC

  const fetchEmployeesData = useCallback(async () => {
    const serializedFilters = serializeFilters<EmployeeFilterParams>(filters);

    await employeesService.fetchEmployees({
      employeeType: getEmployeeTypeByTabValue(tab),
      size,
      page,
      sort,
      search,
      storeId: selectedStore ? selectedStore.id : undefined,
      ...serializedFilters,
    });

    setRequestRequired(false);
  }, [filters, page, search, selectedStore, size, sort, tab]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchEmployeesData();
    }
  }, [fetchEmployeesData, requestRequired]);

  // ============= HANDLERS ===============

  const handleAddEmployeeClick = useCallback(() => {
    dialogManagerService.openDialog(DialogType.ADD_EMPLOYEE, {
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const handleDeleteEmployee = useCallback((id: number) => {
    dialogManagerService.openDialog(DialogType.DELETE_EMPLOYEE, {
      employeeId: id,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const resetDriverPassword = async (email: string) => {
    return fetch(`${API_BASE_URL}/update_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to reset password");
      }
      return res.json();
    });
  };

  const handleDriverAction = async (employee: EmployeeModel) => {
    if (!employee.email) return;

    try {
      await resetDriverPassword(employee.email);
      // toast.success("New password sent to driver's email");
    } catch (err) {
      // toast.error("Failed to reset driver password");
    }
  };

  const columns = useTableColumns({
    openStoreDetails,
    openEmployeeDefails,
    handleDeleteEmployee,
    selectedStore,
    isLeaverTab: tab === 2,
    handleDriverAction,
  });

  return (
    <div className={styles.PageWrapper} id="employees-page">
      <PageHeader
        title={selectedStore ? selectedStore.name : "Employees"}
        icon={selectedStore ? StoresIcon : EmployeesIcon}
        {...(!selectedStore
          ? {
              buttonIcon: <AddIcon />,
              buttonTitle: "Add Employee",
              onButtonClick: handleAddEmployeeClick,
            }
          : {})}
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            onChange={handleSearchChange}
            searchValue={search}
          />
        }
        tabs={
          <Tabs value={tab} onChange={handleTabChange} labels={TABS_LIST} />
        }
      />

      <div className="page-content">
        {selectedStore && (
          <ButtonBase
            onClick={onBack}
            className={styles.BackButton}
            disableRipple
          >
            <img className={styles.BackIcon} src={ArrowIcon} alt="back" />
            <Typography>Back</Typography>
          </ButtonBase>
        )}
        <Table
          id="employees-table"
          cols={columns}
          tableData={employees}
          loading$={employeesQuery.loading$}
          title="All Employees"
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
          filterComponent={
            <EmployeesFilter
              filters={filters}
              onFilterApply={handleFilterChange}
              onFilterReset={handleFilterReset}
              employeeType={getEmployeeTypeByTabValue(tab)}
            />
          }
        />
      </div>
    </div>
  );
};
