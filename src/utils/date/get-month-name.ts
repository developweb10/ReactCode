const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getMonthName = (month: number): string => {
  if (month > 0 && month <= 12) {
    return monthNames[month - 1];
  }
  return monthNames[0];
};
