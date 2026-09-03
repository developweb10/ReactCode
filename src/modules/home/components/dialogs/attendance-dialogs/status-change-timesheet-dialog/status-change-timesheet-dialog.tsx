import styles from "./status-change-timesheet-dialog.module.scss";
import { useState, memo } from "react";

import {
  useMediaQuery,
  DialogContent,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";

import { useObservableState } from "observable-hooks";

import { getFormattedCountInHours } from "@utils/date/time-attendance/utils";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

const ApproveBody = memo(() => {
  const timeAttendanceStats = useObservableState(
    timeAttendanceQuery.timeAttendanceStats$,
    timeAttendanceQuery.getTimeAttendanceStats()
  );
  const workedHours = getFormattedCountInHours(
    timeAttendanceStats.workedMinutes
  );
  const contractedHours = getFormattedCountInHours(
    timeAttendanceStats.contractedMinutes
  );
  const overlimit =
    timeAttendanceStats.workedMinutes > timeAttendanceStats.contractedMinutes;

  const underlimit =
    timeAttendanceStats.workedMinutes < timeAttendanceStats.contractedMinutes;
  return (
    <>
      <Typography className={styles.ConfirmText}>
        Are you sure you want to Approve ?
      </Typography>
      {overlimit && (
        <Typography className={styles.AmountText}>
          Amount (<strong>{workedHours}h</strong>) is greater than the
          contracted weekly pay (<strong>{contractedHours}h</strong>)
        </Typography>
      )}
      {underlimit && (
        <Typography className={styles.AmountText}>
          Amount (<strong>{workedHours}h</strong>) is less than the contracted
          weekly pay (<strong>{contractedHours}h</strong>)
        </Typography>
      )}
    </>
  );
});

export const StatusChangeTimesheetDialog: React.FC<Props> = ({
  open,
  title,
  onSubmit,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const handleConfirmClick = async () => {
    setLoading(true);
    try {
      await onSubmit();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle={`${title} Timesheet`}
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        {title === "Approve" ? (
          <ApproveBody />
        ) : (
          <Typography className={styles.ConfirmText}>
            Are you sure you want to {title} ?
          </Typography>
        )}

        {loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}
        <div className={styles.ButtonsWrapper}>
          <Button
            disableElevation
            disableRipple
            className="button-tertiary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            disableElevation
            className="button-primary"
            color={title === "Reject" ? "secondary" : "primary"}
            variant="contained"
            style={{
              padding: "3px 14px",
            }}
            onClick={handleConfirmClick}
            disabled={loading}
          >
            {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
