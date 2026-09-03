import { CalculatorDataColumn } from "../types";
import { EDITABLE_FIELDS } from "../useTableColumns";
import styles from "../redundancy-calc-page.module.scss";
import classNames from "classnames";
import { memo } from "react";

import { CalculatorModel } from "@models/redundancy-calculator.models";

import { TableRow, TableCell } from "@material-ui/core";

interface Props {
  columns: CalculatorDataColumn[];
  employee: CalculatorModel;
}
export const RedundancyTableRow: React.FC<Props> = memo(
  ({ columns, employee }) => {
    return (
      <TableRow key={employee.id} className={styles.TableBodyRow}>
        {columns.map((col) => (
          <TableCell
            key={col.headerName}
            className={classNames(
              styles.TableCell,
              styles.TableBodyCell,

              col.bodyCellClassName
            )}
            align={col.align}
          >
            {col.render(employee, {
              editableField: EDITABLE_FIELDS.indexOf(col.field) !== -1,
            })}
          </TableCell>
        ))}
      </TableRow>
    );
  }
);
