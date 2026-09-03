import styles from "./edit-assignment-dialog.module.scss";

import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { EditAssignmentForm } from "@modules/home/components/forms/attendance-forms/edit-assignment-form/edit-assignment-form";

import { AssignmentTimesheetWithNameModel } from "@models/time-attendance.models";

import { Moment } from "moment";

interface Props {
  open: boolean;
  onClose: () => void;
  assignment: AssignmentTimesheetWithNameModel;
  weekRange: {
    from: Moment;
    to: Moment;
  };
  handleRefetch?: () => void;
  viewMode?: boolean;
  adminView?: boolean;
}

export const EditAssignmentDialog: React.FC<Props> = ({
  open,
  weekRange,
  assignment,
  viewMode,
  adminView,
  onClose,
  handleRefetch,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onUpdated = () => {
    if (handleRefetch) handleRefetch();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle={viewMode ? "View Row" : "Edit Row"}
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <EditAssignmentForm
          assignment={assignment}
          weekRange={weekRange}
          onUpdated={onUpdated}
          onCancel={onClose}
          viewMode={viewMode}
          adminView={!!adminView}
        />
      </DialogContent>
    </Dialog>
  );
};
