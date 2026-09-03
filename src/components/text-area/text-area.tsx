import React from "react";
import styles from "./text-area.module.scss";
import classNames from "classnames";
import {
  InputBase,
  InputBaseProps,
  FormHelperTextProps,
  FormHelperText,
} from "@material-ui/core";

interface Props extends InputBaseProps {
  errorMessage?: string | boolean | undefined;
  label?: string;
  labelRequired?: boolean;
  helperTextProps?: FormHelperTextProps;
}
export const TextArea = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      rows,
      label,
      labelRequired,
      id,
      errorMessage,
      helperTextProps,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={styles.Root}>
        {label && (
          <label htmlFor={id} className={styles.Label}>
            {labelRequired && <span className={styles.LabelAsterix}>*</span>}
            {label}
          </label>
        )}
        <InputBase
          className={classNames(styles.TextArea, className)}
          ref={ref}
          multiline
          rows={rows || 10}
          id={id}
          {...props}
        />
        {errorMessage && (
          <FormHelperText className={styles.Error} {...helperTextProps}>
            {errorMessage}
          </FormHelperText>
        )}
      </div>
    );
  }
);
