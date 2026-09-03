import * as yup from "yup";

export const lineManagersInfoSchema = yup.object().shape({
  primaryLineManager: yup.mixed(),
  secondaryLineManager: yup.mixed(),
});
