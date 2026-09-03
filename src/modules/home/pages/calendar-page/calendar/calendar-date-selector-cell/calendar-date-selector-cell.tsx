import TableCell from "@material-ui/core/TableCell";
import styles from "./calendar-date-selector-cell.module.scss";
import Typography from "@material-ui/core/Typography";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-left-icon.svg";
import { ButtonBase } from "@material-ui/core";

import { ISelectedDate } from "@models/calendar.models";
import { getMonthName } from "@utils/date/get-month-name";

interface DateSelectorCellProps {
  selectedDate: ISelectedDate;
  onMonthChange: (n: number) => void;
}
export const DateSelectorCell: React.FC<DateSelectorCellProps> = ({
  selectedDate,
  onMonthChange,
}) => {
  return (
    <TableCell
      key={"date-selector"}
      align="center"
      className={styles.DateSelectorCell}
    >
      <div className={styles.DateSelectorCellContent}>
        <ButtonBase
          className={styles.ArrowLeft}
          onClick={() => onMonthChange(-1)}
          disableRipple
        >
          <ArrowIcon />
        </ButtonBase>

        <Typography className={styles.DateText}>
          {getMonthName(selectedDate.month)} {selectedDate.year}
        </Typography>
        <ButtonBase
          className={styles.ArrowRight}
          onClick={() => onMonthChange(1)}
        >
          <ArrowIcon />
        </ButtonBase>
      </div>
    </TableCell>
  );
};
