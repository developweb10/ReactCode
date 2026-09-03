import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";

import { CalendarRequestModel } from "@models/calendar.models";

export interface CalendarState
  extends EntityState<CalendarRequestModel, number> {}

@StoreConfig({ name: "calendar", idKey: "requestId" })
export class CalendarStore extends EntityStore<CalendarState> {}

export const calendarStore = new CalendarStore();
