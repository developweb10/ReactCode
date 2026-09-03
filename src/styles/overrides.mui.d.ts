import { MuiPickersOverrides } from "@material-ui/pickers/typings/overrides";

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof Required<MuiPickersOverrides>[P];
};
declare module "@material-ui/core/styles/overrides" {
  export interface ComponentNameToClassKey
    extends Required<overridesNameToClassKey> {}
}
