import styles from "./button.module.scss";
import classNames from "classnames";
import { Button as MuiButton, ButtonProps } from "@material-ui/core";

interface MyButtonProps extends ButtonProps {
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<MyButtonProps> = ({
  loading,
  children,
  className,
  ...rest
}) => {
  return (
    <MuiButton
      className={classNames(
        styles.Button,
        {
          [styles.ButtonTetr]: rest.variant === "text",
          [styles.ButtonSec]: rest.color === "secondary",
        },
        className
      )}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};
