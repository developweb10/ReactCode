import React, { useCallback, useState, useEffect } from "react";

import styles from "./lts-table.module.scss";
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
  LTSFilterParams,
} from "@models/cases.models";
import { UserAuthModel } from "@models/authorization.models";

import { useTableControls } from "@hooks/useTableControls";

import { PageHeader } from "@components/page-header/page-header";
import { Table } from "@components/table/table";
import { Tabs } from "@components/tabs/tabs";
import { SearchInput } from "@components/search-input/search-input";

// TABLE CONFIG
import {
  TABLE_TABS,
  getCaseStatusByTab,
  getTableLabelByTab,
  isMyTab,
} from "../config/table-config";

import { LTSCaseFilters } from "./types";
import { useTableColumns } from "./useTableColumns";
import { LTSFilter } from "./lts-table-filter/lts-table-filter";
import { serializeFilters } from "@utils/filters/serialize-filters";

interface LTSTableProps {
  cases: CaseTableModel[];
  total: number;
  pagesCount: number;
  caseType: CaseType;
  currentUser: UserAuthModel;
}

export const LTSTable: React.FC<LTSTableProps> = ({
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
      handleFilterChange,
      handleFilterReset,
    },
  } = useTableControls<LTSCaseFilters>({
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
        dateOfSicknessFilter: {
          mapParamsProp: "dateOfSickness",
          appliedFilters: [],
        },
        fitNoteExpiresOnFilter: {
          mapParamsProp: "fitNoteExpiresOn",
          appliedFilters: [],
        },
        ailmentFilter: {
          mapParamsProp: "ailments",
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
    const serializedFilters = serializeFilters<LTSFilterParams>(filters);
    await casesService.fetchLTSCases({
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
      caseType: CaseStringType.LTS,
      caseData,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const handleCaseViewClick = useCallback(
    (caseData: CaseTableModel, editMode?: boolean) => {
      dialogManagerService.openDialog(DialogType.VIEW_CASE, {
        caseType: CaseStringType.LTS,
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
      caseType: CaseStringType.LTS,
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
        title={"LTS"}
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
          title={`${getTableLabelByTab(tab)} LTS`}
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
          filterComponent={
            <LTSFilter
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
