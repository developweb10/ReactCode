import styles from "./add-assignment-dialog.module.scss";

import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { AddAssignmentForm } from "@modules/home/components/forms/attendance-forms/add-assignment-form/add-assignment-form";

import { Moment } from "moment";

interface Props {
  open: boolean;
  onClose: () => void;
  weekRange: {
    from: Moment;
    to: Moment;
  };
  userId?: number;
}

export const AddAssignmentDialog: React.FC<Props> = ({
  open,
  weekRange,
  userId,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onAdded = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Add Row"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <AddAssignmentForm
          userId={userId}
          weekRange={weekRange}
          onAdded={onAdded}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
