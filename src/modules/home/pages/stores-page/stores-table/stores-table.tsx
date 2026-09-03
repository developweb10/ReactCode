import { useCallback, useState, useEffect } from "react";
import styles from "./stores-table.module.scss";
import StoresIcon from "@assets/images/stores-yellow-icon.svg";
import AddIcon from "@material-ui/icons/Add";
import { storesService } from "@store/stores/stores.service";
import { storesQuery } from "@store/stores/stores.query";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { StoreModel, StoreFilterParams } from "@models/store.models";
import { StoreFilters } from "./types";
import { StoresFilter } from "./stores-table-filter/stores-table-filter";

import { useTableControls } from "@hooks/useTableControls";
import { serializeFilters } from "@utils/filters/serialize-filters";

import { PageHeader } from "@components/page-header/page-header";
import { SearchInput } from "@components/search-input/search-input";

import { Table } from "@components/table/table";

import { useTableColumns } from "./useTableColumns";

interface StoresTableProps {
  stores: StoreModel[];
  total: number;
  pagesCount: number;
  openStoreDetails: (store: StoreModel) => void;
}

export const StoresTable: React.FC<StoresTableProps> = ({
  stores,
  total,
  pagesCount,
  openStoreDetails,
}) => {
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);

  // TABLE STATE

  const {
    values: { page, size, sort, search, filters },
    handlers: {
      handlePageChange,
      handleSearchChange,
      handleSizeChange,
      handleSortChange,
      handleFilterChange,
      handleFilterReset,
    },
  } = useTableControls<StoreFilters>({
    initialValues: {
      filters: {
        storeNames: {
          mapParamsProp: "names",
          appliedFilters: [],
        },
        districtManagersFilter: {
          mapParamsProp: "districtManagerIds",
          appliedFilters: [],
        },
        regionalManagersFilter: {
          mapParamsProp: "regionalManagerIds",
          appliedFilters: [],
        },
        hrManagersFilter: {
          mapParamsProp: "hrManagerIds",
          appliedFilters: [],
        },
      },
    },
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  // MAIN FETCH FUNC

  const fetchLocationsData = useCallback(async () => {
    const serializedFilters = serializeFilters<StoreFilterParams>(filters);

    await storesService.fetchStores({
      size,
      page,
      sort,
      search,
      ...serializedFilters,
    });

    setRequestRequired(false);
  }, [filters, page, search, size, sort]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchLocationsData();
    }
  }, [fetchLocationsData, requestRequired]);

  // ============= HANDLERS ===============

  const handleStoreDeleteClick = useCallback((data) => {
    dialogManagerService.openDialog(DialogType.DELETE_STORE, {
      storeId: data.id,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const handleStoreEditClick = useCallback((data) => {
    dialogManagerService.openDialog(DialogType.EDIT_STORE, {
      selectedStore: data,
    });
  }, []);

  const handleAddLocationClick = useCallback(() => {
    dialogManagerService.openDialog(DialogType.CREATE_STORE, {
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const columns = useTableColumns({
    handleStoreEditClick,
    handleStoreDeleteClick,
    openStoreDetails,
  });

  return (
    <div className={styles.PageWrapper}>
      <PageHeader
        title="Locations"
        icon={StoresIcon}
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            searchValue={search}
            onChange={handleSearchChange}
          />
        }
        buttonIcon={<AddIcon />}
        buttonTitle="Add Location"
        onButtonClick={handleAddLocationClick}
      />

      <div className="page-content">
        <Table
          id="stores-table"
          cols={columns}
          tableData={stores}
          loading$={storesQuery.loading$}
          title="All Locations"
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
          filterComponent={
            <StoresFilter
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
