import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styles from "./timesheet-user-page.module.scss";
import TimeAttendanceIcon from "@assets/images/timesheet-yellow-icon.svg";
import { Tabs } from "@components/tabs/tabs";
import { TabPanel } from "@components/tabs/tab-panel";

import { PageHeader } from "@components/page-header/page-header";

import { UserAuthModel } from "@models/authorization.models";

import { UsersTableRouteState } from "@models/time-attendance.models";

import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";

import { ApprovalsTab } from "./approvals-tab/approvals-tab";
import { TimesheetTab } from "./timesheet-tab/timesheet-tab";

export const TABS_LIST = [
  { label: "My Timesheet", value: 1 },
  { label: "Approvals", value: 2 },
];

interface Props {
  usersRouteState?: UsersTableRouteState;
  isAdmin: boolean;
  currentUser: UserAuthModel;
}
const TimesheetUserPage: React.FC<Props> = ({
  usersRouteState,
  isAdmin,
  currentUser,
}) => {
  const history = useHistory();

  const [selectedTab, setTab] = useState(!!usersRouteState ? 2 : 1);

  useEffect(() => {
    if (!timeAttendanceQuery.getValue().assignmentTypes.length) {
      (async () => {
        try {
          await timeAttendanceService.getAssignmentTypes();
        } catch (error) {}
      })();
    }
  }, []);

  const handleTabChange = (event: React.ChangeEvent<{}>, newTabValue: any) => {
    if (newTabValue === 1) {
      history.push(`/time-attendance`);
    }
    setTab(newTabValue);
  };

  return (
    <div className={styles.PageWrapper} id="timeattendance-page">
      <TabPanel selectedValue={selectedTab} tabValue={1}>
        <PageHeader
          title={"Time & Attendance"}
          icon={TimeAttendanceIcon}
          tabs={
            isAdmin ? (
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                labels={TABS_LIST}
              />
            ) : undefined
          }
        />

        <div className="page-content timeattendance-page">
          <TimesheetTab currentUser={currentUser} />
        </div>
      </TabPanel>
      <TabPanel selectedValue={selectedTab} tabValue={2}>
        <ApprovalsTab
          usersRouteState={usersRouteState}
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
        />
      </TabPanel>
    </div>
  );
};

export default TimesheetUserPage;
