import { AssigmentPerDayModel } from "@models/time-attendance.models";
import { convertMinutesToHoursMinutes } from "@utils/date/convert-minutes";

export const getFormattedCountInHours = (m: number) => {
  return Math.round((m / 60) * 100) / 100;
};

export const getTotalFormattedCount = (m: number) => {
  const { hours, minutes } = convertMinutesToHoursMinutes(m);
  return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m" : ""}`;
};

export const getTotalAssignmentCount = (
  perDays: AssigmentPerDayModel[],
  totalProp: "actualSpentTimeMin" | "expectedSpentTimeMin"
) => {
  const totalMinutes = perDays.reduce((prev: number, current): number => {
    return prev + current[totalProp];
  }, 0);

  return getTotalFormattedCount(totalMinutes);
};

export const getInputFormatValue = (m: number) => {
  const { hours, minutes } = convertMinutesToHoursMinutes(m);
  return `${("0" + hours).substr(-2)}${("0" + minutes).substr(-2)}`;
};

export const getHoursAndMinutesFromInputValue = (
  hours: string,
  minutes: string
) => {
  let hoursInt = 0;
  let minutesInt = 0;

  if (hours && hours.trim()) {
    let hoursStr = hours.trim();
    if (hoursStr.length === 1) {
      hoursStr = hoursStr + "0";
    }
    hoursInt = parseInt(hoursStr);
  }

  if (minutes && minutes.trim()) {
    let minutesStr = minutes.trim();
    if (minutesStr.length === 1) {
      minutesStr = minutesStr + "0";
    }

    minutesInt = parseInt(minutesStr);
  }

  return { hoursInt, minutesInt };
};

export const getTotalTimesheetTable = () => {};

export const formatMinutes = (m: number) => {
  const { hours, minutes } = convertMinutesToHoursMinutes(m);

  const formattedValue = `${hours > 0 ? hours + "h " : ""}${
    minutes > 0 ? minutes + "m" : ""
  }`;

  return formattedValue;
};

export const formatCountTimeInput = (value: string) => {
  const minutesArr = value.match(/\d+m/g) || [];
  const hoursArr = value.match(/([0-9]*\.?\d+h)|([0-9]*\.?\d+\b)/g) || [];

  const totalMinutes = minutesArr.reduce((total, current) => {
    return (total = total + parseFloat(current));
  }, 0);

  const totalHours = hoursArr.reduce((total, current) => {
    return (total = total + parseFloat(current));
  }, 0);

  const total = totalMinutes + totalHours * 60;

  return {
    totalMinutes: total,
    formattedValue: formatMinutes(total),
  };
};
