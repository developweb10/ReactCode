import styles from "./timesheet-stats.module.scss";
import { ReactComponent as CardIcon } from "@assets/images/credit-yellow-icon.svg";
import { ReactComponent as ClockIcon } from "@assets/images/clock-yellow-icon.svg";
import { ReactComponent as MoneyIcon } from "@assets/images/timesheet-yellow-icon.svg";

import {
  TimeAndAttendanceStats,
  TimesheetStatus,
} from "@models/time-attendance.models";
import { Typography } from "@material-ui/core";
import { getFormattedCountInHours } from "@utils/date/time-attendance/utils";

interface Props {
  timeAttendanceStats: TimeAndAttendanceStats;
  selectedTab: string;
  status: TimesheetStatus;
  monthView: boolean;
}
export const TimesheetStats: React.FC<Props> = ({
  timeAttendanceStats,
  selectedTab,
  status,
  monthView,
}) => {
  const displayStats = status === TimesheetStatus.APPROVED || monthView;

  const totalHoursWorked = displayStats
    ? getFormattedCountInHours(timeAttendanceStats.workedMinutes)
    : 0;
  const totalEarnings = displayStats
    ? parseFloat(
        (totalHoursWorked * timeAttendanceStats.contractedHourlyRate).toFixed(2)
      )
    : 0;

  const contractedHours = getFormattedCountInHours(
    timeAttendanceStats.contractedMinutes
  );
  return (
    <>
      <div className={styles.Card}>
        <div className={styles.CardHeader}>
          <div className={styles.IconWrapper}>
            <ClockIcon />
          </div>

          <Typography className={styles.CardHeaderText}>
            Total hours worked this {selectedTab}
          </Typography>
        </div>
        <div className={styles.CardBody}>
          <Typography className={styles.NumberValue}>
            {totalHoursWorked}h
          </Typography>
        </div>
      </div>
      <div className={styles.Card}>
        <div className={styles.CardHeader}>
          <div className={styles.IconWrapper}>
            <MoneyIcon />
          </div>
          <Typography className={styles.CardHeaderText}>
            Total earnings this {selectedTab}
          </Typography>
        </div>
        <div className={styles.CardBody}>
          <div className={styles.TotalWrapper}>
            <Typography className={styles.NumberValue}>
              £{totalEarnings}
            </Typography>
            <Typography className={styles.TipText}>
              Number of hours worked X Hourly rate
            </Typography>
          </div>
        </div>
      </div>
      <div className={styles.Card}>
        <div className={styles.CardHeader}>
          <div className={styles.IconWrapper}>
            <ClockIcon />
          </div>
          <Typography className={styles.CardHeaderText}>
            Contracted hours per {selectedTab}
          </Typography>
        </div>
        <div className={styles.CardBody}>
          <Typography className={styles.NumberValue}>
            {contractedHours}h
          </Typography>
        </div>
      </div>
      <div className={styles.Card}>
        <div className={styles.CardHeader}>
          <div className={styles.IconWrapper}>
            <CardIcon />
          </div>
          <Typography className={styles.CardHeaderText}>
            Contracted {selectedTab}ly pay
          </Typography>
        </div>
        <div className={styles.CardBody}>
          <Typography className={styles.NumberValue}>
            £{timeAttendanceStats.contractedPay}
          </Typography>
        </div>
      </div>
    </>
  );
};
