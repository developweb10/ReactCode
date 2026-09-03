import styles from "./timesheet-users-table.module.scss";
import { useHistory } from "react-router-dom";
import { useState, useMemo } from "react";
import moment from "moment";
import classNames from "classnames";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";

import { Typography, ButtonBase, Popover } from "@material-ui/core";

import {
  WeeklyCalendar,
  RangeParams,
} from "@components/date-picker/weekly-calendar/weekly-calendar";

import { Table } from "@components/table/table";

import { useTableColumns } from "./useTableColumns";
import { MinUserDto } from "@models/users.models";

interface Props {
  users: MinUserDto[];
  sortValue: string;
  loading: boolean;
  weekRange: {
    from: moment.Moment;
    to: moment.Moment;
  };
  handleWeekRangeChange: (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => void;
  handleSortChange: (sortString: string) => void;
}

export const TimesheetUsersTable: React.FC<Props> = ({
  users,
  weekRange,
  sortValue,
  loading,
  handleWeekRangeChange,
  handleSortChange,
}) => {
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // View Click

  const handleViewClick = (user: MinUserDto) => {
    history.push(`/time-attendance`, {
      timesheetTableState: {
        weekRange: {
          from: weekRange.from.format("YYYY-MM-DD"),
          to: weekRange.to.format("YYYY-MM-DD"),
        },
        userId: user.id,
        userName: `${user.firstname} ${user.surname}`,
        backPath: history.location.pathname + history.location.search,
      },
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

  const formattedRange = useMemo(() => {
    return `${weekRange.from.format("D MMM")} -
    ${weekRange.to.format("D MMM YYYY")}`;
  }, [weekRange]);

  const columns = useTableColumns({ handleViewClick, formattedRange });

  const tableHeader = (
    <div className={styles.TableHeader}>
      <Typography className={styles.HeaderTitle}>Timesheet for Week</Typography>
      <Typography className={styles.HeaderCount} variant="body1"></Typography>
      <div className={styles.WeekSelectorWrapper}>
        <Typography className={styles.HeaderTitle}>Select Week:</Typography>

        <div className={styles.SelectWrapper}>
          <ButtonBase
            onClick={handleClick}
            disableRipple
            disableTouchRipple
            className={styles.SelectBtn}
          >
            <Typography className={styles.SelectedWeekText}>
              {formattedRange}
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
            <WeeklyCalendar
              initialRange={{
                from: weekRange.from.toDate(),
                to: weekRange.to.toDate(),
              }}
              onApply={handleDateApply}
              onCancel={handleClose}
            />
          </Popover>
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles.TableWrapper}>
      <div className={styles.TableContent}>
        <Table
          loading={loading}
          cols={columns}
          title=""
          tableData={users}
          customHeader={tableHeader}
          currentSort={sortValue}
          onSortChanged={handleSortChange}
        />
      </div>
    </div>
  );
};
