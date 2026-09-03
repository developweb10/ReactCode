import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import classNames from "classnames";
import moment from "moment";

import { TypeStatistic } from "@models/dashboard.models";
import { TaskModel, TaskPriority, TaskStatus } from "@models/tasks.models";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";

import sharedStyles from "../dashboard-page.module.scss";
import styles from "./group-noticeboard-section.module.scss";

interface Props {
  tasks: TaskModel[];
  loading?: boolean;
}

interface PositionTypeProps {
  positions: TypeStatistic[];
}

const getUserName = (user?: TaskModel["from"]) =>
  user ? `${user.firstname} ${user.surname}`.trim() : "-";

const getTaskSubject = (task: TaskModel) =>
  task.note ||
  task.messages?.find((message) => message.message)?.message ||
  "Noticeboard task";

const priorityOrder: Record<TaskPriority, number> = {
  [TaskPriority.HIGH]: 0,
  [TaskPriority.MEDIUM]: 1,
  [TaskPriority.LOW]: 2,
};

export const GroupNoticeboardSection: React.FC<Props> = ({
  tasks,
  loading,
}) => {
  const activeTasks = tasks.filter(
    (task) => task.taskStatus !== TaskStatus.COMPLETED
  ).sort((a, b) => {
    const aPriority = a.priority || TaskPriority.MEDIUM;
    const bPriority = b.priority || TaskPriority.MEDIUM;

    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });
  const activeTasksCount = activeTasks.length;

  return (
    <Box
      className={classNames(sharedStyles.Section, styles.GroupNoticeboardSection)}
    >
      <Box className={classNames(sharedStyles.Card, styles.NoticeboardCard)}>
        {loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}
        <div className={styles.NoticeboardHeader}>
          <div>
            <Typography className={styles.NoticeboardTitle}>
              Group Noticeboard
            </Typography>
          </div>
          <div className={styles.TaskCount}>
            <span>{activeTasksCount}</span>
            <strong>TASKS</strong>
          </div>
        </div>

        <div className={styles.TaskTable}>
          <div className={styles.TableHeader}>
            <span>Creator</span>
            <span>Subject</span>
            <span>Priority</span>
            <span>User</span>
            <span>Deadline</span>
          </div>
          {activeTasks.map((task) => (
            <div className={styles.TableRow} key={task.id}>
              <span>{getUserName(task.from)}</span>
              <button
                className={styles.SubjectButton}
                type="button"
                onClick={() =>
                  dialogManagerService.openDialog(DialogType.VIEW_TASK, {
                    taskData: task,
                    editMode: false,
                    hasNewMessages: false,
                  })
                }
              >
                {getTaskSubject(task)}
              </button>
              <span
                className={classNames(
                  styles.PriorityStatus,
                  styles[`Priority${task.priority || TaskPriority.MEDIUM}`]
                )}
              >
                {task.priority || TaskPriority.MEDIUM}
              </span>
              <span>
                {task.noticeboardTarget === "ALL" ? "All" : getUserName(task.to)}
              </span>
              <span
                className={classNames(styles.Deadline, {
                  [styles.HighPriorityDeadline]:
                    (task.priority || TaskPriority.MEDIUM) ===
                    TaskPriority.HIGH,
                })}
              >
                {task.dueDate ? moment(task.dueDate).format("DD/MM/YY") : "-"}
              </span>
            </div>
          ))}
          {!loading && !activeTasks.length && (
            <Typography className={styles.EmptyNoticeboard}>
              No active noticeboard tasks.
            </Typography>
          )}
        </div>
      </Box>
    </Box>
  );
};

export const PositionTypeSection: React.FC<PositionTypeProps> = ({
  positions,
}) => (
  <Box className={classNames(sharedStyles.Section, styles.PositionTypeSection)}>
    <Box className={classNames(sharedStyles.Card, styles.PositionTypeCard)}>
      <Typography className={sharedStyles.CardTitle}>Position type</Typography>
      <div className={styles.PositionsContainer}>
        {positions.map((position) => (
          <div className={styles.PositionItem} key={position.type}>
            <div className={styles.PositionLabel}>
              <Typography className={styles.PositionName}>
                {position.type}
              </Typography>
              <Typography className={styles.PositionPercent}>
                {position.percentage}%
              </Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={position.percentage}
              className={styles.PositionProgress}
              classes={{ bar: styles.ProgressBar }}
            />
          </div>
        ))}
      </div>
    </Box>
  </Box>
);
