import styles from "./valid-icon.module.scss";
import classNames from "classnames";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";

interface Props {
  variant: "check" | "cross";
  className?: string;
}

export const ValidIcon: React.FC<Props> = ({ variant, className }) => {
  return (
    <span
      className={classNames(
        styles.ValidStatusIcon,
        {
          [styles.Valid]: variant === "check",
          [styles.Invalid]: variant === "cross",
        },
        className
      )}
    >
      {variant === "check" && <CheckIcon fontSize="inherit" />}
      {variant === "cross" && <ClearIcon fontSize="inherit" />}
    </span>
  );
};
