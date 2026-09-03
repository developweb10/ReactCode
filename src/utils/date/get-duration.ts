import moment from "moment";
export const getDuration = (startDate: string, endDate: string) => {
  return moment(endDate).diff(moment(startDate), "days");
};
