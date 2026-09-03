import React, { useCallback, useState, useEffect } from "react";
import styles from "./redundancy-calc-page.module.scss";
import { useHistory } from "react-router-dom";
import ArrowIcon from "@assets/images/arrow-down-icon.svg";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import CalculatorIcon from "@assets/images/calculator-yellow-icon.svg";

import { useObservableState } from "observable-hooks";
import { calculatorQuery } from "@store/redundancy-calculator/redundancy-calculator.query";
import { calculatorService } from "@store/redundancy-calculator/redundancy-calculator.service";
import {
  EditCalculatorDto,
  CalculatorModel,
} from "@models/redundancy-calculator.models";
import { StoreModel } from "@models/store.models";

import { PageHeader } from "@components/page-header/page-header";
import { SearchInput } from "@components/search-input/search-input";
import { Pagination } from "@components/pagination/pagination";
import { Loader } from "@components/loader/loader";

import { useTableControls } from "@hooks/useTableControls";

import {
  Typography,
  TableBody,
  Table,
  TableContainer,
  Select,
  MenuItem,
  InputBase,
  ButtonBase,
} from "@material-ui/core";

import { useTableColumns } from "./useTableColumns";

import { RedundancyTableRow } from "./table-row/table-row";
import { RedundancyTableFormRow } from "./table-row/table-form-row";
import { RedundancyTableHead } from "./table-head/table-head";

const RedundancyCalculatorPage = () => {
  const [
    calculatorData,
    { total, pagesCount },
    loading,
  ] = useObservableState(calculatorQuery.calculatorState$, [
    [],
    { total: 0, pagesCount: 0 },
    true,
  ]);

  const history = useHistory();
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);

  // TABLE STATE

  const {
    values: { page, size, sort, search },
    handlers: {
      handlePageChange,
      handleSearchChange,
      handleSizeChange,
      handleSortChange,
    },
  } = useTableControls({
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  // MAIN FETCH FUNC

  const fetchCalcData = useCallback(async () => {
    await calculatorService.fetchCalculator({
      size,
      page,
      sort,
      search,
    });

    setRequestRequired(false);
  }, [page, search, size, sort]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchCalcData();
    }
  }, [fetchCalcData, requestRequired]);

  // ============= HANDLERS ===============

  const handleShowStoreDetails = useCallback(
    (store: StoreModel) => {
      history.push(`/store-details/employees`, {
        store,
        backPath: history.location.pathname + history.location.search,
      });
    },
    [history]
  );

  const handleShowEmployeeDetails = useCallback(
    (employee: CalculatorModel) => {
      history.push("/employees?employeeDetails", {
        employee: {
          ...employee,
          id: employee.employeeId,
          employeeId: undefined,
        },
      });
    },
    [history]
  );

  const handleAddRow = useCallback(async (employeeId: number) => {
    try {
      await calculatorService.addCalculatorRow(employeeId);
      setRequestRequired(true);
    } catch (error) {}
  }, []);

  const handleDeleteRow = useCallback(async (id: number) => {
    try {
      await calculatorService.deleteCalculatorRow(id);
      setRequestRequired(true);
    } catch (error) {}
  }, []);

  const handleUpdateRow = useCallback(
    async (id: number, dto: EditCalculatorDto) => {
      try {
        await calculatorService.updateCalculatorRow(id, dto);
      } catch (error) {}
    },
    []
  );

  const onDeleteAll = useCallback(async () => {
    try {
      await calculatorService.deleteAll();
    } catch (error) {}
  }, []);

  const columns = useTableColumns({
    handleAddRow,
    handleDeleteRow,
    handleUpdateRow,
    handleShowStoreDetails,
    handleShowEmployeeDetails,
  });

  return (
    <div className={styles.PageWrapper} id="calculator-page">
      <PageHeader
        title={"Redundancy Calculator"}
        icon={CalculatorIcon}
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            searchValue={search}
            onChange={handleSearchChange}
          />
        }
      />
      <div className="page-content calculator-page">
        <div className={styles.TableWrapper}>
          <div className={styles.TableHeader}>
            <Typography variant="h6" className={styles.HeaderTitle}>
              Employees
            </Typography>
            <Typography className={styles.HeaderCount} variant="body1">
              {total}
            </Typography>
            <div className={styles.Sort}>
              {!!size && (
                <React.Fragment>
                  <Typography variant="body1" className={styles.SortTitle}>
                    Per Page:
                  </Typography>
                  <Select
                    MenuProps={{
                      classes: { paper: styles.SelectPaper },
                      disableScrollLock: true,
                      elevation: 1,
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "center",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "center",
                      },
                      getContentAnchorEl: null,
                    }}
                    classes={{ select: styles.Select }}
                    value={size}
                    onChange={(
                      event: React.ChangeEvent<{ value: unknown }>
                    ) => {
                      handleSizeChange(event.target.value as number);
                    }}
                    input={<InputBase className={styles.SelectInput} />}
                    IconComponent={() => (
                      <img
                        src={ArrowIcon}
                        alt="Size"
                        className={styles.ArrowIcon}
                      />
                    )}
                  >
                    <MenuItem value={20}>20 Rows</MenuItem>
                    <MenuItem value={50}>50 Rows</MenuItem>
                    <MenuItem value={100}>100 Rows</MenuItem>
                  </Select>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className={styles.TableContent}>
            {loading && <Loader />}
            <TableContainer className={styles.TableContainer}>
              <Table id="calculator-table" className={styles.TableRoot}>
                <RedundancyTableHead
                  currentSort={sort}
                  onSortChanged={handleSortChange}
                  columns={columns}
                />
                <TableBody>
                  <RedundancyTableFormRow columns={columns} />
                  {calculatorData.map((employee) => (
                    <RedundancyTableRow
                      key={employee.id}
                      employee={employee}
                      columns={columns}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className={styles.TableFooter}>
            {!!calculatorData.length && (
              <ButtonBase
                disableTouchRipple
                disableRipple
                className={styles.DeleteAllBtn}
                onClick={onDeleteAll}
              >
                <div className={styles.DeleteIconWrapper}>
                  <DeleteIcon />
                </div>

                <Typography className={styles.DeleteAllText}>
                  Remove All
                </Typography>
              </ButtonBase>
            )}
            {!!page && !!pagesCount && (
              <Pagination
                currentPage={page}
                pagesCount={pagesCount}
                onPagination={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedundancyCalculatorPage;
