import * as yup from "yup";

export const contactInfoSchema = yup.object().shape(
  {
    address1: yup.string().required("Provide Address"),
    address2: yup.string(),
    city: yup.string(),
    town: yup.string(),
    postCode: yup.string().required("Provide Post Code"),
    country: yup.string().nullable(),
    houseNumber: yup.string().when("mobileNumber", {
      is: "",
      then: yup.string().required("Provide Mobile or Home Number"),
    }),
    mobileNumber: yup.string().when("houseNumber", {
      is: "",
      then: yup.string().required("Provide Mobile or Home Number"),
    }),
    email: yup.string().email("Invalid Email").required("Provide Email"),
    personalEmail: yup.string().email("Invalid Email"),
    otherEmail: yup.string().email("Invalid Email"),
  },
  [["houseNumber", "mobileNumber"]]
);
