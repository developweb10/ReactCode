export const getWeekDayNumber = (month: number, year: number): number => {
  const date = new Date(year, month - 1, 1);
  return date.getDay() || 7;
};
