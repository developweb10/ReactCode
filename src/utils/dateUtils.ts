import moment, { unitOfTime } from "moment";

const formatDateEnding = (num: number, str: string): string => {
  if (num === 1) {
    return `${num} ${str}`;
  }

  return `${num} ${str}s`;
};

export const howAgoDateDifference = (
  startDate: Date,
  endDate: Date
): string => {
  const start = moment(startDate);
  const end = moment(endDate);

  const years = end.diff(start, "years");
  start.add(years, "years");
  const months = end.diff(start, "months");
  start.add(months, "months");
  const days = end.diff(start, "days");
  let result = [];
  if (!!years) {
    result.push(formatDateEnding(years, "year"));
  }

  if (!!months) {
    result.push(formatDateEnding(months, "month"));
  }

  if (!!days) {
    result.push(formatDateEnding(days, "day"));
  }

  return result.join(", ");
};

export const getOneDateItemDuration = (
  dateItem: unitOfTime.Diff,
  d: Date,
  withFormat?: boolean
) => {
  const today = moment().endOf("day");
  const diff = today.diff(d, dateItem);

  return withFormat ? `${formatDateEnding(diff, dateItem)}` : diff;
};
