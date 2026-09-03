import styles from "./tracker-clockin-dialog.module.scss";

import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { ClockInForm } from "@modules/home/components/forms/attendance-forms/clock-in-form/clock-in-form";

import { ClockInDto } from "@models/time-attendance.models";

import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

interface Props {
  open: boolean;
  onClose: () => void;
  startTracker: (assignmentName: string) => void;
}

export const TrackerClockInDialog: React.FC<Props> = ({
  open,
  startTracker,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmitCallback = (dto: ClockInDto) => {
    timeAttendanceService.saveTrackerData(dto);

    startTracker(dto.assignmentName);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Clock In"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <ClockInForm onSubmitCallback={onSubmitCallback} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
};
