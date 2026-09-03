import { useState } from "react";

import { ReactComponent as FilterIcon } from "@assets/images/filter-yellow-icon.svg";
import { ReactComponent as ArrowBackIcon } from "@assets/images/arrow-left-icon.svg";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import CrossIcon from "@assets/images/cross-icon.svg";
import styles from "./filter-drawer.module.scss";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";

import { Drawer, Typography, IconButton, ButtonBase } from "@material-ui/core/";

const useStyles = makeStyles({
  paper: {
    boxShadow: "none",
  },
});

interface Props {
  appliedFiltersCount: number;
  onFilterReset: () => void;
  children({
    toggleDrawer,
    handleActiveChange,
    activeFilter,
  }: {
    toggleDrawer: (visibility: boolean, resetMenu?: boolean) => void;
    handleActiveChange: (newActive: string) => void;
    activeFilter: string;
  }): React.ReactNode;
}

export const FilterDrawer: React.FC<Props> = ({
  appliedFiltersCount,
  children,
  onFilterReset,
}) => {
  const classes = useStyles();
  const [drawerVisible, setVisibility] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const toggleDrawer = (visibility: boolean, resetMenu?: boolean) => () => {
    setVisibility(visibility);
    if (resetMenu) setActiveFilter("");
  };

  const handleReset = () => {
    if (appliedFiltersCount > 0) {
      setVisibility(false);
      onFilterReset();
    }
  };

  const handleActiveChange = (newActive: string) => {
    setActiveFilter(newActive);
  };

  return (
    <div>
      <IconButton
        className={styles.FilterButton}
        disableRipple
        onClick={toggleDrawer(true, true)}
      >
        <FilterIcon />
        {appliedFiltersCount > 0 && (
          <div className={styles.FilterCount}>
            <span>{appliedFiltersCount}</span>
          </div>
        )}
      </IconButton>
      <Drawer
        classes={{ paper: classes.paper }}
        anchor={"right"}
        open={drawerVisible}
        onClose={toggleDrawer(false)}
      >
        <div className={styles.FilterDrawerWrapper}>
          <div
            className={classNames(styles.FilterDrawerHeader, {
              [styles.FilterDrawerHeaderSelected]: !!activeFilter,
            })}
          >
            {activeFilter ? (
              <ButtonBase
                onClick={() => {
                  setActiveFilter("");
                }}
                className={styles.BackButton}
                disableRipple
              >
                <ArrowBackIcon className={styles.BackIcon} />
                <Typography className={styles.BackText}>Back</Typography>
              </ButtonBase>
            ) : (
              <>
                <div className={styles.FilterButton}>
                  <span className={styles.FilterIconWrapper}>
                    <FilterIcon />
                  </span>
                </div>
                <span className={styles.FilterHeader}>Filters</span>
                <ButtonBase
                  onClick={handleReset}
                  className={styles.ResetButton}
                  disableRipple
                >
                  <DeleteIcon className={styles.DeleteIcon} />
                  <Typography className={styles.ResetText}>
                    Reset All
                  </Typography>
                </ButtonBase>
              </>
            )}

            <IconButton
              onClick={toggleDrawer(false)}
              className={styles.CloseButton}
              disableRipple
            >
              <img src={CrossIcon} alt="Close Drawer" />
            </IconButton>
          </div>
          <div className={styles.FilterDrawerBody}>
            {children({ toggleDrawer, handleActiveChange, activeFilter })}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
