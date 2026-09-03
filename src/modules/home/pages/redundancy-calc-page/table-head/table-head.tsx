import { CalculatorDataColumn } from "../types";
import styles from "../redundancy-calc-page.module.scss";
import classNames from "classnames";
import ArrowIcon from "@assets/images/arrow-down-icon.svg";
import { TableRow, TableHead, TableCell, Typography } from "@material-ui/core";

interface Props {
  columns: CalculatorDataColumn[];
  currentSort?: string;
  onSortChanged?: (newSort: string) => void;
}

export const RedundancyTableHead: React.FC<Props> = ({
  columns,
  currentSort,
  onSortChanged,
}) => {
  const [sortField, sortDirection] = currentSort ? currentSort.split(",") : [];

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
    <TableHead className={styles.TableHead}>
      <TableRow>
        {columns.map((col) => (
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
                ? renderSortIcon(sortDirection, col.align, col.reversedSort)
                : null}
            </Typography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
