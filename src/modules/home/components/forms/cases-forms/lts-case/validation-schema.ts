import * as yup from "yup";
import { caseTypeSchema } from "../subforms/case-type-form/case-type-form";

export const validationSchema = yup.object().shape({
  ...caseTypeSchema,

  details: yup.string().required("Provide Specific Details"),
  note: yup.string(),
  specificDetails: yup.object().shape({
    ailment: yup.string().nullable().required("Provide Ailment"),
    dateOfSickness: yup.date().nullable().required("Provide Date Of Sickness"),
    fitNoteExpiresOn: yup.date().nullable(),
    returnDate: yup.date().nullable(),
    returnToWork: yup.boolean(),
  }),
});
