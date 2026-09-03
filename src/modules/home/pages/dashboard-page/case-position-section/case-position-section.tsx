import sharedStyles from "../dashboard-page.module.scss";
import styles from "./case-position-section.module.scss";
import { useState, useEffect } from "react";

import classNames from "classnames";

import { RegionalManagerModel } from "@models/managers.models";
import { DashboardApi } from "@api/dashboard/dashboard.api";
import { ManagersApi } from "@api/managers/managers.api";

import {
  Typography,
  Box,
  ButtonBase,
  Popper,
  InputBase,
  ClickAwayListener,
  CircularProgress,
} from "@material-ui/core";

import Autocomplete from "@material-ui/lab/Autocomplete";

import { YearBarChart } from "@components/charts/bar-chart/bar-chart";

import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";
import SearchIcon from "@assets/images/search-yellow-icon.svg";
import { ReactComponent as CheckmarkIcon } from "@assets/images/checkmark-yellow-icon.svg";

import moment from "moment";
import { isMobile } from "react-device-detect";

interface BarKey {
  key: string;
  fill: string;
}

export const CasePositionSection: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [barData, setBarData] = useState<{ [key: string]: any }[]>([]);

  const [barKeys, setBarKeys] = useState<BarKey[]>([]);

  const [loadingAutocomplete, setLoadingAutocomplete] = useState(true);
  const [options, setOptions] = useState<RegionalManagerModel[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingAutocomplete(true);
        const { data } = await ManagersApi.fetchRegionalManagers();
        setOptions(data || []);
        setValue(data.slice(0, 2));
        setLoadingAutocomplete(false);
      } catch (error) {
        setLoadingAutocomplete(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!!value.length) {
      (async () => {
        setLoading(true);
        try {
          const { data } = await DashboardApi.getRegionalManagerStats(
            value.map((v) => v.id)
          );
          const labels = data.labels.map((l) => ({
            month: moment.monthsShort(l - 1),
          }));

          const keys = data.datasets.map(({ label, data }, i) => {
            data.forEach((d, index) => {
              labels[index] = { ...labels[index], [label]: d };
            });
            return {
              key: label,
              fill: i === 1 ? "#FFAA28" : "#ffcb0b",
            };
          });
          setLoading(false);
          setBarData(labels);
          setBarKeys(keys);
        } catch (error) {
          setLoading(false);
        }
      })();
    } else {
      setBarKeys([]);
      setBarData([]);
    }
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleAutocompleteChange = (
    e: React.ChangeEvent<{}>,
    newValue: { id: number; name: string }[]
  ) => {
    if (newValue.length <= 2) {
      setValue(newValue);
    }
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      className={classNames(sharedStyles.Section, styles.CasePositionSection)}
    >
      <Box className={classNames(sharedStyles.Card, styles.CaseByRegionalCard)}>
        {loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}
        <div className={styles.Header}>
          <Typography className={sharedStyles.CardTitle}>
            Number of cases by Regional Manager
          </Typography>
          <ClickAwayListener onClickAway={handleClickAway}>
            <div className={styles.SelectWrapper}>
              <ButtonBase
                onClick={handleClick}
                disableRipple
                disableTouchRipple
                className={sharedStyles.SelectBtn}
              >
                <Typography>Select Managers</Typography>
                <ArrowIcon
                  className={classNames(sharedStyles.ArrowIcon, {
                    [sharedStyles.ArrowIconOpen]: Boolean(anchorEl),
                  })}
                />
              </ButtonBase>
              <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="bottom-start"
                className={sharedStyles.Popper}
                popperOptions={{
                  modifiers: {
                    offset: {
                      offset: "0, 10,10,10",
                    },
                  },
                }}
              >
                <Autocomplete
                  open
                  multiple
                  value={value}
                  onChange={handleAutocompleteChange}
                  disableCloseOnSelect
                  disablePortal
                  renderTags={() => null}
                  loading={loadingAutocomplete}
                  noOptionsText="Not Found"
                  renderOption={(option, { selected }) => (
                    <>
                      <div>{option.name}</div>

                      <CheckmarkIcon
                        className={sharedStyles.CheckIcon}
                        style={{ visibility: selected ? "visible" : "hidden" }}
                      />
                    </>
                  )}
                  options={options}
                  getOptionLabel={(option) => option.name}
                  classes={{
                    root: sharedStyles.Autocomplete,
                    paper: sharedStyles.Paper,
                    popperDisablePortal: sharedStyles.PopperDisabledPortal,
                    listbox: sharedStyles.AutocompleteList,
                  }}
                  renderInput={(params) => (
                    <InputBase
                      ref={params.InputProps.ref}
                      inputProps={params.inputProps}
                      className={sharedStyles.SearchInput}
                      autoFocus={!isMobile}
                      placeholder="Search by Name"
                      startAdornment={
                        <img
                          className={sharedStyles.SearchIcon}
                          src={SearchIcon}
                          alt="Search"
                        />
                      }
                    />
                  )}
                />
              </Popper>
            </div>
          </ClickAwayListener>
        </div>
        <div className={styles.Chart}>
          {!!barData.length && !!barKeys.length && (
            <YearBarChart barData={barData} barDataKeys={barKeys} />
          )}
        </div>
      </Box>
    </Box>
  );
};
