import * as yup from "yup";

export const jobInfoSchema = yup.object().shape({
  jobTitle: yup.string().nullable().required("Provide Job Title"),
  jobSpecifications: yup.string().nullable(),
  employmentStatus: yup.string().nullable().required("Provide Employee Status"),
  function: yup.string().nullable().required("Provide Function"),
  joinDate: yup.date().nullable().required("Provide Joined Date"),
  leaveDate: yup
    .date()
    .nullable()
    .min(yup.ref("joinDate"), "Leave Date can't be before Join Date"),
  department: yup.string().nullable().required("Provide Department"),
  storeId: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .transform((value) => (isNaN(value) ? null : value))
    .required("Provide Location"),
});
