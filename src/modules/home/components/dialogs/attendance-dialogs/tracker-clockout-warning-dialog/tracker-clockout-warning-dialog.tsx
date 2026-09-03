import styles from "./tracker-clockout-warning-dialog.module.scss";
import classNames from "classnames";

import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

import { Dialog } from "@components/dialog/dialog";

import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { dialogManagerService } from "@store/dialog-manager/dialog.service";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const TrackerClockoutWarningDialog: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const handleClose = () => {
    timeAttendanceService.deleteTrackerData();
    dialogManagerService.closeAll();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Warning"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Heading}>
          <div className={styles.Title}>
            <span className={styles.TitleText}>
              Are you sure you want to leave? In that case, your result won’t be
              saved.
            </span>
          </div>
        </div>

        <div className={styles.ButtonsWrapper}>
          <Button
            disableElevation
            disableRipple
            className="button-tertiary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disableElevation
            className={classNames("button-primary", styles.RemoveButton)}
            color="primary"
            variant="contained"
            onClick={handleClose}
          >
            Leave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
