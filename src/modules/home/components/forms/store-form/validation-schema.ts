import * as yup from "yup";
import { onlyLettersAndSpacesWithHyphen } from "@utils/regexp";

export const validationSchema = yup.object({
  name: yup
    .string()
    .required("Provide Location Name")
    .matches(onlyLettersAndSpacesWithHyphen, "Invalid Location Name"),
  mobileNumber: yup.string(),
  regionalManagerId: yup
    .mixed()
    .nullable()
    .required("Provide Regional Manager"),
  districtManagerId: yup
    .mixed()
    .nullable()
    .required("Provide District Manager"),
  hrManagerId: yup.mixed().nullable().required("Provide HR User"),
  contactInfo: yup.string(),
});
