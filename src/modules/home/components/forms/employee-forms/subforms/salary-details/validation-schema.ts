import * as yup from "yup";

export const salaryInfoSchema = yup.object().shape({
  hoursPerWeek: yup
    .number()
    .positive()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .required("Provide Hours Per Week"),
  hourlyRate: yup
    .number()
    .positive()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .required("Provide Hourly Rate"),
  salary: yup
    .number()
    .positive()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)),
});
