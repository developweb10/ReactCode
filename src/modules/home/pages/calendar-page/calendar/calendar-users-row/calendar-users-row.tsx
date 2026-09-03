import React from "react";
import styles from "./calendar-users-row.module.scss";
import classNames from "classnames";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import { calendarQuery } from "@store/calendar/calendar.query";
import { usersQuery } from "@store/users/users.query";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { useObservableState } from "observable-hooks";

import {
  IMonthInfo,
  ISelectedDate,
  CalendarResponseDto,
  ICalendarUserRequests,
} from "@models/calendar.models";

import { UserModel } from "@models/users.models";
import { getRole } from "@utils/get-user-role";

import { CalendarRequestsRow } from "../calendar-requests-row/calendar-requests-row";

import moment, { Moment } from "moment";

interface CalendarUsersRowProps {
  selectedMonthInfo: IMonthInfo;
  selectedDate: ISelectedDate;
}

export const CalendarUsersRow: React.FC<CalendarUsersRowProps> = React.memo(
  ({ selectedDate, selectedMonthInfo }) => {
    const requests = useObservableState(calendarQuery.calendarRequests$, []);
    const users = useObservableState(usersQuery.users$, []);
    const authUser = useObservableState(authorizationQuery.user$);

    if (!users.length) {
      return null;
    }

    return (
      <>
        {users.map((user) => {
          const userRequests = getUserRequests(
            user,
            requests,
            selectedMonthInfo.daysCount,
            moment(`${selectedDate.year}-${selectedDate.month}`, "YYYY-MM")
          );

          const fullName = `${user.firstname} ${user.surname}`;
          return (
            <TableRow key={user.userId}>
              <TableCell
                align="left"
                component="th"
                scope="row"
                className={classNames(styles.BodyUsersCell, {
                  [styles.MyRow]: authUser!.userId === user.userId,
                })}
              >
                <div className={styles.UserWrapper}>
                  <div className={styles.UserName}>{fullName}</div>
                  <div className={styles.UserPosition}>
                    {getRole(user.role)}
                  </div>
                </div>
              </TableCell>
              <CalendarRequestsRow
                userRequests={userRequests}
                selectedDate={selectedDate}
                selectedMonthInfo={selectedMonthInfo}
                user={user}
                authUser={authUser!}
              />
            </TableRow>
          );
        })}
      </>
    );
  }
);

const getUserRequests = (
  user: UserModel,
  requests: CalendarResponseDto[],
  daysInMonth: number,
  selectedDate: Moment
) => {
  const userRequestObject: ICalendarUserRequests = {};
  requests.forEach((request) => {
    if (request.userId === user.userId) {
      const requestStartDate = moment(request.startDate);
      const requestEndDate = moment(request.endDate);

      if (
        requestStartDate.isAfter(selectedDate, "month") ||
        requestEndDate.isBefore(selectedDate, "month")
      ) {
        return;
      }

      const startDay = requestStartDate.isBefore(selectedDate, "month")
        ? 1
        : requestStartDate.date();
      const endDay = requestEndDate.isAfter(selectedDate, "month")
        ? daysInMonth
        : requestEndDate.date();

      userRequestObject[startDay] = {
        ...request,
        startDay,
        endDay,
      };
    }
  });

  return userRequestObject;
};
