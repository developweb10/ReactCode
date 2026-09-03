import { useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import styles from "./filter-date-item.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import moment from "moment";

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

export function FilterDateItem<T extends any[]>({
  label,
  header,
  activeFilter,
  appliedFilters,
  onLabelClick,
  onApply,
}: React.PropsWithChildren<FilterItemProps<T>>) {
  const [date, setDate] = useState<string>(
    appliedFilters[0]?.value || moment.utc().startOf("day").format("yyyy-MM-DD")
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
    onApply([{ value: date, name: date }] as T);
  };

  const handleReset = () => {
    setDate(moment.utc().startOf("day").format("yyyy-MM-DD"));
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
      <DatePicker
        autoOk
        variant="static"
        orientation="portrait"
        openTo="date"
        format="yyyy-MM-DD"
        value={date}
        onChange={(date) => {
          if (date) {
            setDate(date.format("yyyy-MM-DD"));
          }
        }}
      />

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
