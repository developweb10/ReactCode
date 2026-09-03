import styles from "./approvals-tab.module.scss";
import { useState, useMemo, useEffect, useCallback } from "react";
import { UsersTableRouteState } from "@models/time-attendance.models";
import { ReactComponent as ExportIcon } from "@assets/images/export-icon.svg";

import { TimesheetUsersTable } from "../../components/timesheet-users-table/timesheet-users-table";
import { PageHeader } from "@components/page-header/page-header";
import { SearchInput } from "@components/search-input/search-input";
import { TABS_LIST } from "../index";
import TimeAttendanceIcon from "@assets/images/timesheet-yellow-icon.svg";

import { Tabs } from "@components/tabs/tabs";

import { useTableControls } from "@hooks/useTableControls";

import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import { MinUserDto } from "@models/users.models";

import moment from "moment";

interface Props {
  usersRouteState?: UsersTableRouteState;
  selectedTab: number;
  handleTabChange: (event: React.ChangeEvent<{}>, newTabValue: any) => void;
}

export const ApprovalsTab: React.FC<Props> = ({
  usersRouteState,
  selectedTab,
  handleTabChange,
}) => {
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<MinUserDto[]>([]);

  const initialWeekRange = useMemo(() => {
    if (usersRouteState?.weekRange) {
      return {
        from: moment(usersRouteState.weekRange.from, "YYYY-MM-DD").startOf(
          "week"
        ),
        to: moment(usersRouteState.weekRange.to, "YYYY-MM-DD").endOf("week"),
      };
    }
    return {
      from: moment().startOf("week"),
      to: moment().endOf("week"),
    };
  }, [usersRouteState]);

  const [weekRange, setWeekRange] = useState(initialWeekRange);

  const {
    values: { sort, search },
    handlers: { handleSearchChange, handleSortChange },
  } = useTableControls({
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  const handleExportClick = async () => {
    await timeAttendanceService.exportTimesheet({
      dateFrom: weekRange.from.format("YYYY-MM-DD"),
      dateTo: weekRange.to.format("YYYY-MM-DD"),
    });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const fetchedUsers = await timeAttendanceService.getUsersTimesheet({
      dateFrom: weekRange.from.format("YYYY-MM-DD"),
      dateTo: weekRange.to.format("YYYY-MM-DD"),
      sort,
      search,
    });
    setLoading(false);
    setRequestRequired(false);
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [search, sort, weekRange.from, weekRange.to]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchUsers();
    }
  }, [fetchUsers, requestRequired]);

  const handleWeekRangeChange = (newRange: {
    from: moment.Moment;
    to: moment.Moment;
  }) => {
    setWeekRange(newRange);
    setRequestRequired(true);
  };

  return (
    <>
      <PageHeader
        title={"Time & Attendance"}
        icon={TimeAttendanceIcon}
        tabs={
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            labels={TABS_LIST}
          />
        }
        search={
          <SearchInput
            inputProps={{ defaultValue: search }}
            searchValue={search}
            onChange={handleSearchChange}
          />
        }
        buttonIcon={<ExportIcon />}
        buttonTitle={"Export CSV"}
        onButtonClick={handleExportClick}
      />
      <div className="page-content timeattendance-page">
        <div className={styles.Wrapper}>
          <div className={styles.TimeSheetTableWrapper}>
            <TimesheetUsersTable
              users={users}
              loading={loading}
              sortValue={sort}
              weekRange={weekRange}
              handleSortChange={handleSortChange}
              handleWeekRangeChange={handleWeekRangeChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};
