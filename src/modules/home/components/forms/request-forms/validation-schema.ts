import * as yup from "yup";

export const validationSchema = yup.object({
  startDate: yup.date().required("Provide Start Date"),
  endDate: yup
    .date()
    .required("Provide End Date")
    .min(yup.ref("startDate"), "End date can't be before start date"),
  notes: yup.string(),
  type: yup.string(),
});
