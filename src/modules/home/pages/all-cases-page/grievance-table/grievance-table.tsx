import React, { useCallback, useState, useEffect } from "react";

import styles from "./grievance-table.module.scss";
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
  GrievanceFilterParams,
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

import { GrievanceCaseFilters } from "./types";
import { useTableColumns } from "./useTableColumns";
import { GrievanceFilter } from "./grievance-table-filter/grievance-table-filter";

interface GrievanceTableProps {
  cases: CaseTableModel[];
  total: number;
  pagesCount: number;
  caseType: CaseType;
  currentUser: UserAuthModel;
}

export const GrievanceTable: React.FC<GrievanceTableProps> = ({
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
  } = useTableControls<GrievanceCaseFilters>({
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
        dateGrievanceHearingFilter: {
          mapParamsProp: "dateGrievanceHearing",
          appliedFilters: [],
        },
        dateGrievanceRaisedFilter: {
          mapParamsProp: "dateGrievanceRaised",
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
    const serializedFilters = serializeFilters<GrievanceFilterParams>(filters);
    await casesService.fetchGrievanceCases({
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
      caseType: CaseStringType.Grievance,
      caseData,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const handleCaseViewClick = useCallback(
    (caseData: CaseTableModel, editMode?: boolean) => {
      dialogManagerService.openDialog(DialogType.VIEW_CASE, {
        caseType: CaseStringType.Grievance,
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
      caseType: CaseStringType.Grievance,
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
        title={"Grievance"}
        icon={AllCasesIcon}
        buttonIcon={<AddIcon />}
        buttonTitle={"Add New"}
        onButtonClick={handleAddCase}
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            onChange={handleSearchChange}
            searchValue={search}
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
          title={`${getTableLabelByTab(tab)} Grievances`}
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
          filterComponent={
            <GrievanceFilter
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
