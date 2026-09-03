import styles from "./weekly-calendar.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { useState } from "react";
import ReactDayPicker from "react-day-picker";
import MomentLocaleUtils from "react-day-picker/moment";
import { Button, Typography } from "@material-ui/core";
import moment from "moment";

function getWeekRange(date: Date) {
  return {
    from: moment(date).startOf("week").toDate(),
    to: moment(date).endOf("week").toDate(),
  };
}

function Weekday({ weekday, className, localeUtils, locale }: any) {
  const weekdayName = localeUtils.formatWeekdayLong(weekday, locale);

  return (
    <div className={className} title={weekdayName}>
      {weekdayName.slice(0, 3)}
    </div>
  );
}

export type StateDate = Date | undefined | null;

export interface RangeParams {
  from: StateDate;
  to: StateDate;
}

interface Props {
  initialRange: RangeParams;
  onApply: (range: RangeParams) => void;
  onCancel: () => void;
}

export const WeeklyCalendar: React.FC<Props> = ({
  initialRange,
  onApply,
  onCancel,
}) => {
  const [selectedDays, setSelectedDays] = useState<RangeParams>({
    from: initialRange.from,
    to: initialRange.to,
  });
  const [hoverRange, setHoverRange] = useState<
    | {
        from: Date;
        to: Date;
      }
    | undefined
  >(undefined);

  const handleReset = () => {
    setSelectedDays({
      from: initialRange.from,
      to: initialRange.to,
    });
  };

  const handleApply = () => {
    onApply(selectedDays);
  };

  const handleDayChange = (date: Date) => {
    const { from, to } = getWeekRange(date);
    setSelectedDays({
      from,
      to,
    });
  };

  const handleDayEnter = (date: Date) => {
    setHoverRange(getWeekRange(date));
  };

  const handleDayLeave = () => {
    setHoverRange(undefined);
  };

  return (
    <div>
      <ReactDayPicker
        localeUtils={MomentLocaleUtils}
        locale={"en-gb"}
        initialMonth={selectedDays.from || undefined}
        modifiers={{
          hoverRange,
          selectedWeek: selectedDays,
        }}
        weekdayElement={<Weekday />}
        selectedDays={[
          selectedDays.from || undefined,
          { from: selectedDays.from, to: selectedDays.to },
        ]}
        showOutsideDays
        onDayClick={handleDayChange}
        onDayMouseEnter={handleDayEnter}
        onDayMouseLeave={handleDayLeave}
      />
      <div className={styles.CalendarActions}>
        <div className={styles.ResetWrapper}>
          <Button
            disableElevation
            disableRipple
            className="button-tertiary"
            onClick={handleReset}
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="button-primary"
            color="primary"
            variant="contained"
            disableElevation
            disableRipple
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
