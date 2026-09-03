import styles from "./add-task-dialog.module.scss";
import { ReactComponent as FileIcon } from "@assets/images/paper-file-yellow-icon.svg";
import React, { useRef, useCallback } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { DialogActions, DialogContent, Button } from "@material-ui/core";
import { UserAuthModel } from "@models/authorization.models";

import { Dialog } from "@components/dialog/dialog";

import { AddTaskForm } from "@modules/home/components/forms/tasks-forms/add-task-form/add-task-form";

interface Props {
  open: boolean;
  authUser: UserAuthModel;
  onClose: () => void;
  handleRefetch: () => void;
}

export const AddTaskDialog: React.FC<Props> = ({
  open,
  authUser,
  onClose,
  handleRefetch,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmit = async () => {
    onClose();
    handleRefetch();
  };

  const formRef = useRef<HTMLFormElement>(null);

  const onCreateClick = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Create New Task"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Heading}>
          <div className={styles.TitleWrapper}>
            <div className={styles.IconWrapper}>
              <div className={styles.Icon}>
                <FileIcon />
              </div>
            </div>
            <div className={styles.Title}>
              <span className={styles.TitleTextHeader}>Create New Task</span>
              <span className={styles.TitleTextSub}>
                Please complete all fields within this
              </span>
              <span className={styles.TitleTextSub}>form and then submit</span>
            </div>
          </div>
        </div>
        <AddTaskForm ref={formRef} authUser={authUser} onCreate={onSubmit} />
      </DialogContent>
      <DialogActions className={styles.Actions}>
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
            className="button-primary"
            color="primary"
            variant="contained"
            onClick={onCreateClick}
          >
            Create
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
