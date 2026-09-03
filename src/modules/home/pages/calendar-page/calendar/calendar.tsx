import { useMemo } from "react";
import styles from "./calendar.module.scss";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CircularProgress from "@material-ui/core/CircularProgress";

import { CalendarHeaderDaysRow } from "./calendar-header-days-row/calendar-header-days-row";
import { DateSelectorCell } from "./calendar-date-selector-cell/calendar-date-selector-cell";
import { CalendarLegend } from "./calendar-legend/calendar-legend";

import { CalendarUsersRow } from "./calendar-users-row/calendar-users-row";

import { getDaysNumberInMonth } from "@utils/date/get-days-number-in-month";
import { getWeekDayNumber } from "@utils/date/get-weekday-number";

import { ISelectedDate, IMonthInfo } from "@models/calendar.models";

interface CalendarProps {
  selectedDate: ISelectedDate;
  onMonthChange: (n: number) => void;
  loading: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onMonthChange,
  loading,
}) => {
  const selectedMonthInfo: IMonthInfo = useMemo(
    () => ({
      daysCount: getDaysNumberInMonth(selectedDate.month, selectedDate.year),
      firstDayWeekday: getWeekDayNumber(selectedDate.month, selectedDate.year),
    }),
    [selectedDate.month, selectedDate.year]
  );

  return (
    <div className={styles.CalendarWrapper}>
      {loading && (
        <div className="overlay-loader with-opacity">
          <CircularProgress size="6rem" variant="indeterminate" disableShrink />
        </div>
      )}
      <div className={styles.CalendarHeader}>
        <CalendarLegend />
      </div>
      <div className={styles.Calendar}>
        <TableContainer>
          <Table aria-label="Calendar">
            <TableHead className={styles.CalendarTableHeader}>
              <TableRow>
                <DateSelectorCell
                  selectedDate={selectedDate}
                  onMonthChange={onMonthChange}
                />
                <CalendarHeaderDaysRow
                  selectedMonthInfo={selectedMonthInfo}
                  selectedDate={selectedDate}
                />
              </TableRow>
            </TableHead>
            <TableBody className={styles.CalendarTableBody}>
              <CalendarUsersRow
                selectedMonthInfo={selectedMonthInfo}
                selectedDate={selectedDate}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
