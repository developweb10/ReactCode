import styles from "./delete-assignment-dialog.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-yellow-icon.svg";
import React, { useState } from "react";

import {
  useMediaQuery,
  Button,
  CircularProgress,
  DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

interface Props {
  open: boolean;
  onClose: () => void;
  id: number;
  handleRefetch?: () => void;
}

export const DeleteAssignmentDialog: React.FC<Props> = ({
  open,
  id,
  onClose,
  handleRefetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  const handleCaseDelete = async () => {
    setLoading(true);
    try {
      await timeAttendanceService.deleteAssignmentRow(id);
      setSuccess(true);
    } catch (error) {}

    setLoading(false);
    setSuccess(true);
  };

  const onExited = () => {
    if (handleRefetch && success) handleRefetch();
    setSuccess(false);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      fullWidth
      headerTitle="Remove Row"
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
    >
      {success ? (
        <DialogContent className={styles.SuccessWrapper}>
          <div className={styles.IconWrapper}>
            <div className={styles.Icon}>
              <DeleteIcon />
            </div>
          </div>
          <div className={styles.Title}>
            <span className={styles.TitleText}>Row successfully</span>
            <strong className={styles.TitleText}>removed</strong>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className={styles.Wrapper}>
          {loading && (
            <div className="overlay-loader with-opacity">
              <CircularProgress
                size="6rem"
                variant="indeterminate"
                disableShrink
              />
            </div>
          )}
          <div className={styles.Heading}>
            <div className={styles.IconWrapper}>
              <div className={styles.Icon}>
                <DeleteIcon />
              </div>
            </div>
            <div className={styles.Title}>
              <span className={styles.TitleText}>Are you sure you want to</span>
              <strong className={styles.TitleText}>remove Row?</strong>
            </div>
          </div>

          <div className={styles.ButtonsWrapper}>
            <Button
              disabled={loading}
              disableElevation
              disableRipple
              className="button-tertiary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              disableElevation
              className={classNames("button-primary", styles.RemoveButton)}
              color="primary"
              variant="contained"
              onClick={handleCaseDelete}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
