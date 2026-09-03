import styles from "./auth-input.module.scss";
import React, { useState, forwardRef } from "react";
import { ReactComponent as EyeShow } from "@assets/images/eye-show-icon.svg";
import { ReactComponent as EyeHide } from "@assets/images/eye-hide-icon.svg";
import { ValidIcon } from "@components/valid-icon/valid-icon";
import classNames from "classnames";

interface InjectedProps {
  errorMessage?: string | boolean | undefined;
  // errorMessage?: string | boolean | undefined;
  valid?: boolean;
  label?: string;
  requiredLabel?: boolean;
  touched?: boolean;
  hideIcon?: boolean;
  errorMessageClassName?: string;
  errorInputClassName?: string;
}

type PropsType = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  InjectedProps;

export const AuthInput = forwardRef<HTMLInputElement, PropsType>(
  (
    {
      errorMessage,
      label,
      valid,
      touched,
      requiredLabel,
      hideIcon,
      errorMessageClassName,
      errorInputClassName,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShow] = useState(false);
    return (
      <div className={styles.InputWrap}>
        {label ? (
          <label htmlFor={props.id}>
            {requiredLabel && <span className="yellow-text">*</span>}
            {label}
          </label>
        ) : null}

        <div className={styles.Input}>
          <input
            {...props}
            className={classNames({
              [errorInputClassName || styles.Error]: touched && !valid,
            })}
            type={showPassword ? "text" : type}
            ref={ref}
          />
          {type === "password" && (
            <span
              className={styles.ShowIconWrapper}
              style={{
                right: touched ? 40 : 10,
              }}
              onClick={() => setShow(!showPassword)}
            >
              {showPassword ? <EyeShow /> : <EyeHide />}
            </span>
          )}
          {touched && !hideIcon ? (
            <ValidIcon
              variant={valid ? "check" : "cross"}
              className={styles.ValidStatusIcon}
            />
          ) : null}
        </div>
        <div className={errorMessageClassName || styles.ErrorMessageWrap}>
          <span className={styles.ErrorMessage}>{errorMessage}</span>
        </div>
      </div>
    );
  }
);
