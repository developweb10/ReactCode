import styles from "./task-item.module.scss";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { Badge } from "@components/badge/badge";
import { Avatar } from "@components/avatar/avatar";
import { Typography, Button, IconButton } from "@material-ui/core";
import { TaskStatus, TaskModel } from "@models/tasks.models";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { tasksService } from "@store/tasks/tasks.service";
import moment from "moment";
import { getUserInitials } from "@utils/get-user-initials";
import { getCaseTypeLabel } from "@utils/caseTypeLabel";

interface Props {
  task: TaskModel;
  currentUserId: number;
  createdByMe: boolean;
  showComplete: boolean;
}

export const TaskItem: React.FC<Props> = ({
  task,
  currentUserId,
  createdByMe,
  showComplete,
}) => {
  const taskTitle = task.isNoticeboard
    ? "Noticeboard"
    : task.trackerCase
    ? getCaseTypeLabel(task.trackerCase.caseTypeId)
    : "Ad Hoc";
  const taskSubject =
    task.note ||
    task.messages?.find((message) => message.message)?.message ||
    "No subject";

  const newMessagesCounter = useMemo(
    () =>
      task.messages
        ? task.messages.filter((m) => m.isNew && !m.isOwner).length
        : 0,
    [task]
  );

  const handleShowCase = useCallback(() => {
    if (task.trackerCase) {
      dialogManagerService.openDialog(DialogType.VIEW_CASE, {
        caseType: getCaseTypeLabel(task.trackerCase.caseTypeId),
        caseData: task.trackerCase,
        editMode: false,
        hideActions: true,
        fetchEntity: true,
        handleRefetch: () => {},
      });
    }
  }, [task.trackerCase]);

  const handleShowTask = useCallback(
    (editMode) => {
      if (task.isNew) {
        tasksService.removeNewFromTask(task.id);
      }

      dialogManagerService.openDialog(DialogType.VIEW_TASK, {
        taskData: task,
        editMode,
        hasNewMessages: newMessagesCounter > 0,
      });
    },
    [task, newMessagesCounter]
  );

  const handleCompleteClick = useCallback(async () => {
    try {
      await tasksService.completeTask(task);
    } catch (error) {}
  }, [task]);

  const handleRemoveClick = useCallback(async () => {
    dialogManagerService.openDialog(DialogType.DELETE_TASK, {
      taskData: task,
    });
  }, [task]);

  return (
    <div className={styles.TaskItem}>
      <div className={styles.TaskHeader}>
        <div className={styles.TaskTitle}>
          <div className={styles.TaskName}>
            <button
              className={styles.TaskNameButton}
              type="button"
              onClick={() => handleShowTask(false)}
            >
              <Typography className={styles.TaskNameText}>{taskTitle}</Typography>
              <Typography className={styles.TaskSubjectText}>
                {taskSubject}
              </Typography>
            </button>
            {task.employee && (
              <Typography className={styles.TaskEmployeeName}>
                {`(${task.employee.firstname} ${task.employee.surname})`}
              </Typography>
            )}
          </div>

          <Badge
            title={
              task.completedDate
                ? `Completed: ${moment(task.completedDate).format(
                    "DD MMM YYYY"
                  )}`
                : "Incomplete"
            }
            className={classNames(styles.Badge, {
              [styles.Success]: !!task.completedDate,
            })}
            variant={task.completedDate ? "success" : "warning"}
          />
          {task.isNew && !createdByMe && (
            <div className={styles.TaskNewWrap}>
              <div className={styles.NewCircle}></div>
              <Typography className={styles.NewText}>New</Typography>
            </div>
          )}
          {!task.isNew && newMessagesCounter > 0 && (
            <div className={styles.TaskNewWrap}>
              <div className={styles.NewCircle}></div>
              <Typography className={styles.NewText}>New Messages</Typography>
            </div>
          )}
        </div>
        <div className={styles.TaskDeadline}>
          <Typography className={styles.DueDateText}>Due date:</Typography>
          <Typography className={styles.DeadlineDate}>
            {task.dueDate ? moment(task.dueDate).format("D MMM YYYY") : "-"}
          </Typography>
        </div>
      </div>
      <div className={styles.TaskBody}>
        <div className={styles.TaskCreator}>
          {createdByMe ? (
            <>
              <Avatar
                size="small"
                className={styles.CreatorAvatar}
                role={task.to.role}
              >
                {getUserInitials(task.to.firstname, task.to.surname)}
              </Avatar>
              <Typography className={styles.FromText}>To:</Typography>
              <Typography
                className={styles.CreatorName}
              >{`${task.to.firstname} ${task.to.surname}`}</Typography>
              {task.to.userId === currentUserId && (
                <Badge
                  className={styles.AuthorBadge}
                  title="You"
                  variant="success"
                />
              )}
            </>
          ) : (
            <>
              <Avatar
                size="small"
                className={styles.CreatorAvatar}
                role={task.from.role}
              >
                {getUserInitials(task.from.firstname, task.from.surname)}
              </Avatar>
              <Typography className={styles.FromText}>From:</Typography>
              <Typography
                className={styles.CreatorName}
              >{`${task.from.firstname} ${task.from.surname}`}</Typography>
              {task.from.userId === currentUserId && (
                <Badge
                  className={styles.AuthorBadge}
                  title="You"
                  variant="success"
                />
              )}
            </>
          )}
        </div>
        <div className={styles.TaskActions}>
          <div>
            <Button
              disableElevation
              disableRipple
              className="button-tertiary"
              style={{
                padding: 3,
                marginRight: 5,
                fontSize: 13,
              }}
              onClick={() => handleShowTask(false)}
            >
              View Task
            </Button>
            {task.trackerCase && (
              <Button
                disableElevation
                disableRipple
                className="button-tertiary"
                style={{
                  padding: 3,
                  marginRight: 5,
                  fontSize: 13,
                }}
                onClick={handleShowCase}
              >
                View Case
              </Button>
            )}

            {task.from.userId === currentUserId && (
              <>
                <IconButton
                  className={styles.EditButton}
                  onClick={() => handleShowTask(true)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  className={styles.DeleteButton}
                  onClick={handleRemoveClick}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}

            {task.taskStatus === TaskStatus.INCOMPLETE && showComplete && (
              <Button
                disableElevation
                className={classNames("button-primary", styles.CompleteBtn)}
                color="primary"
                variant="contained"
                onClick={handleCompleteClick}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
