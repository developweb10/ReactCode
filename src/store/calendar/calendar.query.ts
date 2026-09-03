import { QueryEntity } from "@datorama/akita";

import { CalendarState, CalendarStore, calendarStore } from "./calendar.store";

export class CalendarQuery extends QueryEntity<CalendarState> {
  calendarRequests$ = this.selectAll();
  loading$ = this.selectLoading();

  constructor(protected store: CalendarStore) {
    super(store);
  }
}

export const calendarQuery = new CalendarQuery(calendarStore);
