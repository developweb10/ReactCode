import { useState } from "react";
import styles from "./table-period-selector.module.scss";
import classNames from "classnames";

import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";

import { Typography, ButtonBase, Popover, Button } from "@material-ui/core";
import { DatePicker } from "@components/date-picker/date-picker";

import { Moment } from "moment";

interface Props {
  currentPeriod: {
    from: Moment;
    to: Moment;
  };
  handlePeriodChange: (newPeriod: { from: Moment; to: Moment }) => void;
}

export const TablePeriodSelector: React.FC<Props> = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  // Calendar && Popover
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleDateApply = (range: RangeParams) => {
  //   // handleWeekRangeChange({
  //   //   from: moment(range.from).startOf("day"),
  //   //   to: moment(range.to).endOf("day"),
  //   // });
  //   handleClose();
  // };
  return (
    <div className={styles.Wrapper}>
      <Typography className={styles.HeaderTitle}>Select Period:</Typography>

      <div className={styles.SelectWrapper}>
        <ButtonBase
          onClick={handleClick}
          disableRipple
          disableTouchRipple
          className={styles.SelectBtn}
        >
          <Typography className={styles.SelectedWeekText}>
            {/* {formattedRange} */}
          </Typography>
          <ArrowIcon
            className={classNames(styles.ArrowIcon, {
              [styles.ArrowIconOpen]: Boolean(anchorEl),
            })}
          />
        </ButtonBase>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          disablePortal
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          classes={{
            paper: styles.Paper,
          }}
        >
          <DatePicker />
          <div className={styles.PopoverFooter}>
            <div className={styles.ResetWrapper}>
              <Button
                disableElevation
                disableRipple
                className="button-tertiary"
                // onClick={handleReset}
              >
                <DeleteIcon className={styles.ResetIcon} />
                <Typography className={styles.ResetText}>Reset All</Typography>
              </Button>
            </div>
            <div>
              <Button
                disableElevation
                disableRipple
                className="button-tertiary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="button-primary"
                color="primary"
                variant="contained"
                disableElevation
                disableRipple
                // onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
};
