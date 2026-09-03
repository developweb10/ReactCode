import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import styles from "./tasks-page.module.scss";
import classNames from "classnames";

import TasksIcon from "@assets/images/tasks-yellow-icon.svg";
import AddIcon from "@material-ui/icons/Add";

import { PageHeader } from "@components/page-header/page-header";
import { TasksHeader } from "./tasks-header/tasks-header";
import { TaskItem } from "./task-item/task-item";

import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { tasksService } from "@store/tasks/tasks.service";
import { tasksQuery } from "@store/tasks/tasks.query";
import { TaskType } from "@models/tasks.models";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { useObservableState } from "observable-hooks";
import { useObservable } from "@libreact/use-observable";

import { CircularProgress, Tabs, Tab, Typography } from "@material-ui/core";

import moment from "moment";

const NOTICEBOARD_TASK_TAB = "NOTICEBOARD";

const TasksPage = () => {
  const today = useRef(moment());

  const [selectedDay, setSelectedDay] = useState(moment());
  const storeRawValue = useRef(tasksQuery.getValue());

  const [currentUser] = useObservable(authorizationQuery.user$);

  const [tasks, loading] = useObservableState(tasksQuery.tasksState$, [
    tasksQuery.getAll(),
    storeRawValue.current.loading,
  ]);

  const [tabValue, setTab] = useState<TaskType | typeof NOTICEBOARD_TASK_TAB>(
    TaskType.CREATED_TO_ME
  );

  const fetchTasks = useRef(
    async (
      tabValue: TaskType | typeof NOTICEBOARD_TASK_TAB,
      selectedDay: moment.Moment
    ) => {
      await tasksService.initialFetchTasks({
        taskType:
          tabValue === NOTICEBOARD_TASK_TAB ? TaskType.CREATED_TO_ME : tabValue,
        date: selectedDay.format("YYYY-MM-DD"),
      });
    }
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchTasks.current(tabValue, selectedDay);
    }
  }, [tabValue, selectedDay]);

  const handleDayChange = useCallback(
    async (newDay: moment.Moment) => {
      fetchTasks.current(tabValue, newDay);
      setSelectedDay(newDay);
    },
    [tabValue]
  );

  // Tab Handler

  const handleTabChange = (
    event: React.ChangeEvent<{}>,
    newValue: TaskType | typeof NOTICEBOARD_TASK_TAB
  ) => {
    if (newValue === tabValue) {
      return;
    }

    setTab(newValue);
    fetchTasks.current(newValue, selectedDay);
  };

  const showComplete = useMemo(() => {
    return today.current.isSame(selectedDay, "day");
  }, [selectedDay]);

  const visibleTasks = useMemo(() => {
    if (tabValue === NOTICEBOARD_TASK_TAB) {
      return tasks.filter((task) => task.isNoticeboard);
    }

    return tasks.filter((task) => !task.isNoticeboard);
  }, [tabValue, tasks]);

  return (
    <div className={styles.PageWrapper} id="tasks-page">
      <PageHeader
        title={"Tasks"}
        icon={TasksIcon}
        buttonIcon={<AddIcon />}
        buttonTitle="Create New"
        onButtonClick={() => {
          dialogManagerService.openDialog(DialogType.ADD_TASK, {
            handleRefetch: () => fetchTasks.current(tabValue, selectedDay),
          });
        }}
      />

      <div className="page-content tasks-page">
        <div className={styles.ContentWrapper}>
          <TasksHeader
            selectedDay={selectedDay}
            taskType={
              tabValue === NOTICEBOARD_TASK_TAB
                ? TaskType.CREATED_TO_ME
                : tabValue
            }
            handleDayChange={handleDayChange}
          />
          <div className={styles.Content}>
            <Tabs
              indicatorColor="primary"
              classes={{
                root: styles.Tabs,
              }}
              value={tabValue}
              onChange={handleTabChange}
            >
              <Tab
                classes={{
                  root: styles.Tab,
                  selected: styles.SelectedTab,
                }}
                label="Your Tasks"
                disableRipple
                disableTouchRipple
                value={TaskType.CREATED_TO_ME}
              />
              <Tab
                classes={{
                  root: styles.Tab,
                  selected: styles.SelectedTab,
                }}
                label="Created by You"
                disableRipple
                disableTouchRipple
                value={TaskType.CREATED_BY_ME}
              />
              <Tab
                classes={{
                  root: styles.Tab,
                  selected: styles.SelectedTab,
                }}
                label="Noticeboard"
                disableRipple
                disableTouchRipple
                value={NOTICEBOARD_TASK_TAB}
              />
            </Tabs>
            <div className={styles.TasksList}>
              {loading && (
                <div
                  className={classNames(
                    "overlay-loader",
                    "with-opacity",
                    styles.Loader
                  )}
                >
                  <CircularProgress
                    size="6rem"
                    variant="indeterminate"
                    disableShrink
                  />
                </div>
              )}
              {!loading && !visibleTasks.length && (
                <Typography className={styles.NoTasksMessage}>
                  No tasks available for this day
                </Typography>
              )}

              {visibleTasks.map((task) => {
                const createdByMe =
                  tabValue !== NOTICEBOARD_TASK_TAB &&
                  tabValue === TaskType.CREATED_BY_ME;

                return (
                  <TaskItem
                    task={task}
                    key={task.id}
                    currentUserId={currentUser!.userId}
                    createdByMe={createdByMe}
                    showComplete={showComplete}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
