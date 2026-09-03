import styles from "./view-task-dialog.module.scss";
import { ReactComponent as FileIcon } from "@assets/images/paper-file-yellow-icon.svg";
import React, { useState, useRef, useCallback, useEffect } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { DialogActions, DialogContent, Button } from "@material-ui/core";

import { tasksService } from "@store/tasks/tasks.service";
import { UserAuthModel } from "@models/authorization.models";
import { TaskModel } from "@models/tasks.models";
import { getCaseTypeLabel } from "@utils/caseTypeLabel";

import { Dialog } from "@components/dialog/dialog";

import { EditTaskForm } from "@home/components/forms/tasks-forms/edit-task-form/edit-task-form";

interface Props {
  open: boolean;
  taskData: TaskModel;
  authUser: UserAuthModel;
  editMode?: boolean;
  hasNewMessages: boolean;
  onClose: () => void;
}

export const ViewTaskDialog: React.FC<Props> = ({
  open,
  taskData,
  editMode,
  authUser,
  hasNewMessages,
  onClose,
}) => {
  const [isEditMode, setEditMode] = useState(!!editMode);
  const headerEntity = taskData.isNoticeboard
    ? "Noticeboard"
    : taskData.trackerCase
    ? `${getCaseTypeLabel(taskData.trackerCase.caseTypeId)} ID: ${
        taskData.trackerCase.id
      }`
    : "Ad Hoc";

  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmit = async () => {
    setEditMode(false);
  };

  useEffect(() => {
    setEditMode(!!editMode);
  }, [editMode]);

  const formRef = useRef<HTMLFormElement>(null);

  const onSaveClick = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  }, []);

  const handleClose = () => {
    if (hasNewMessages) {
      tasksService.removeNewFromTaskMessages(taskData.id);
    }

    onClose();
  };
  const onExited = () => {
    setEditMode(!!editMode);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onExited={onExited}
      fullWidth
      headerTitle={isEditMode ? "Edit Task" : "View Task"}
      headerEntity={headerEntity}
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
              <span className={styles.TitleTextHeader}>
                {isEditMode ? "Edit Task" : "View Task"}
              </span>
              {isEditMode && <>   <span className={styles.TitleTextSub}>
              Please edit needed fields within this
              </span>
              <span className={styles.TitleTextSub}>form and then save updates</span></>}
           
            </div>
          </div>
        </div>
        <EditTaskForm
          ref={formRef}
          authUser={authUser}
          taskData={taskData}
          editMode={isEditMode}
          onCreate={onSubmit}
        />
      </DialogContent>
      {taskData.from.userId === authUser.userId && (
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
            {isEditMode ? (
              <Button
                disableElevation
                className="button-primary"
                color="primary"
                variant="contained"
                onClick={onSaveClick}
              >
                Save Updates
              </Button>
            ) : (
              <Button
                disableElevation
                className="button-primary"
                color="primary"
                variant="contained"
                onClick={() => {
                  setEditMode(true);
                }}
              >
                Edit Task
              </Button>
            )}
          </div>
        </DialogActions>
      )}
    </Dialog>
  );
};
