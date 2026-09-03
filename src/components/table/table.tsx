import React, { useCallback } from "react";
import ArrowIcon from "@assets/images/arrow-down-icon.svg";
import classNames from "classnames";
import { Moment } from "moment";
import styles from "./table.module.scss";

import {
  Select,
  InputBase,
  MenuItem,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  Typography,
} from "@material-ui/core";

import { Pagination } from "@components/pagination/pagination";
import { Loader } from "@components/loader/loader";
import { TablePeriodSelector } from "./table-period-selector/table-period-selector";

import { TableColumn } from "./types";

import { Observable } from "rxjs";
import { useObservableState } from "observable-hooks";

const TableRxLoader = ({ loading$ }: { loading$: Observable<boolean> }) => {
  const loading = useObservableState(loading$, true);
  return loading ? <Loader /> : null;
};

interface TableProps<T> {
  id?: string;
  cols: TableColumn<T>[];
  tableData: T[];
  customHeader?: React.ReactNode;
  loading$?: Observable<boolean>;
  loading?: boolean;
  title: string;
  count?: number;
  currentPage?: number;
  pagesCount?: number;
  onPagination?: (page: number) => void;
  currentSize?: number;
  onSizeChanged?: (size: number) => void;
  currentSort?: string;
  onSortChanged?: (newSort: string) => void;
  filterComponent?: React.ReactNode;
  currentPeriod?: {
    from: Moment;
    to: Moment;
  };
  handlePeriodChange?: (newPeriod: { from: Moment; to: Moment }) => void;
}

export function Table<T extends { id: number; [key: string]: any }>({
  id,
  cols,
  tableData,
  loading,
  loading$,
  customHeader,
  title,
  count,
  currentPage,
  pagesCount,
  onPagination,
  currentSize,
  onSizeChanged,
  currentSort,
  onSortChanged,
  filterComponent,
  currentPeriod,
  handlePeriodChange,
}: React.PropsWithChildren<TableProps<T>>) {
  const renderCell = useCallback(
    ({ render, field }: TableColumn<T>, data: T) => {
      if (render) {
        return render(data);
      }

      if (data && data[field]) {
        return <Typography>{data[field]}</Typography>;
      }

      return null;
    },
    []
  );

  const renderSortIcon = (
    sortDirection?: string,
    align?: string,
    isReversed?: boolean
  ) => {
    if (!sortDirection) return null;
    if (sortDirection === "desc") {
      return (
        <img
          src={ArrowIcon}
          className={classNames(styles.SortArrow, {
            [styles.SortArrowRotate]: isReversed,
          })}
          alt="desc"
        />
      );
    }

    if (sortDirection === "asc") {
      return (
        <img
          src={ArrowIcon}
          className={classNames(styles.SortArrow, {
            [styles.SortArrowRotate]: !isReversed,
          })}
          alt="asc"
        />
      );
    }
  };

  return (
    <div className={styles.TableWrapper}>
      {customHeader || (
        <div className={styles.TableHeader}>
          {filterComponent || null}
          <Typography variant="h6" className={styles.HeaderTitle}>
            {title}
          </Typography>
          <Typography className={styles.HeaderCount} variant="body1">
            {count}
          </Typography>
          <div className={styles.RightSection}>
            {currentPeriod && !!handlePeriodChange && (
              <TablePeriodSelector
                handlePeriodChange={handlePeriodChange}
                currentPeriod={currentPeriod}
              />
            )}
            <div className={styles.Sort}>
              {!!currentSize && (
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
                    value={currentSize}
                    onChange={(
                      event: React.ChangeEvent<{ value: unknown }>
                    ) => {
                      if (onSizeChanged) {
                        onSizeChanged(event.target.value as number);
                      }
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
        </div>
      )}

      <div className={styles.TableContent}>
        <TableContainer className={styles.TableContainer}>
          {!!loading$ && <TableRxLoader loading$={loading$} />}
          {!!loading && <Loader />}
          <MuiTable id={id} className={styles.TableRoot}>
            <TableHead className={styles.TableHead}>
              <MuiTableRow>
                {cols.map((col) => {
                  const [sortField, sortDirection] = currentSort
                    ? currentSort.split(",")
                    : [];

                  return (
                    <TableCell
                      key={col.headerName}
                      align={col.align}
                      className={classNames(
                        styles.TableCell,
                        styles.TableHeadCell,
                        {
                          [styles.TableHeadDisabledSort]: col.disableSort,
                        },
                        col.headCellClassName
                      )}
                      onClick={() => {
                        if (onSortChanged && !col.disableSort) {
                          let newDirection = "asc";

                          if (sortDirection && sortField === col.field) {
                            if (sortDirection === "asc") {
                              newDirection = "desc";
                            }
                            if (sortDirection === "desc") {
                              newDirection = "asc";
                            }
                          }
                          onSortChanged(`${col.field},${newDirection}`);
                        }
                      }}
                    >
                      <Typography className={styles.HeaderText}>
                        {col.headerName}
                        {sortField && sortField === col.field
                          ? renderSortIcon(
                              sortDirection,
                              col.align,
                              col.reversedSort
                            )
                          : null}
                      </Typography>
                    </TableCell>
                  );
                })}
              </MuiTableRow>
            </TableHead>
            <TableBody className={styles.TableBody}>
              {tableData.map((data) => (
                <MuiTableRow key={data.id} className={styles.TableBodyRow}>
                  {cols.map((col) => (
                    <TableCell
                      key={col.headerName}
                      align={col.align}
                      className={classNames(
                        styles.TableCell,
                        styles.TableBodyCell,

                        col.bodyCellClassName
                      )}
                    >
                      {renderCell(col, data)}
                    </TableCell>
                  ))}
                </MuiTableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      </div>
      <div className={styles.TableFooter}>
        {!!currentPage && !!pagesCount && (
          <Pagination
            currentPage={currentPage}
            pagesCount={pagesCount}
            onPagination={onPagination}
          />
        )}
      </div>
    </div>
  );
}
