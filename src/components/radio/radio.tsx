import styles from "./radio.module.scss";
import {
  Radio as MuiRadio,
  RadioProps,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
} from "@material-ui/core";

interface Props extends RadioProps {}

export const Radio: React.FC<Props> = ({ ...props }) => {
  return <MuiRadio color="primary" {...props} />;
};
