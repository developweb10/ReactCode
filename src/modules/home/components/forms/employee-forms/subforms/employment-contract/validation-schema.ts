import * as yup from "yup";

export const contractInfoSchema = yup.object().shape({
  startDate: yup.date().nullable(),
  endDate: yup
    .date()
    .nullable()
    .min(yup.ref("startDate"), "End date can't be before start date"),
  contractDetails: yup.string().nullable(),
});
