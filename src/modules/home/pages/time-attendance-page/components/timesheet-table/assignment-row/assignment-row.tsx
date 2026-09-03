import styles from "./assignment-row.module.scss";
import classNames from "classnames";

import { useMemo } from "react";

import { Typography, TableRow, TableCell } from "@material-ui/core";

import { AssignmentTimesheetWithNameModel } from "@models/time-attendance.models";

import { ActionsMenu } from "@components/actions-menu/actions-menu";

import {
  getFormattedCountInHours,
  getTotalAssignmentCount,
} from "@utils/date/time-attendance/utils";

import moment from "moment";

interface Props {
  assignment: AssignmentTimesheetWithNameModel;
  canManipulateTimesheet: boolean;
  monthView: boolean;
  weekRangeFrom: moment.Moment;
  daysRange: number;
  handleOpenCommentClick: (assignmentId: number, selectedDay?: string) => void;
  handleRemoveRowClick: () => void;
  handleEditRowClick: () => void;
  handleViewRowClick: () => void;
}

export const AssignmentRow: React.FC<Props> = ({
  assignment,
  canManipulateTimesheet,
  weekRangeFrom,
  daysRange,
  monthView,
  handleOpenCommentClick,
  handleEditRowClick,
  handleRemoveRowClick,
  handleViewRowClick,
}) => {
  const renderDayCountCells = useMemo(() => {
    let cells: JSX.Element[] = [];
    const today = moment();
    for (let i = 0; i <= daysRange; i++) {
      let day = moment(weekRangeFrom).add(i, "days");
      const dayFormatted = day.format("YYYY-MM-DD");
      const dayExist = assignment.perDays.find((d) => d.date === dayFormatted);
      cells.push(
        <TableCell
          key={`${assignment.id} + ${dayFormatted}`}
          align="center"
          className={classNames(
            styles.TableCell,
            styles.TableBodyCell,
            styles.PerDayCell,
            {
              [styles.Hoverable]: !!dayExist,
              [styles.Today]: day.isSame(today, "day"),
            }
          )}
          onClick={() => {
            if (dayExist) {
              handleOpenCommentClick(assignment.id, dayExist.date);
            }
          }}
        >
          <Typography className={styles.TrackedTimeCount}>
            {getFormattedCountInHours(dayExist?.actualSpentTimeMin || 0)}
          </Typography>
          <Typography className={styles.ExpectedTimeCount}>
            ({getFormattedCountInHours(dayExist?.expectedSpentTimeMin || 0)})
          </Typography>
        </TableCell>
      );
    }

    return cells;
  }, [
    assignment.id,
    assignment.perDays,
    daysRange,
    handleOpenCommentClick,
    weekRangeFrom,
  ]);

  const renderTotalCell = useMemo(() => {
    return (
      <TableCell
        className={classNames(styles.TableCell, styles.TableBodyCell, {
          [styles.StickyEnd]: monthView,
        })}
        align="center"
      >
        <Typography className={styles.TotalTimeCount}>
          {getTotalAssignmentCount(assignment.perDays, "actualSpentTimeMin") ||
            0}
        </Typography>
        <Typography className={styles.ExpectedTimeCount}>
          (
          {getTotalAssignmentCount(
            assignment.perDays,
            "expectedSpentTimeMin"
          ) || 0}
          )
        </Typography>
      </TableCell>
    );
  }, [assignment.perDays, monthView]);

  return (
    <TableRow>
      <TableCell
        className={classNames(
          styles.TableCell,
          styles.TableBodyCell,
          styles.NameCell,
          styles.Hoverable,
          {
            [styles.StickyStart]: monthView,
          }
        )}
        onClick={() => {
          handleOpenCommentClick(assignment.id);
        }}
      >
        <Typography className={styles.NameText}>{assignment.name}</Typography>
        <Typography className={styles.ExpectedTimeCount}>
          Actual Time
        </Typography>
        <Typography className={styles.ExpectedTimeCount}>
          (Scheduled Time)
        </Typography>
      </TableCell>
      {renderDayCountCells}
      {renderTotalCell}
      {!monthView && (
        <TableCell
          className={classNames(
            styles.TableCell,
            styles.TableBodyCell,
            styles.ActionsCell
          )}
        >
          <ActionsMenu
            options={[
              {
                id: 1,
                content: () => (
                  <div className={styles.ActionsMenuItem}>
                    <div className={styles.ActionsMenuItemIconWrapper}></div>
                    <Typography className={styles.ActionsMenuItemText}>
                      Comment
                    </Typography>
                  </div>
                ),
                onClick: () => {
                  handleOpenCommentClick(assignment.id);
                },
              },

              ...(!canManipulateTimesheet
                ? [
                    {
                      id: 2,
                      content: () => (
                        <div className={styles.ActionsMenuItem}>
                          <div
                            className={styles.ActionsMenuItemIconWrapper}
                          ></div>
                          <Typography className={styles.ActionsMenuItemText}>
                            View Row
                          </Typography>
                        </div>
                      ),
                      onClick: handleViewRowClick,
                    },
                  ]
                : []),
              ...(canManipulateTimesheet
                ? [
                    {
                      id: 3,
                      content: () => (
                        <div className={styles.ActionsMenuItem}>
                          <div
                            className={styles.ActionsMenuItemIconWrapper}
                          ></div>
                          <Typography className={styles.ActionsMenuItemText}>
                            Edit Row
                          </Typography>
                        </div>
                      ),
                      onClick: handleEditRowClick,
                    },
                    {
                      id: 4,
                      content: () => (
                        <div className={styles.ActionsMenuItem}>
                          <div
                            className={styles.ActionsMenuItemIconWrapper}
                          ></div>
                          <Typography
                            className={styles.ActionsMenuItemText}
                            style={{ color: "red" }}
                          >
                            Remove Row
                          </Typography>
                        </div>
                      ),
                      onClick: handleRemoveRowClick,
                    },
                  ]
                : []),
            ]}
          />
        </TableCell>
      )}
    </TableRow>
  );
};
