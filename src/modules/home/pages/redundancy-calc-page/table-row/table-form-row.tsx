import { CalculatorDataColumn } from "../types";
import { SEARCHABLE_FIELDS } from "../useTableColumns";
import styles from "../redundancy-calc-page.module.scss";
import classNames from "classnames";
import { TableRow, TableCell } from "@material-ui/core";

interface Props {
  columns: CalculatorDataColumn[];
}
export const RedundancyTableFormRow: React.FC<Props> = ({ columns }) => {
  return (
    <TableRow className={styles.TableBodyRow}>
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
          {col.render(undefined, {
            searchableField: SEARCHABLE_FIELDS.indexOf(col.field) !== -1,
          })}
        </TableCell>
      ))}
    </TableRow>
  );
};
