import { useRef, memo } from "react";

import classNames from "classnames";
import styles from "./calendar-requests-row.module.scss";

import TableCell from "@material-ui/core/TableCell";

import {
  IMonthInfo,
  ISelectedDate,
  ICalendarUserRequests,
  ICalendarUserRequestWithDate,
} from "@models/calendar.models";

import { UserModel } from "@models/users.models";
import { UserAuthModel } from "@models/authorization.models";

import { isWeekend } from "@utils/date/is-weekend";
import { isToday } from "@utils/date/is-today";
import { getFullDate } from "@utils/date/get-full-date";

import { EmptyCell } from "./empty-cell";
import { RequestCell } from "./request-cell";

interface CalendarRequestsRowProps {
  userRequests: ICalendarUserRequests;
  selectedMonthInfo: IMonthInfo;
  selectedDate: ISelectedDate;
  user: UserModel;
  authUser: UserAuthModel;
}

export const CalendarRequestsRow: React.FC<CalendarRequestsRowProps> = memo(
  ({ user, authUser, userRequests, selectedMonthInfo, selectedDate }) => {
    const { month, year } = selectedDate;
    const { daysCount, firstDayWeekday } = selectedMonthInfo;

    const calendarCells: JSX.Element[] = [];
    const requestCellInfo = useRef<null | ICalendarUserRequestWithDate>(null);

    for (let i = 0; i < daysCount; i++) {
      const dayNumber = i + 1;
      const requestCell = userRequests[dayNumber];
      const isWeekEndCell = isWeekend(i + firstDayWeekday - 1);
      const fullDate = getFullDate(dayNumber, month, year);

      if (dayNumber === 1) {
        requestCellInfo.current = null;
      }
      if (requestCellInfo.current) {
        const duration = requestCellInfo.current.days;
        if (duration > 1) {
          if (dayNumber > requestCellInfo.current.endDay) {
            requestCellInfo.current = null;
          } else {
            requestCellInfo.current = {
              ...requestCellInfo.current,
              requestDayNumber: dayNumber,
              requestFullDate: fullDate,
            };
          }
        } else {
          requestCellInfo.current = null;
        }
      }
      if (!!requestCell) {
        requestCellInfo.current = {
          ...requestCell,
          requestDayNumber: dayNumber,
          requestFullDate: fullDate,
        };
      }

      calendarCells.push(
        <TableCell
          key={`Cell ${dayNumber}`}
          align="center"
          className={classNames(styles.BodyCell, {
            [styles.WeekendCell]: isWeekEndCell,
            [styles.CurrentDay]: isToday(i + 1, month, year),
            [styles.MyRow]: authUser.userId === user.userId,
            [styles.RequestCell]: !!requestCellInfo.current,
          })}
        >
          <div className={classNames(styles.BodyCellContent, {})}>
            {requestCellInfo.current && !isWeekEndCell ? (
              <RequestCell
                requestInfo={requestCellInfo.current}
                selectedDate={selectedDate}
                user={user}
              />
            ) : (
              <EmptyCell
                isWeekEndCell={isWeekEndCell}
                fullDate={fullDate}
                canCreateRequest={authUser.userId === user.userId}
              />
            )}
          </div>
        </TableCell>
      );
    }

    return <>{calendarCells}</>;
  }
);
