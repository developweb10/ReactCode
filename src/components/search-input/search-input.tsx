import { useState, forwardRef, useRef, useEffect } from "react";
import classNames from "classnames";
import styles from "./search-input.module.scss";
import SearchIcon from "@assets/images/search-yellow-icon.svg";

import { InputBase, InputBaseProps, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

interface SearchInputProps extends Omit<InputBaseProps, "onChange"> {
  value?: string;
  searchValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = forwardRef<any, SearchInputProps>(
  ({ value, searchValue, onChange, placeholder, ...props }, ref) => {
    const [isFocused, setFocus] = useState(false);
    const iRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const theme = useTheme();
    const tabletBreakpoint = useMediaQuery(
      theme.breakpoints.down(theme.breakpoints.values.tablet)
    );

    useEffect(() => {
      if (searchValue === "" && iRef.current) {
        iRef.current.value = "";
      }
    }, [searchValue, value]);

    return (
      <InputBase
        inputRef={iRef}
        placeholder={placeholder || "Search anything"}
        value={value}
        className={classNames(styles.SearchInput, {
          [styles.MobileSearchInput]: tabletBreakpoint,
          [styles.Focused]:
            isFocused || (!!iRef.current?.value && tabletBreakpoint),
        })}
        inputProps={{ maxLength: 40 }}
        onChange={(
          event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
        ) => {
          onChange(event.target.value);
        }}
        onFocus={() => {
          if (tabletBreakpoint) {
            setFocus(true);
          }
        }}
        onBlur={() => {
          if (tabletBreakpoint) {
            setFocus(false);
          }
        }}
        startAdornment={
          <img
            className={styles.SearchIcon}
            src={SearchIcon}
            alt="Search"
            onClick={() => {
              iRef.current?.focus();
            }}
          />
        }
        {...props}
      />
    );
  }
);
