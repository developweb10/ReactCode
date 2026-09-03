import * as yup from "yup";
import { onlyLettersAndSpacesWithHyphen } from "@utils/regexp";
import moment from "moment";

export const personalInfoSchema = yup.object().shape({
  firstname: yup
    .string()
    .required("Provide First Name")
    .matches(onlyLettersAndSpacesWithHyphen, "Invalid First Name"),
  surname: yup
    .string()
    .required("Provide Last Name")
    .matches(onlyLettersAndSpacesWithHyphen, "Invalid Last Name"),
  middleName: yup
    .string()
    .matches(onlyLettersAndSpacesWithHyphen, "Invalid Middle Name"),
 otherId: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  gender: yup.string().required("Provide Gender"),
  genderName: yup.string().when("gender", {
    is: "Other",
    then: yup
      .string()
      .required("Provide Gender Name")
      .matches(onlyLettersAndSpacesWithHyphen, "Invalid Gender Name"),
  }),
  ethnicity: yup.string().nullable(),
  nationality: yup.string().nullable().required("Provide Nationality"),
  dateOfBirth: yup
    .date()
    .nullable()
    .required("Provide Date of Birth")
    .typeError("Invalid Date Format")
    .max(moment().endOf("day").toDate(), "Invalid Date of Birth"),
  knowAs: yup.string(),
  smoker: yup.string(),
});
