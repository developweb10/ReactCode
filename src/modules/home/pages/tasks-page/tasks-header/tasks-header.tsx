import styles from "./tasks-header.module.scss";
import { ReactComponent as ArrowYellowIcon } from "@assets/images/arrow-right-yellow-icon.svg";
import { useMemo, useCallback, useEffect } from "react";
import classNames from "classnames";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-down-icon.svg";
import moment from "moment";
import { chunkArr } from "@utils/arrayUtils";

import { useState, useRef } from "react";
import {
  Typography,
  Select,
  MenuItem,
  InputBase,
  LinearProgress,
} from "@material-ui/core";

import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { TaskType } from "@models/tasks.models";
import { tasksService } from "@store/tasks/tasks.service";
import { tasksQuery } from "@store/tasks/tasks.query";

import { useObservableState } from "observable-hooks";

interface Props {
  selectedDay: moment.Moment;
  taskType: TaskType;
  handleDayChange: (newDay: moment.Moment) => void;
}

export const TasksHeader: React.FC<Props> = ({
  selectedDay,
  taskType,
  handleDayChange,
}) => {
  const today = useRef(moment());

  const refetchRequired = useObservableState(
    tasksQuery.refetchRequired$,
    false
  );

  const { totalTasks, completedTasks } = useObservableState(
    tasksQuery.taskStats$,
    {
      totalTasks: 0,
      completedTasks: 0,
    }
  );

  const [calendarRange, setRange] = useState({
    from: moment().startOf("week"),
    to: moment().endOf("week"),
  });

  const [currentChunk, setChunk] = useState(0);

  useEffect(() => {
    if (refetchRequired) {
      (async () => {
        await tasksService.fetchTasksAndStats({
          date: selectedDay.format("YYYY-MM-DD"),
          taskType,
          fromDate: calendarRange.from.format("YYYY-MM-DD"),
          toDate: calendarRange.to.format("YYYY-MM-DD"),
        });
      })();
    }
  }, [
    calendarRange.from,
    calendarRange.to,
    refetchRequired,
    selectedDay,
    taskType,
  ]);

  useEffect(() => {
    (async () => {
      await tasksService.fetchTasksStats({
        fromDate: calendarRange.from.format("YYYY-MM-DD"),
        toDate: calendarRange.to.format("YYYY-MM-DD"),
      });
    })();
  }, [calendarRange, selectedDay]);

  const [selectedPeriod, setPeriod] = useState("This Week");

  const handlePeriodChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const selectedValue = event.target.value as string;

      switch (selectedValue) {
        case "This Week":
          setRange({
            from: moment().startOf("week"),
            to: moment().endOf("week"),
          });
          handleDayChange(today.current);
          break;
        case "Prev Week":
          setRange({
            from: moment().subtract(1, "weeks").startOf("week"),
            to: moment().subtract(1, "weeks").endOf("week"),
          });
          handleDayChange(moment().subtract(1, "weeks").startOf("week"));
          break;
        case "Next Week":
          setRange({
            from: moment().add(1, "weeks").startOf("week"),
            to: moment().add(1, "weeks").endOf("week"),
          });
          handleDayChange(moment().add(1, "weeks").startOf("week"));
          break;

        default:
          break;
      }

      setPeriod(selectedValue);
    },
    [handleDayChange]
  );

  const handleApply = (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => {
    setRange(newRange);
    setChunk(0);
    handleDayChange(newRange.from);
  };

  const handleCustomClicked = () => {
    dialogManagerService.openDialog(DialogType.TASKS_DATE_RANGE, {
      currentRange: {
        from: calendarRange.from.toDate(),
        to: calendarRange.to.toDate(),
      },
      onApply: handleApply,
    });
  };

  const renderDaysList = useMemo(() => {
    let days: JSX.Element[] = [];

    const diff = calendarRange.to.diff(calendarRange.from, "days");

    for (let i = 0; i <= diff; i++) {
      let day = moment(calendarRange.from).add(i, "days");
      if (i === diff) {
        day = day.endOf("day");
      }

      const isToday = today.current.isSame(day, "days");
      const isSelected = selectedDay && selectedDay.isSame(day, "days");
      days.push(
        <div
          key={day.toString()}
          className={classNames(styles.CalendarCell, {
            [styles.IsToday]: isToday,
            [styles.IsSelected]: isSelected,
          })}
          onClick={() => {
            handleDayChange(day);
          }}
        >
          <Typography className={styles.CalendarDayName}>
            {day.format("ddd")}
          </Typography>
          <Typography className={styles.CalendarDayNumber}>
            {day.format("DD")}
          </Typography>
        </div>
      );
    }
    return days;
  }, [calendarRange.from, calendarRange.to, handleDayChange, selectedDay]);

  const chunkedDays = useMemo(() => {
    return chunkArr(renderDaysList, 7);
  }, [renderDaysList]);

  const handleChunkChange = useCallback((newChunk: number) => {
    setChunk(newChunk);
  }, []);

  const renderChunkedCalendar = useMemo(() => {
    return (
      <>
        {!!currentChunk && (
          <ArrowYellowIcon
            className={classNames(styles.ArrowControl, styles.ArrowControlLeft)}
            onClick={() => handleChunkChange(currentChunk - 1)}
          />
        )}
        <div className={styles.WeekWrapper}>
          <div
            style={{
              display: "flex",
              transform: `translate3d(${-100 * currentChunk}%, 0px, 0px)`,
              transition: `all .35s ease-in-out`,
            }}
          >
            {chunkedDays.map((week, i) => {
              return (
                <div
                  key={i}
                  className={styles.Calendar}
                  style={{
                    minWidth: "100%",
                  }}
                >
                  {week}
                </div>
              );
            })}
          </div>
        </div>
        {currentChunk < chunkedDays.length - 1 ? (
          <ArrowYellowIcon
            className={classNames(
              styles.ArrowControl,
              styles.ArrowControlRight
            )}
            onClick={() => handleChunkChange(currentChunk + 1)}
          />
        ) : null}
      </>
    );
  }, [chunkedDays, currentChunk, handleChunkChange]);

  return (
    <div className={styles.Header}>
      <div className={styles.HeaderTop}>
        <Typography className={styles.TasksNumberText}>
          {completedTasks} {completedTasks === 1 ? "task" : "tasks"} completed
          out of {totalTasks}
        </Typography>
        <div className={styles.PeriodSelectWrapper}>
          <Typography className={styles.ShowText}>Show:</Typography>
          <Select
            MenuProps={{
              elevation: 1,
              disableScrollLock: true,

              anchorOrigin: {
                vertical: "bottom",
                horizontal: "center",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              getContentAnchorEl: null,
              classes: { paper: styles.SelectPaper },
            }}
            value={selectedPeriod}
            renderValue={(value) => {
              if (value === "Custom") {
                return `${calendarRange.from.format(
                  "DD MMM YYYY"
                )} - ${calendarRange.to.format("DD MMM YYYY")}`;
              } else {
                return `${value}`;
              }
            }}
            onChange={handlePeriodChange}
            input={<InputBase className={styles.SelectInput} />}
            IconComponent={() => <ArrowIcon className={styles.ArrowIcon} />}
            classes={{ select: styles.Select, disabled: styles.Disabled }}
          >
            <MenuItem value="This Week">This Week</MenuItem>
            <MenuItem value="Prev Week">Prev Week</MenuItem>
            <MenuItem value="Next Week">Next Week</MenuItem>
            <MenuItem value="Custom" onClick={handleCustomClicked}>
              Custom
            </MenuItem>
          </Select>
        </div>
      </div>

      <LinearProgress
        variant="determinate"
        value={totalTasks ? (100 * completedTasks) / totalTasks : 0}
        className={styles.TasksProgress}
        classes={{ bar: styles.ProgressBar }}
      />

      <div className={styles.CalendarWrapper}>
        <Typography variant="h5" className={styles.SelectedDayText}>
          {selectedDay.format("DD MMMM y[,] dddd")}
        </Typography>
        {selectedPeriod === "Custom" ? (
          renderChunkedCalendar
        ) : (
          <div className={styles.Calendar}>{renderDaysList}</div>
        )}
      </div>
    </div>
  );
};
