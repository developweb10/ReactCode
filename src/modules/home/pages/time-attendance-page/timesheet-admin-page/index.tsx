import { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import styles from "./timesheet-admin-page.module.scss";
import TimeAttendanceIcon from "@assets/images/timesheet-yellow-icon.svg";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-down-icon.svg";
import { ReactComponent as ExportIcon } from "@assets/images/export-icon.svg";

import { Tabs } from "@components/tabs/tabs";
import { PageHeader } from "@components/page-header/page-header";
import { TimeSheetTable } from "../components/timesheet-table/timesheet-table";
import { TimesheetStats } from "./timesheet-stats/timesheet-stats";
import { Typography, ButtonBase } from "@material-ui/core";

import { TimesheetTableRouteState } from "@models/time-attendance.models";

import { UserAuthModel } from "@models/authorization.models";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";

import { useObservableState } from "observable-hooks";
import moment from "moment";

export const TABS_LIST = [
  { label: "Week view", value: "week" },
  { label: "Month view", value: "month" },
];

interface Props {
  timesheetRouteState: TimesheetTableRouteState;
  currentUser: UserAuthModel;
}

const TimesheetAdminPage: React.FC<Props> = ({
  timesheetRouteState,
  currentUser,
}) => {
  const history = useHistory();

  const timeAttendanceStats = useObservableState(
    timeAttendanceQuery.timeAttendanceStats$,
    timeAttendanceQuery.getTimeAttendanceStats()
  );
  const [selectedTab, setTab] = useState("week");

  const initialWeekRange = useMemo(() => {
    return {
      from: moment(timesheetRouteState.weekRange.from, "YYYY-MM-DD").startOf(
        "week"
      ),
      to: moment(timesheetRouteState.weekRange.to, "YYYY-MM-DD").endOf("week"),
    };
  }, [timesheetRouteState.weekRange.from, timesheetRouteState.weekRange.to]);

  const [weekRange, setWeekRange] = useState(initialWeekRange);

  useEffect(() => {
    if (!timeAttendanceQuery.getValue().assignmentTypes.length) {
      (async () => {
        try {
          await timeAttendanceService.getAssignmentTypes();
        } catch (error) {}
      })();
    }
  }, []);

  const handleWeekRangeChange = (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => {
    setWeekRange(newRange);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newTabValue: any) => {
    setTab(newTabValue);

    if (newTabValue === "week") {
      handleWeekRangeChange({
        from: moment().startOf("week"),
        to: moment().endOf("week"),
      });
    }

    if (newTabValue === "month") {
      handleWeekRangeChange({
        from: moment().startOf("month"),
        to: moment().endOf("month"),
      });
    }
  };

  const handleBack = () => {
    history.push(timesheetRouteState.backPath || "/time-attendance", {
      usersTableState: {
        weekRange: timesheetRouteState.weekRange,
      },
    });
  };

  const handleExportClick = async () => {
    await timeAttendanceService.exportTimesheet({
      dateFrom: weekRange.from.format("YYYY-MM-DD"),
      dateTo: weekRange.to.format("YYYY-MM-DD"),
      userId: timesheetRouteState.userId,
    });
  };

  return (
    <div className={styles.PageWrapper} id="timeattendance-page">
      <PageHeader
        title={`Timesheet (${timesheetRouteState.userName})`}
        icon={TimeAttendanceIcon}
        tabs={
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            labels={TABS_LIST}
          />
        }
        buttonIcon={<ExportIcon />}
        buttonTitle={"Export CSV"}
        onButtonClick={handleExportClick}
      />

      <div className="page-content timeattendance-page">
        <ButtonBase
          onClick={handleBack}
          className={styles.BackButton}
          disableRipple
        >
          <ArrowIcon className={styles.BackIcon} />
          <Typography>Back</Typography>
        </ButtonBase>
        <div className={styles.Wrapper}>
          <div className={styles.TimeSheetTableWrapper}>
            <TimeSheetTable
              weekRange={weekRange}
              handleWeekRangeChange={handleWeekRangeChange}
              currentUser={currentUser}
              status={timeAttendanceStats.status}
              userId={timesheetRouteState.userId}
              adminMode
              canManipulateTimesheet
              monthView={selectedTab === "month"}
            />
          </div>
          <div className={styles.RightColumn}>
            <TimesheetStats
              timeAttendanceStats={timeAttendanceStats}
              selectedTab={selectedTab}
              status={timeAttendanceStats.status}
              monthView={selectedTab === "month"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetAdminPage;
