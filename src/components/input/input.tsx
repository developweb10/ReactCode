import React from "react";
import styles from "./input.module.scss";
import classNames from "classnames";

import {
  InputBase,
  InputAdornment,
  InputBaseProps,
  InputLabelProps,
  InputLabel,
  FormHelperText,
  FormHelperTextProps,
} from "@material-ui/core";

export interface InputProps extends InputBaseProps {
  errorMessage?: string | boolean | undefined;
  label?: string;
  labelRequired?: boolean;
  labelProps?: InputLabelProps;
  helperTextProps?: FormHelperTextProps;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  inputClassname?: string;
  withPlaceholderSpace?: boolean;
}
export const Input = React.forwardRef<any, InputProps>(
  (
    {
      errorMessage,
      label,
      labelRequired,
      labelProps,
      helperTextProps,
      endAdornment,
      startAdornment,
      inputClassname,
      withPlaceholderSpace,
      ...props
    },
    ref
  ) => {
    return (
      <div className={styles.Root}>
        {label && (
          <InputLabel
            htmlFor={props.id}
            className={styles.Label}
            disableAnimation
            {...labelProps}
          >
            {labelRequired && <span className={styles.LabelAsterix}>*</span>}
            {label}
          </InputLabel>
        )}

        <InputBase
          className={classNames(
            styles.Input,
            { [styles.PlaceholderSpace]: withPlaceholderSpace },
            inputClassname
          )}
          classes={{
            focused: styles.Focused,
          }}
          ref={ref}
          {...props}
          {...(endAdornment
            ? {
                endAdornment: (
                  <InputAdornment
                    position="end"
                    className={styles.EndAdornment}
                  >
                    {endAdornment}
                  </InputAdornment>
                ),
              }
            : {})}
          {...(startAdornment
            ? {
                startAdornment: (
                  <InputAdornment
                    position="start"
                    className={styles.StartAdornment}
                  >
                    {startAdornment}
                  </InputAdornment>
                ),
              }
            : {})}
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
