import { weekDays } from "./get-weekday";

export const isWeekend = (i: number): boolean => {
  const weekDay = i % weekDays.length;
  return weekDay === 5 || weekDay === 6;
};
