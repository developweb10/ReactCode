import React, { useRef, useEffect, useState } from "react";
import classNames from "classnames";
import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";

import styles from "./autocomplete.module.scss";
import { usePrevious } from "@hooks/usePrevious";
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
} from "@material-ui/lab";
import IconButton from "@material-ui/core/IconButton";
import { Input, InputProps } from "@components/input/input";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";

interface MyAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined
> extends Omit<
    MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
    "renderInput" | "options"
  > {
  fetch: (search?: string) => any;
  onClose?: () => void;
  debouncedSearch?: boolean;
  inputProps?: InputProps;
  hideArrow?: boolean;
  browserAutocompleteOff?: boolean;
}

export function Autocomplete<
  T = any,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined
>({
  inputProps,
  fetch,
  onClose,
  debouncedSearch,
  hideArrow,
  browserAutocompleteOff,
  ...props
}: MyAutocomplete<T, Multiple, DisableClearable, FreeSolo>) {
  const [open, setOpen] = useState(false);
  const [initialFetchMade, setInitialFetch] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);

  const onSearch$ = useRef(new Subject<string>());
  const prevSearch = usePrevious(searchValue);

  useEffect(() => {
    if (open && !initialFetchMade) {
      (async () => {
        const options = await fetch();
        if (options && options.data.length) {
          setOptions(options.data);
        }
        setInitialFetch(true);
        setLoading(false);
      })();
    }
  }, [open, fetch, initialFetchMade]);

  useEffect(() => {
    if (prevSearch !== searchValue && open && debouncedSearch) {
      setOptions([]);
      setLoading(true);
      (async () => {
        const options = await fetch(searchValue);

        if (options && options.data.length) {
          setOptions(options.data);
        }
        setLoading(false);
      })();
    }
  }, [searchValue, fetch, prevSearch, open, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch) {
      const subscription = onSearch$.current
        .pipe(debounceTime(400))
        .subscribe((newSearch) => {
          setSearchValue(newSearch);
        });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [debouncedSearch]);

  return (
    <MuiAutocomplete
      className={styles.Autocomplete}
      classes={{
        paper: styles.Paper,
        popper: styles.Popper,
      }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
        if (onClose) {
          onClose();
        }
      }}
      loading={loading}
      noOptionsText="Not Found"
      openOnFocus
      options={options}
      onInputChange={(event: React.ChangeEvent<{}>, value: string, reason) => {
        if (debouncedSearch && reason !== "reset") {
          onSearch$.current.next(value);
        }
      }}
      renderInput={(params) => (
        <Input
          ref={params.InputProps.ref}
          endAdornment={
            !hideArrow &&
            !props.disabled && (
              <IconButton
                className={styles.IconButton}
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <ArrowIcon
                  className={classNames(styles.ArrowIcon, {
                    [styles.ArrowIconOpen]: open,
                  })}
                />
              </IconButton>
            )
          }
          {...inputProps}
          inputProps={{
            ...params.inputProps,
            autoComplete: browserAutocompleteOff ? "off" : "new-password",
          }}
        />
      )}
      {...props}
    />
  );
}
