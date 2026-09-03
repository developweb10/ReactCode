import styles from "./calendar-header-days-row.module.scss";
import classNames from "classnames";

import TableCell from "@material-ui/core/TableCell";

import { IMonthInfo, ISelectedDate } from "@models/calendar.models";

import { isWeekend } from "@utils/date/is-weekend";
import { isToday } from "@utils/date/is-today";
import { getWeekDay } from "@utils/date/get-weekday";

interface Props {
  selectedMonthInfo: IMonthInfo;
  selectedDate: ISelectedDate;
}
export const CalendarHeaderDaysRow: React.FC<Props> = ({
  selectedMonthInfo,
  selectedDate,
}) => {
  const { daysCount, firstDayWeekday } = selectedMonthInfo;
  const { month, year } = selectedDate;
  const daysCells: JSX.Element[] = [];
  for (let dayNumber = 0; dayNumber < daysCount; dayNumber++) {
    const isWeekEndCell = isWeekend(dayNumber + firstDayWeekday - 1);
    const cell = (
      <TableCell
        key={`Day ${dayNumber}`}
        align="center"
        className={classNames(styles.HeaderCell, {
          [styles.WeekendCell]: isWeekEndCell,
          [styles.CurrentDay]: isToday(dayNumber + 1, month, year),
        })}
      >
        <div className={styles.HeaderCellContent}>
          <div className={styles.DayNumber}>{dayNumber + 1}</div>
          <div className={styles.WeekDay}>
            {getWeekDay(dayNumber + firstDayWeekday - 1)}
          </div>
        </div>
      </TableCell>
    );

    daysCells.push(cell);
  }

  return <>{daysCells}</>;
};
