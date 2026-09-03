import * as yup from "yup";

export const caseTypeSchema = {
  date: yup.date().nullable(),
  employeeId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value))
    .required("Provide Employee ID"),
  hrId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value)),
};
