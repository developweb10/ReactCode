import { useState, useMemo, useEffect, useCallback, memo } from "react";
import styles from "./timesheet-table.module.scss";
import classNames from "classnames";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";

import {
  Typography,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
  ButtonBase,
  Popover,
} from "@material-ui/core";

import {
  WeeklyCalendar,
  RangeParams,
} from "@components/date-picker/weekly-calendar/weekly-calendar";
import { DatePicker } from "@material-ui/pickers";

import moment from "moment";

import {
  AssignmentTimesheetWithNameModel,
  TimesheetStatus,
} from "@models/time-attendance.models";
import { UserAuthModel } from "@models/authorization.models";
import {
  DialogType,
  dialogManagerService,
} from "@store/dialog-manager/dialog.service";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { useObservableState } from "observable-hooks";
import { useObservable } from "@libreact/use-observable";

import { CommentsSidebar } from "../comments-sidebar/comments-sidebar";
import { AssignmentRow } from "./assignment-row/assignment-row";
import { AssignmentFooter } from "./assignment-footer/assignment-footer";
import { Loader } from "@components/loader/loader";

import {
  getFormattedCountInHours,
  getTotalFormattedCount,
} from "@utils/date/time-attendance/utils";

interface Props {
  currentUser: UserAuthModel;
  trackerStarted?: boolean;
  status: TimesheetStatus;
  weekRange: {
    from: moment.Moment;
    to: moment.Moment;
  };
  userId?: number;
  adminMode?: boolean;
  monthView?: boolean;
  canManipulateTimesheet: boolean;
  handleWeekRangeChange: (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => void;
}

export const TimeSheetTable: React.FC<Props> = memo(
  ({
    currentUser,
    userId,
    trackerStarted,
    weekRange,
    adminMode,
    status,
    canManipulateTimesheet,
    monthView,
    handleWeekRangeChange,
  }) => {
    const timesheetAssignmentsWithName = useObservableState<
      AssignmentTimesheetWithNameModel[]
    >(
      timeAttendanceQuery.timesheetAssignmentsWithNames$,
      timeAttendanceQuery.getTimesheetAssignmentsWithNames()
    );
    const [loading] = useObservable(timeAttendanceQuery.loading$);

    const [commentsDrawer, setCommentsDrawer] =
      useState<{
        initialDay: string;
        initialAssignmentId: number;
      } | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const daysRange = useMemo(() => {
      return weekRange.to.diff(weekRange.from, "days");
    }, [weekRange]);

    const fetchTimesheetTable = useCallback(async () => {
      try {
        await timeAttendanceService.getAssignmentTimesheet({
          dateFrom: weekRange.from.format("YYYY-MM-DD"),
          dateTo: weekRange.to.format("YYYY-MM-DD"),
          userId,
        });
      } catch (error) {}
    }, [userId, weekRange.from, weekRange.to]);

    useEffect(() => {
      fetchTimesheetTable();
    }, [weekRange, userId, fetchTimesheetTable]);

    // Drawer

    const handleOpenCommentClick = (
      assignmentId: number,
      selectedDay?: string
    ) => {
      setCommentsDrawer({
        initialAssignmentId: assignmentId,
        initialDay: selectedDay || weekRange.from.format("YYYY-MM-DD"),
      });
    };

    // Calendar && Popover
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleDateApply = (range: RangeParams) => {
      handleWeekRangeChange({
        from: moment(range.from).startOf("day"),
        to: moment(range.to).endOf("day"),
      });
      handleClose();
    };

    // Row Actions
    const handleAddAssignmentClick = () => {
      dialogManagerService.openDialog(DialogType.ADD_ASSIGNMENT, {
        weekRange,
        userId,
      });
    };

    const handleEditAssignmentClick = (
      assignment: AssignmentTimesheetWithNameModel
    ) => {
      dialogManagerService.openDialog(DialogType.EDIT_ASSIGNMENT, {
        assignment,
        weekRange,

        ...(adminMode
          ? { handleRefetch: () => fetchTimesheetTable(), adminView: true }
          : {}),
      });
    };

    const handleViewAssignmentClick = (
      assignment: AssignmentTimesheetWithNameModel
    ) => {
      dialogManagerService.openDialog(DialogType.EDIT_ASSIGNMENT, {
        assignment,
        weekRange,
        viewMode: true,
        ...(adminMode ? { handleRefetch: () => fetchTimesheetTable() } : {}),
      });
    };

    const handleRemoveRowClick = (id: number) => {
      dialogManagerService.openDialog(DialogType.DELETE_ASSIGNMENT, {
        id,
        ...(adminMode ? { handleRefetch: () => fetchTimesheetTable() } : {}),
      });
    };

    // Head Row Cells

    const renderTableWeekHeadCells = useMemo(() => {
      let cells: JSX.Element[] = [];
      const today = moment();
      for (let i = 0; i <= daysRange; i++) {
        let day = moment(weekRange.from).add(i, "days");
        if (i === daysRange) {
          day = day.endOf("day");
        }

        cells.push(
          <TableCell
            key={day.toISOString()}
            align="center"
            className={classNames(styles.TableCell, styles.TableHeadCell, {
              [styles.Today]: day.isSame(today, "day"),
            })}
          >
            <Typography className={styles.HeadeCellText}>
              {day.format("ddd D")}
            </Typography>
          </TableCell>
        );
      }
      return cells;
    }, [daysRange, weekRange.from]);

    // Total Footer

    const renderTotalCells = useMemo(() => {
      let cells: JSX.Element[] = [];

      const daysTotals: { [key: string]: number } = {};
      let totalOfTotals = 0;

      timesheetAssignmentsWithName.forEach((assignment) => {
        const totalRowCountMinutes = assignment.perDays.reduce(
          (prev: number, current): number => {
            daysTotals[current.date] =
              (daysTotals[current.date] || 0) +
              getFormattedCountInHours(current.actualSpentTimeMin);

            return prev + getFormattedCountInHours(current.actualSpentTimeMin);
          },
          0
        );

        totalOfTotals = totalOfTotals + (totalRowCountMinutes || 0);
      });

      for (let index = 0; index <= daysRange + 1; index++) {
        let day = moment(weekRange.from)
          .add(index, "days")
          .format("YYYY-MM-DD");
        cells.push(
          <TableCell
            align="center"
            key={day}
            className={classNames(styles.TableCell, {
              [styles.StickyEnd]: monthView && index === daysRange + 1,
            })}
          >
            <Typography className={styles.HeaderText}>
              {index === daysRange + 1
                ? getTotalFormattedCount(totalOfTotals * 60)
                : daysTotals[day]
                ? parseFloat(daysTotals[day].toFixed(2))
                : 0}
            </Typography>
          </TableCell>
        );
      }
      return cells;
    }, [timesheetAssignmentsWithName, daysRange, weekRange.from, monthView]);

    return (
      <div className={styles.TableWrapper}>
        <div className={styles.TableHeader}>
          <Typography className={styles.HeaderTitle}>
            Timesheet for {monthView ? "Month" : "Week"}
          </Typography>
          <Typography
            className={styles.HeaderCount}
            variant="body1"
          ></Typography>
          <div className={styles.WeekSelectorWrapper}>
            <Typography className={styles.HeaderTitle}>
              Select {monthView ? "Month" : "Week"}:
            </Typography>

            <div className={styles.SelectWrapper}>
              <ButtonBase
                onClick={handleClick}
                disableRipple
                disableTouchRipple
                className={styles.SelectBtn}
                disabled={trackerStarted}
              >
                <Typography className={styles.SelectedWeekText}>
                  {`${weekRange.from.format("D MMM")} -
                  ${weekRange.to.format("D MMM YYYY")}`}
                </Typography>
                <ArrowIcon
                  className={classNames(styles.ArrowIcon, {
                    [styles.ArrowIconOpen]: Boolean(anchorEl),
                  })}
                />
              </ButtonBase>
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                disablePortal
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                classes={{
                  paper: styles.Paper,
                }}
              >
                {monthView ? (
                  <DatePicker
                    openTo="month"
                    views={["year", "month"]}
                    label="Year only"
                    variant="static"
                    orientation="portrait"
                    value={weekRange.from}
                    onChange={(date) => {
                      if (date) {
                        handleWeekRangeChange({
                          from: moment(date).startOf("month"),
                          to: moment(date).endOf("month"),
                        });
                        handleClose();
                      }
                    }}
                  />
                ) : (
                  <WeeklyCalendar
                    initialRange={{
                      from: weekRange.from.toDate(),
                      to: weekRange.to.toDate(),
                    }}
                    onApply={handleDateApply}
                    onCancel={handleClose}
                  />
                )}
              </Popover>
            </div>
          </div>
        </div>
        <div className={styles.TableContent}>
          {loading && <Loader />}
          <TableContainer className={styles.TableContainer}>
            <Table id="calculator-table" className={styles.TableRoot}>
              <TableHead className={styles.TableHead}>
                <TableRow>
                  <TableCell
                    align="left"
                    className={classNames(
                      styles.TableCell,
                      styles.TableHeadCell,
                      styles.NameCell,
                      { [styles.StickyStart]: monthView }
                    )}
                  >
                    <Typography className={styles.HeadeCellText}>
                      Assignment Name
                    </Typography>
                  </TableCell>

                  {renderTableWeekHeadCells}
                  <TableCell
                    align="center"
                    className={classNames(
                      styles.TableCell,
                      styles.TableHeadCell,
                      { [styles.StickyEnd]: monthView }
                    )}
                  >
                    <Typography className={styles.HeadeCellText}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classNames(
                      styles.TableCell,
                      styles.TableHeadCell
                    )}
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheetAssignmentsWithName.map((assignment) => (
                  <AssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    canManipulateTimesheet={!!canManipulateTimesheet}
                    monthView={!!monthView}
                    daysRange={daysRange}
                    weekRangeFrom={weekRange.from}
                    handleOpenCommentClick={handleOpenCommentClick}
                    handleEditRowClick={() => {
                      handleEditAssignmentClick(assignment);
                    }}
                    handleRemoveRowClick={() => {
                      handleRemoveRowClick(assignment.id);
                    }}
                    handleViewRowClick={() => {
                      handleViewAssignmentClick(assignment);
                    }}
                  />
                ))}
              </TableBody>
              <TableFooter className={styles.TableFooter}>
                <TableRow>
                  <TableCell colSpan={10}>
                    <div className={styles.TableFooterAddWrapper}>
                      {canManipulateTimesheet && !monthView && (
                        <ButtonBase
                          disableRipple
                          disableTouchRipple
                          onClick={handleAddAssignmentClick}
                          disabled={!!trackerStarted}
                        >
                          <Typography className="yellow-text">
                            + Add Assignment
                          </Typography>
                        </ButtonBase>
                      )}
                      <Typography className={styles.InfoText}>
                        *Click on Time to Add Comment
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow className={styles.TableTotalFooterRow}>
                  <TableCell
                    align="left"
                    className={classNames(
                      { [styles.StickyStart]: monthView },
                      styles.FooterTotal
                    )}
                  >
                    <Typography className={styles.HeaderText}>
                      Total:
                    </Typography>
                  </TableCell>
                  {renderTotalCells}
                  <TableCell align="left"></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
        {monthView ? (
          <div style={{ padding: 20 }}> </div>
        ) : (
          <AssignmentFooter
            status={status}
            assignmentsExist={!!timesheetAssignmentsWithName.length}
            trackerStarted={!!trackerStarted}
            adminMode={adminMode}
          />
        )}

        <CommentsSidebar
          commentsDrawer={commentsDrawer}
          handleClose={() => setCommentsDrawer(null)}
          currentUser={currentUser}
        />
      </div>
    );
  }
);
