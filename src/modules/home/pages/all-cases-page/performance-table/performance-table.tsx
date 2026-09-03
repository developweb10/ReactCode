import React, { useCallback, useState, useEffect } from "react";

import styles from "./performance-table.module.scss";
import AllCasesIcon from "@assets/images/all-cases-yellow-icon.svg";

import AddIcon from "@material-ui/icons/Add";

import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { casesService } from "@store/cases/cases.service";
import { casesQuery } from "@store/cases/cases.query";

import {
  CaseTableModel,
  CaseType,
  CaseStringType,
  PerformanceFilterParams,
} from "@models/cases.models";
import { UserAuthModel } from "@models/authorization.models";

import { useTableControls } from "@hooks/useTableControls";

import { PageHeader } from "@components/page-header/page-header";
import { Table } from "@components/table/table";
import { Tabs } from "@components/tabs/tabs";
import { SearchInput } from "@components/search-input/search-input";
import { serializeFilters } from "@utils/filters/serialize-filters";
// TABLE CONFIG
import {
  TABLE_TABS,
  getCaseStatusByTab,
  getTableLabelByTab,
  isMyTab,
} from "../config/table-config";

import { PerformanceCaseFilters } from "./types";
import { useTableColumns } from "./useTableColumns";
import { PerformanceFilter } from "./performance-table-filter/performance-table-filter";

interface PerformanceTableProps {
  cases: CaseTableModel[];
  total: number;
  pagesCount: number;
  caseType: CaseType;
  currentUser: UserAuthModel;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  caseType,
  cases,
  total,
  pagesCount,
  currentUser,
}) => {
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);

  // TABLE STATE

  const {
    values: { page, size, sort, tab, search, filters },
    handlers: {
      handlePageChange,
      handleSearchChange,
      handleSizeChange,
      handleSortChange,
      handleTabChange,
      handleFilterReset,
      handleFilterChange,
    },
  } = useTableControls<PerformanceCaseFilters>({
    initialValues: {
      filters: {
        storeNamesFilter: {
          mapParamsProp: "storeNames",
          appliedFilters: [],
        },
        positionsFilter: {
          mapParamsProp: "positions",
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
        hrNamesFilter: {
          mapParamsProp: "hrsId",
          appliedFilters: [],
        },
        districtManagerNamesFilter: {
          mapParamsProp: "districtManagersId",
          appliedFilters: [],
        },
        reviewFromFilter: {
          mapParamsProp: "reviewFrom",
          appliedFilters: [],
        },
        reviewToFilter: {
          mapParamsProp: "reviewTo",
          appliedFilters: [],
        },
      },
    },
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  // MAIN FETCH FUNC

  const fetchCases = useCallback(async () => {
    const serializedFilters =
      serializeFilters<PerformanceFilterParams>(filters);
    await casesService.fetchPerformanceCases({
      size,
      page,
      sort,
      search,
      status: getCaseStatusByTab(tab),
      createdById: isMyTab(tab) ? currentUser.userId : undefined,
      ...serializedFilters,
    });
    setRequestRequired(false);
  }, [filters, currentUser.userId, page, search, size, sort, tab]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchCases();
    }
  }, [fetchCases, requestRequired]);

  // ============= HANDLERS ===============

  const handleCaseDeleteClick = useCallback((caseData) => {
    dialogManagerService.openDialog(DialogType.DELETE_CASE, {
      caseType: CaseStringType.Performance,
      caseData,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const handleCaseViewClick = useCallback(
    (caseData: CaseTableModel, editMode?: boolean) => {
      dialogManagerService.openDialog(DialogType.VIEW_CASE, {
        caseType: CaseStringType.Performance,
        caseData,
        editMode,
        handleRefetch: () => {
          setRequestRequired(true);
        },
      });
    },
    []
  );

  const handleAddCase = useCallback(() => {
    dialogManagerService.openDialog(DialogType.ADD_CASE, {
      caseType: CaseStringType.Performance,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);
  const columns = useTableColumns({
    tab,
    handleCaseDeleteClick,
    handleCaseViewClick,
  });

  return (
    <div className={styles.PageWrapper} id="cases-page">
      <PageHeader
        title={"Performance"}
        icon={AllCasesIcon}
        buttonIcon={<AddIcon />}
        buttonTitle={"Add New"}
        onButtonClick={handleAddCase}
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            searchValue={search}
            onChange={handleSearchChange}
          />
        }
        tabs={
          <Tabs value={tab} onChange={handleTabChange} labels={TABLE_TABS} />
        }
      />

      <div className="page-content cases-page">
        <Table
          id="cases-table"
          cols={columns}
          tableData={cases}
          loading$={casesQuery.loading$}
          title={`${getTableLabelByTab(tab)} Performance`}
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
          filterComponent={
            <PerformanceFilter
              filters={filters}
              onFilterApply={handleFilterChange}
              onFilterReset={handleFilterReset}
            />
          }
        />
      </div>
    </div>
  );
};
