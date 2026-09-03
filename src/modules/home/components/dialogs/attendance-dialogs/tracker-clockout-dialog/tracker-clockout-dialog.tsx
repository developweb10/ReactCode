import styles from "./tracker-clockout-dialog.module.scss";

import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { ClockOutForm } from "@modules/home/components/forms/attendance-forms/clock-out-form/clock-out-form";

import { TrackerLocalStorageData } from "@models/time-attendance.models";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";

interface Props {
  open: boolean;
  onClose: () => void;
  timerMinutes: number;
  trackerData: TrackerLocalStorageData;
}

export const TrackerClockOutDialog: React.FC<Props> = ({
  open,
  timerMinutes,
  trackerData,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const handleClose = () => {
    dialogManagerService.pushDialog(DialogType.TRACKER_CLOCK_OUT_WARNING, {});
  };

  const onSubmitCallback = () => {
    timeAttendanceService.deleteTrackerData();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      headerTitle="Clock Out"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <ClockOutForm
          onSubmitCallback={onSubmitCallback}
          trackedMinutes={timerMinutes}
          trackerData={trackerData}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
