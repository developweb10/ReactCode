import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";

import styles from "./filter-item.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";

import {
  Button,
  Chip,
  CircularProgress,
  ButtonBase,
  Typography,
} from "@material-ui/core/";
import { Input } from "@components/input/input";
import { FilterMenuItem } from "@components/filter/filter-menu-item/filter-menu-item";
import { FilterOptionItem } from "@components/filter/filter-option-item/filter-option-item";

import { usePrevious } from "@hooks/usePrevious";

import { AppliedFilterItem } from "../types";

interface FilterItemProps<T> {
  label: string;
  header: string;
  activeFilter: string;
  appliedFilters: T;
  fetchOptions: (search: string) => Promise<AppliedFilterItem[]>;
  onLabelClick: (label: string) => void;
  onApply: (newFilters: T) => void;
}

export function FilterItem<T extends any[]>({
  label,
  header,
  activeFilter,
  appliedFilters,
  fetchOptions,
  onLabelClick,
  onApply,
}: React.PropsWithChildren<FilterItemProps<T>>) {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const searchMade = useRef(false);
  const [options, setOptions] = useState<AppliedFilterItem[]>([]);
  const [selectedFilterOptions, setSelectedOption] =
    useState<AppliedFilterItem[]>(appliedFilters);

  const currentSelectedFilter = useMemo(() => {
    return activeFilter === label;
  }, [activeFilter, label]);
  const onSearch$ = useRef(new Subject<string>());
  const prevSearch = usePrevious(searchValue);

  const prevActiveFilter = usePrevious(activeFilter);

  const fetchOptionsOpt = useRef((search: string) => fetchOptions(search));

  useEffect(() => {
    if (currentSelectedFilter) {
      (async () => {
        const options = await fetchOptionsOpt.current("");
        if (options && options.length) {
          setOptions(options);
        }
        setLoading(false);
      })();
    }
  }, [currentSelectedFilter]);

  useEffect(() => {
    if (currentSelectedFilter && prevSearch !== searchValue) {
      setLoading(true);

      (async () => {
        const options = await fetchOptionsOpt.current(searchValue);
        setOptions(options);
        searchMade.current = true;
        setLoading(false);
      })();
    }
  }, [currentSelectedFilter, prevSearch, searchValue]);

  useEffect(() => {
    const subscription = onSearch$.current
      .pipe(debounceTime(400))
      .subscribe((newSearch) => {
        searchMade.current = false;
        setSearchValue(newSearch);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeFilter && prevActiveFilter === label) {
      setSelectedOption(appliedFilters);
    }
  }, [activeFilter, appliedFilters, label, prevActiveFilter]);

  const isFilterOptionSelected = useCallback(
    (option: AppliedFilterItem) => {
      return !!selectedFilterOptions.filter((o) => o.value === option.value)
        .length;
    },
    [selectedFilterOptions]
  );

  if (!activeFilter) {
    return (
      <FilterMenuItem
        onClick={() => onLabelClick(label)}
        label={label}
        filtersCount={selectedFilterOptions.length}
      />
    );
  }

  if (activeFilter && activeFilter !== label) {
    return null;
  }

  const handleFilterOptionSelect = (
    option: AppliedFilterItem,
    isSelected: boolean
  ) => {
    if (isSelected) {
      handleFilterOptionDelete(option);
    } else {
      setSelectedOption([...selectedFilterOptions, option]);
    }
  };

  const handleFilterOptionDelete = (filterItem: AppliedFilterItem) => {
    setSelectedOption(
      selectedFilterOptions.filter((item) => {
        return item.value !== filterItem.value;
      })
    );
  };

  const handleApplyClick = () => {
    onApply(selectedFilterOptions as T);
  };

  const handleReset = () => {
    setSelectedOption([]);
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
      <div className={styles.Input}>
        <Input
          placeholder="Search..."
          inputClassname={styles.Input}
          onChange={(
            e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
          ) => {
            onSearch$.current.next(e.target.value);
          }}
        />
      </div>
      <div className={styles.SelectedFilters}>
        {selectedFilterOptions.map((selectedFilter) => (
          <Chip
            key={selectedFilter.value}
            clickable={false}
            className={styles.Chip}
            label={
              <Typography className={styles.ChipLabel} noWrap>
                {selectedFilter.name}
              </Typography>
            }
            onDelete={() => {
              handleFilterOptionDelete(selectedFilter);
            }}
          />
        ))}
      </div>

      {searchMade.current && !!searchValue && !options.length ? (
        <div className={styles.NotFound}>
          <span>Sorry, there are no matching results</span>
        </div>
      ) : (
        <div className={styles.OptionsList}>
          {!!loading && (
            <div className="overlay-loader with-opacity">
              <CircularProgress
                size="6rem"
                variant="indeterminate"
                disableShrink
              />
            </div>
          )}
          {options.map((option) => (
            <FilterOptionItem
              key={option.value}
              onClick={(isSelected) => {
                handleFilterOptionSelect(option, isSelected);
              }}
              isSelected={isFilterOptionSelected(option)}
            >
              {option.name}
            </FilterOptionItem>
          ))}
        </div>
      )}

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
