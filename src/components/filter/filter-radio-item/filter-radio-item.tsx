import { useState } from "react";
import { Radio, RadioGroup, FormControlLabel } from "@material-ui/core";

import styles from "./filter-radio-item.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { Button, ButtonBase, Typography } from "@material-ui/core/";

import { FilterMenuItem } from "@components/filter/filter-menu-item/filter-menu-item";

interface FilterItemProps<T> {
  label: string;
  header: string;
  activeFilter: string;
  appliedFilters: T;
  onLabelClick: (label: string) => void;
  onApply: (newFilters: T) => void;
}

export function FilterRadioItem<T extends any[]>({
  label,
  header,
  activeFilter,
  appliedFilters,
  onLabelClick,
  onApply,
}: React.PropsWithChildren<FilterItemProps<T>>) {
  const [radioValue, setRadio] = useState<boolean | string>(
    typeof appliedFilters[0]?.value === "boolean"
      ? appliedFilters[0]?.value
      : ""
  );

  if (!activeFilter) {
    return (
      <FilterMenuItem
        onClick={() => onLabelClick(label)}
        label={label}
        filtersCount={appliedFilters[0] ? 1 : 0}
      />
    );
  }

  if (activeFilter && activeFilter !== label) {
    return null;
  }

  const handleApplyClick = () => {
    const emptyArr: any[] = [];
    onApply(
      radioValue === ""
        ? (emptyArr as T)
        : ([{ value: radioValue, name: radioValue }] as T)
    );
  };

  const handleReset = () => {
    setRadio("");
    const emptyArr: any[] = [];
    onApply(emptyArr as T);
  };

  return (
    <div className={styles.Wrap}>
      <div className={styles.Title}>
        <span>{header}</span>
        <ButtonBase
          onClick={handleReset}
          className={styles.ResetButton}
          disableRipple
        >
          <DeleteIcon className={styles.DeleteIcon} />
          <Typography className={styles.ResetText}>Reset All</Typography>
        </ButtonBase>
      </div>
      <RadioGroup
        value={radioValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          let value = event.target.value;

          if (value === "") {
            setRadio(value);
          } else {
            setRadio(value === "true");
          }
        }}
      >
        <FormControlLabel
          classes={{
            label: styles.RadioControlLabel,
            root: styles.RadioRoot,
          }}
          value=""
          control={<Radio color="primary" size="small" />}
          label="Show All"
        />
        <FormControlLabel
          classes={{
            label: styles.RadioControlLabel,
            root: styles.RadioRoot,
          }}
          value={true}
          control={<Radio color="primary" size="small" />}
          label="Show Only Suspended"
        />
        <FormControlLabel
          value={false}
          classes={{
            label: styles.RadioControlLabel,
            root: styles.RadioRoot,
          }}
          control={<Radio color="primary" size="small" />}
          label="Show Only Not Suspended"
        />
      </RadioGroup>

      <div className={styles.ButtonWrapper}>
        <Button
          color="primary"
          variant="contained"
          disableElevation
          onClick={handleApplyClick}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
