import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import TimesheetUserPage from "./timesheet-user-page";
import TimesheetAdminPage from "./timesheet-admin-page";

import { TimesheetRouteState } from "@models/time-attendance.models";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { UserRoleEnum } from "@models/users.models";

import { useObservable } from "@libreact/use-observable";

const TimeAttendancePage = () => {
  const [currentUser] = useObservable(authorizationQuery.user$);
  const location = useLocation<TimesheetRouteState>();
  const timesheetRouteState =
    location.state && location.state.timesheetTableState;

  const usersRouteState = location.state && location.state.usersTableState;

  const isAdmin = useMemo(() => {
    return currentUser?.role === UserRoleEnum.ROLE_ADMIN;
  }, [currentUser?.role]);

  if (timesheetRouteState && isAdmin) {
    return (
      <TimesheetAdminPage
        timesheetRouteState={timesheetRouteState}
        currentUser={currentUser!}
      />
    );
  }
  return (
    <TimesheetUserPage
      usersRouteState={usersRouteState}
      isAdmin={isAdmin}
      currentUser={currentUser!}
    />
  );
};

export default TimeAttendancePage;
