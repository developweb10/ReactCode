import * as yup from "yup";
import { onlyLetters } from "@utils/regexp";

export const emergencyInfoSchema = yup.object().shape(
  {
    ecFirstName: yup
      .string()
      .required("Provide First Name")
      .matches(onlyLetters, "Invalid First Name"),
    ecLastName: yup
      .string()
      .required("Provide Last Name")
      .matches(onlyLetters, "Invalid Last Name"),
    ecMobile: yup.string().when("ecHomeTelephone", {
      is: "",
      then: yup.string().required("Provide Mobile or Home Number"),
    }),
    ecHomeTelephone: yup.string().when("ecMobile", {
      is: "",
      then: yup.string().required("Provide Mobile or Home Number"),
    }),
    ecWorkTelephone: yup.string(),
    ecRelationship: yup.string().nullable(),
  },
  [["ecMobile", "ecHomeTelephone"]]
);
