import * as yup from "yup";
import { NOTICEBOARD_CASE_TYPE } from "./task-form-elements/task-form-elements";

export const validationSchema = yup.object().shape({
  dueDate: yup
    .date()
    .nullable()
    .typeError("Provide Deadline")
    .required("Provide Deadline"),
  hr: yup.mixed().required("Provide HR User"),
  priority: yup.string().nullable().when("taskCaseType", {
    is: NOTICEBOARD_CASE_TYPE,
    then: yup.string().nullable().required("Provide Priority"),
    otherwise: yup.string().nullable(),
  }),
  note: yup.string(),
});
