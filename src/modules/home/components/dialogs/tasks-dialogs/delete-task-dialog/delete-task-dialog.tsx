import styles from "./delete-task-dialog.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-yellow-icon.svg";
import React, { useState } from "react";
import { TaskModel, TaskStatus } from "@models/tasks.models";
import { CaseType } from "@models/cases.models";
import { tasksService } from "@store/tasks/tasks.service";
import { Badge } from "@components/badge/badge";
import { Typography } from "@material-ui/core";
import moment from "moment";

import {
  useMediaQuery,
  Button,
  CircularProgress,
  DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

interface Props {
  open: boolean;
  taskData: TaskModel;
  onClose: () => void;
}

export const DeleteTaskDialog: React.FC<Props> = ({
  open,
  onClose,
  taskData,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const taskTitle = taskData.isNoticeboard
    ? "Noticeboard"
    : taskData.trackerCase
    ? CaseType[taskData.trackerCase.caseTypeId]
    : "Ad Hoc";
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  const handleCaseDelete = async () => {
    setLoading(true);
    try {
      await tasksService.removeTask(taskData);
      setSuccess(true);
    } catch (error) {}

    setLoading(false);
  };

  const onExited = () => {
    setSuccess(false);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      fullWidth
      headerTitle="Remove Task"
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
            <span className={styles.TitleText}>Task successfully</span>
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
              <strong className={styles.TitleText}>remove Task?</strong>
            </div>
          </div>
          <div className={styles.TaskCard}>
            <div className={styles.TaskStatus}>
              <Badge
                className={styles.Badge}
                title={
                  taskData.taskStatus === TaskStatus.COMPLETED
                    ? moment(taskData.completedDate).format("DD MMM YYYY")
                    : "Incomplete"
                }
                variant={
                  taskData.taskStatus === TaskStatus.COMPLETED
                    ? "success"
                    : "error"
                }
              />
            </div>
            <div className={styles.TaskCardBody}>
              <Typography className={styles.TaskName}>{taskTitle}</Typography>
              <div className={styles.TaskDeadline}>
                <Typography className={styles.DueDateText}>
                  Due date:
                </Typography>
                <Typography className={styles.DeadlineDate}>
                  {taskData.dueDate
                    ? moment(taskData.dueDate).format("D MMM YYYY")
                    : "-"}
                </Typography>
              </div>
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
