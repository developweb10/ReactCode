import moment from "moment";

export const getNextPayday = () => {
  const lastDayOfCurrentMonth = moment().endOf("month").endOf("day");

  const today = moment();

  const currentMonthFriday = lastDayOfCurrentMonth
    .clone()
    .subtract((lastDayOfCurrentMonth.day() + 2) % 7, "days");

  if (today <= currentMonthFriday) return currentMonthFriday.toDate();

  const lastDayOfNextMonth = moment().add(1, "M").endOf("month").endOf("day");

  return lastDayOfNextMonth
    .subtract((lastDayOfNextMonth.day() + 2) % 7, "days")
    .toDate();
};
