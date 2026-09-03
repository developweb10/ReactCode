import styles from "./tracker-component.module.scss";
import classNames from "classnames";
import { useState, useMemo } from "react";
import { ReactComponent as PlayIcon } from "@assets/images/play-icon.svg";
import { ReactComponent as PauseIcon } from "@assets/images/pause-icon.svg";
import { Typography, Button } from "@material-ui/core";
import {
  DialogType,
  dialogManagerService,
} from "@store/dialog-manager/dialog.service";
import { useObservableState } from "observable-hooks";
import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { useInterval } from "@hooks/useInterval";
import { useSleepCheck } from "@hooks/useSleepCheck";
import moment from "moment";

import { TrackerLocalStorageData } from "@models/time-attendance.models";

interface Props {
  trackerStarted: boolean;
  trackerInitialStorageData: TrackerLocalStorageData | null;
  canStartTracker: boolean;
  pauseTracker?: () => void;
  stopTracker: () => void;
  startTracker: () => void;
}
export const TrackerComponent: React.FC<Props> = ({
  trackerStarted,
  trackerInitialStorageData,
  canStartTracker,
  startTracker,
  stopTracker,
}) => {
  const assignmentsCount = useObservableState(
    timeAttendanceQuery.timesheetAssignmentsCount$,
    timeAttendanceQuery.getAll().length
  );

  const getInitialTimer = useMemo(() => {
    if (trackerInitialStorageData) {
      const duration = moment.duration(
        moment().diff(moment(trackerInitialStorageData.startDate))
      );
      return duration;
    }
    return moment.duration({
      seconds: 0,
      minutes: 0,
      hours: 0,
    });
  }, [trackerInitialStorageData]);
  const [timer, setTimer] = useState(getInitialTimer);
  const [assignmentName, setAssignmentName] = useState(
    trackerInitialStorageData?.assignmentName || ""
  );

  useInterval(
    () => {
      const clonedTimer = timer.clone().add(1, "s");
      setTimer(clonedTimer);
    },
    trackerStarted ? 1000 : null
  );

  useSleepCheck(() => {
    const startDate = timeAttendanceService.getTrackerData()?.startDate;
    if (startDate) {
      const duration = moment.duration(moment().diff(moment(startDate)));
      setTimer(duration);
    }
  });

  const handleClockInClick = () => {
    dialogManagerService.openDialog(DialogType.TRACKER_CLOCK_IN, {
      startTracker: (aName: string) => {
        setAssignmentName(aName);
        startTracker();
      },
    });
  };

  const handleClockOutClick = () => {
    dialogManagerService.openDialog(DialogType.TRACKER_CLOCK_OUT, {
      timerMinutes: Math.round(timer.asMinutes()),
      trackerData: timeAttendanceService.getTrackerData(),
    });

    setAssignmentName("");
    setTimer(
      moment.duration({
        seconds: 0,
        minutes: 0,
        hours: 0,
      })
    );
    stopTracker();
  };

  const timerValues = useMemo(() => {
    return timer.format("HH:mm:ss", { trim: false });
  }, [timer]);

  return (
    <div className={styles.TrackerWrapper}>
      <Typography className={styles.TrackerHeaderText}>
        Time Tracking
      </Typography>

      <div className={styles.CardBody}>
        <Typography className={styles.InfoText}>
          {trackerStarted
            ? assignmentName
            : "Click to Start Tracking Your Assignments"}
        </Typography>
        <Typography className={styles.CountdownText}>
          {trackerStarted ? timerValues : "00:00:00"}
        </Typography>
        {trackerStarted ? (
          <Button
            disableElevation
            className={classNames(styles.ClockBtn, "button-primary")}
            color="primary"
            variant="contained"
            onClick={handleClockOutClick}
          >
            <div className={styles.ClockCircle}>
              <PauseIcon />
            </div>
            Clock Out
          </Button>
        ) : (
          <Button
            disableElevation
            className={classNames(styles.ClockBtn, "button-primary", {
              [styles.Disabled]: !assignmentsCount || !canStartTracker,
            })}
            color="primary"
            variant="contained"
            onClick={handleClockInClick}
            disabled={!assignmentsCount || !canStartTracker}
          >
            <div className={styles.ClockCircle}>
              <PlayIcon
                style={{
                  marginLeft: 2,
                }}
              />
            </div>
            Clock In
          </Button>
        )}
      </div>
    </div>
  );
};
