import * as yup from "yup";

export const validationSchema = yup.object().shape({
  assigmentTypeId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value))
    .required("Provide Assignment Name"),
  note: yup.string(),
});
