import { useState, useRef, useMemo } from "react";
import styles from "./timesheet-tab.module.scss";
import classNames from "classnames";

import { Typography } from "@material-ui/core";
import { TimeSheetTable } from "../../components/timesheet-table/timesheet-table";
import { TrackerComponent } from "../../components/tracker-component/tracker-component";
import { UserAuthModel } from "@models/authorization.models";
import { TimesheetStatus } from "@models/time-attendance.models";

import { useObservableState } from "observable-hooks";
import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import moment from "moment";
import { getFormattedCountInHours } from "@utils/date/time-attendance/utils";
interface Props {
  currentUser: UserAuthModel;
}

export const TimesheetTab: React.FC<Props> = ({ currentUser }) => {
  const timeAttendanceStats = useObservableState(
    timeAttendanceQuery.timeAttendanceStats$,
    timeAttendanceQuery.getTimeAttendanceStats()
  );
  const trackerInitialStorageData = useRef(
    timeAttendanceService.getTrackerData()
  );
  const initialWeekRange = useMemo(() => {
    if (trackerInitialStorageData.current) {
      const startDate = trackerInitialStorageData.current.startDate;
      return {
        from: moment(startDate).startOf("week"),
        to: moment(startDate).endOf("week"),
      };
    }
    return {
      from: moment().startOf("week"),
      to: moment().endOf("week"),
    };
  }, []);

  const [trackerStarted, setTracker] = useState(
    !!trackerInitialStorageData.current
  );
  const [weekRange, setWeekRange] = useState(initialWeekRange);

  const todayOutOfRange = useMemo(() => {
    return !moment().isBetween(weekRange.from, weekRange.to);
  }, [weekRange]);

  const canManipulateTimesheet = useMemo(() => {
    return (
      !trackerStarted &&
      !todayOutOfRange &&
      (timeAttendanceStats.status === TimesheetStatus.CREATED ||
        !timeAttendanceStats.status)
    );
  }, [timeAttendanceStats.status, todayOutOfRange, trackerStarted]);

  const canStartTracker = useMemo(() => {
    return (
      !todayOutOfRange &&
      (timeAttendanceStats.status === TimesheetStatus.CREATED ||
        timeAttendanceStats.status === TimesheetStatus.REJECTED)
    );
  }, [timeAttendanceStats.status, todayOutOfRange]);

  const handleTrackerToggle = (trackerState: boolean) => () => {
    setTracker(trackerState);
  };

  const handleWeekRangeChange = (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => {
    setWeekRange(newRange);
  };

  return (
    <div className={styles.Wrapper}>
      <div className={styles.TimeSheetTableWrapper}>
        <TimeSheetTable
          canManipulateTimesheet={!!canManipulateTimesheet}
          weekRange={weekRange}
          handleWeekRangeChange={handleWeekRangeChange}
          currentUser={currentUser}
          trackerStarted={trackerStarted}
          status={timeAttendanceStats.status}
        />
      </div>
      <div className={styles.RightColumn}>
        <TrackerComponent
          canStartTracker={!!canStartTracker}
          trackerInitialStorageData={trackerInitialStorageData.current}
          trackerStarted={trackerStarted}
          stopTracker={handleTrackerToggle(false)}
          startTracker={handleTrackerToggle(true)}
        />
        <div className={classNames(styles.Card, styles.ContractWrapper)}>
          <Typography className={styles.ContractInfo}>Contract HPW</Typography>
          <Typography className={styles.ContractHours}>
            {getFormattedCountInHours(timeAttendanceStats.contractedMinutes)}h
          </Typography>
        </div>
      </div>
    </div>
  );
};
