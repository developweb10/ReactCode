import * as yup from "yup";
import { caseTypeSchema } from "../subforms/case-type-form/case-type-form";

export const validationSchema = yup.object().shape({
  ...caseTypeSchema,

  details: yup.string().required("Provide Details"),
  note: yup.string(),
  outcomeId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value)),
  specificDetails: yup.object().shape({
    reason: yup.string().required(),
    officerId: yup
      .number()
      .nullable()
      .positive()
      .integer()
      .transform((value) => (isNaN(value) ? null : value)),
    discipliningDate: yup.date().nullable(),
    suspended: yup.boolean().required(),
    suspensionDate: yup
      .date()
      .nullable()
      .when("suspended", {
        is: true,
        then: yup.date().nullable().required("Provide Suspension Date"),
        otherwise: yup.date().nullable(),
      }),
    appeal: yup.boolean(),
  }),
});
