import * as yup from "yup";

export const validationSchema = yup.object().shape({
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
  outcomeId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value)),
  specificDetails: yup.object().shape({
    improvementOverview: yup.string().required("Provide Improvement Overview"),
    reviewFrom: yup.date().nullable().required("Provide Review From Date"),
    reviewTo: yup
      .date()
      .nullable()
      .required("Provide Review To Date")
      .min(yup.ref("reviewFrom"), "Can't be before Review From Date"),
    finalComment: yup.string(),
    finalScore: yup
      .number()
      .nullable()
      .positive()
      .integer()
      .transform((value) => (isNaN(value) ? null : value)),

    completionDate: yup.date().nullable(),
    appeal: yup.boolean(),
    evaluations: yup
      .array()
      .of(
        yup.object().shape({
          improvementArea: yup.string().required("Provide Improvement Area"),
          min: yup
            .number()
            .nullable()
            .positive()
            .integer()
            .transform((value) => (isNaN(value) ? null : value)),

          max: yup
            .number()
            .nullable()
            .positive()
            .integer()
            .transform((value) => (isNaN(value) ? null : value)),

          rating: yup
            .number()
            .nullable()
            .positive()
            .integer()
            .transform((value) => (isNaN(value) ? null : value)),
          comment: yup.string(),
        })
      )
      .required("At least 1 evaluation line must exist"),
  }),
});
