import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./calendar-page.module.scss";
import CalendarIcon from "@assets/images/calendar-yellow-icon.svg";
import { PageHeader } from "@components/page-header/page-header";
import { SearchInput } from "@components/search-input/search-input";
import { Calendar } from "./calendar/calendar";

import { calendarService } from "@store/calendar/calendar.service";
import { calendarQuery } from "@store/calendar/calendar.query";
import { usersQuery } from "@store/users/users.query";
import { useObservableState } from "observable-hooks";
import { usersService } from "@store/users/users.service";

import { ISelectedDate } from "@models/calendar.models";

import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";

const CalendarPage = () => {
  const [selectedDate, setDate] = useState<ISelectedDate>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [search, setSearch] = useState("");
  const onSearch$ = useRef(new Subject<string>());
  const usersLoading = useObservableState(usersQuery.loading$, true);
  const requestsLoading = useObservableState(calendarQuery.loading$, true);

  useEffect(() => {
    const subscription = onSearch$.current
      .pipe(debounceTime(400))
      .subscribe((newSearch) => {
        setSearch(newSearch);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    await usersService.fetchUsers({ search });
  }, [search]);

  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, [fetchUsers]);

  useEffect(() => {
    (async () => {
      await calendarService.fetchRequests(selectedDate);
    })();
  }, [selectedDate]);

  const handleMonthChange = useCallback(
    (n: number) => {
      const newMonth = selectedDate.month + 1 * n;

      let newYear = newMonth ? selectedDate.year : selectedDate.year - 1;

      if (newMonth > 12) {
        newYear = selectedDate.year + 1;
      }

      setDate({
        month: newMonth > 12 ? 1 : newMonth || 12,
        year: newYear,
      });
    },
    [selectedDate.month, selectedDate.year]
  );

  return (
    <div className={styles.PageWrapper}>
      <PageHeader
        title="Calendar"
        icon={CalendarIcon}
        search={
          <SearchInput
            searchValue={search}
            onChange={(value) => {
              onSearch$.current.next(value);
            }}
            placeholder="Search Users"
          />
        }
      />
      <div className="page-content">
        <Calendar
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          loading={usersLoading || requestsLoading}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
