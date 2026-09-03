import React from "react";
import classNames from "classnames";
import styles from "./select.module.scss";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";

import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
} from "@material-ui/core";

import { Input, InputProps } from "@components/input/input";

export interface SelectOption {
  name: string;
  value: any;
  onOptionClick?: (value: any) => void;
}

interface SelectProps extends Omit<MuiSelectProps, "inputProps"> {
  inputProps?: InputProps;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = React.forwardRef<any, SelectProps>(
  ({ inputProps, options, disabled, ...props }, ref) => {
    return (
      <MuiSelect
        input={<Input {...inputProps} />}
        {...props}
        disabled={disabled}
        MenuProps={{
          classes: { paper: styles.SelectPaper },
          getContentAnchorEl: null,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          elevation: 1,
        }}
        classes={{ select: styles.Select, disabled: styles.Disabled }}
        ref={ref}
        IconComponent={(props) =>
          !disabled ? (
            <ArrowIcon
              style={{
                pointerEvents: "none",
              }}
              {...props}
              className={classNames(styles.ArrowIcon)}
            />
          ) : null
        }
      >
        {options.map(({ name, value, onOptionClick }) => {
          return (
            <MenuItem
              key={value}
              value={value}
              onClick={() => {
                if (onOptionClick) onOptionClick(value);
              }}
            >
              {name}
            </MenuItem>
          );
        })}
      </MuiSelect>
    );
  }
);
