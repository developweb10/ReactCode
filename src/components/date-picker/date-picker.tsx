import { useState, useCallback } from "react";
import { isMobile } from "react-device-detect";
import { IconButton } from "@material-ui/core";
import ReactDayPicker, { DateUtils, Modifier } from "react-day-picker";
import moment from "moment";
import MomentLocaleUtils from "react-day-picker/moment";
import { ReactComponent as LeftIcon } from "@assets/images/left-calendar-icon.svg";
import { ReactComponent as RightIcon } from "@assets/images/right-calendar-icon.svg";

export type StateDate = Date | undefined | null;

export interface RangeParams {
  from: StateDate;
  to?: StateDate;
}

export interface DateState {
  from: StateDate;
  to: StateDate;
  enteredTo: StateDate;
}

function Weekday({ weekday, className, localeUtils, locale }: any) {
  const weekdayName = localeUtils.formatWeekdayLong(weekday, locale);

  return (
    <div className={className} title={weekdayName}>
      {weekdayName.slice(0, 3)}
    </div>
  );
}

interface Props {
  initialRange?: RangeParams;
  range?: DateState;
  limit?: number;
  onRangeChange?: ({ from, to }: RangeParams) => void;
  onChange?: (params: DateState) => void;
  disabledWeekends?: boolean;
  disabledFuture?: boolean;
}

export const DatePicker: React.FC<Props> = ({
  initialRange,
  range,
  limit,
  disabledWeekends,
  disabledFuture,
  onChange,
  onRangeChange,
}) => {
  const [dateState, setDateState] = useState<DateState>({
    from: initialRange?.from,
    to: initialRange?.to,
    enteredTo: initialRange?.to,
  });

  const state = range || dateState;

  const handleStateChange = useCallback(
    (newState: DateState) => {
      if (range && onChange) {
        onChange(newState);
      } else {
        setDateState(newState);
      }
    },
    [onChange, range]
  );

  const isSelectingFirstDay = useCallback(
    (from: StateDate, to: StateDate, day: Date) => {
      const isBeforeFirstDay = from && DateUtils.isDayBefore(day, from);
      const isRangeSelected = from && to;
      return !from || isBeforeFirstDay || isRangeSelected;
    },
    []
  );

  const handleDayClick = (day: Date, m: any) => {
    if (m.disabled && (disabledWeekends || disabledFuture)) return;

    if (isSelectingFirstDay(state.from, state.to, day)) {
      handleStateChange({ from: day, to: null, enteredTo: null });
    } else {
      let end = day;
      if (limit) {
        const selectedDaysCount =
          moment(day).diff(moment(state.from), "days") + 1;
        if (selectedDaysCount > limit) {
          end = moment(state.from).add(limit, "days").toDate();
        }
      }
      if (onRangeChange) {
        onRangeChange({ from: state.from, to: end });
      }
      handleStateChange({
        ...state,
        to: end,
        enteredTo: end,
      });
    }
  };

  const handleDayMouseEnter = useCallback(
    (day: Date) => {
      if (isMobile) return;

      if (!isSelectingFirstDay(state.from, state.to, day)) {
        let enteredTo = day;
        if (limit) {
          const selectedDaysCount =
            moment(day).diff(moment(state.from), "days") + 1;
          if (selectedDaysCount > limit) {
            enteredTo = moment(state.from).add(limit, "days").toDate();
          }
        }

        handleStateChange({
          ...state,
          enteredTo,
        });
      }
    },
    [handleStateChange, isSelectingFirstDay, state, limit]
  );

  return (
    <ReactDayPicker
      localeUtils={MomentLocaleUtils}
      locale={"en-gb"}
      numberOfMonths={2}
      disabledDays={[
        disabledWeekends ? { daysOfWeek: [0, 6] } : ({} as Modifier),
        disabledFuture ? { after: new Date() } : ({} as Modifier),
      ]}
      selectedDays={[
        state.from || undefined,
        { from: state.from, to: state.enteredTo },
      ]}
      modifiers={{
        start: state.from || undefined,
        end: state.enteredTo || undefined,
        firstDayMonth: (day) => day.getDate() === 1,
        lastDayMonth: (day) => {
          const lastDay = new Date(
            day.getFullYear(),
            day.getMonth() + 1,
            0
          ).getDate();
          return day.getDate() === lastDay;
        },
        ...(disabledWeekends
          ? {
              friday: (day) => {
                return day.getDay() === 5;
              },
            }
          : {}),
      }}
      weekdayElement={<Weekday />}
      onDayClick={handleDayClick}
      onDayMouseEnter={handleDayMouseEnter}
      initialMonth={state.from || undefined}
      captionElement={({ date }) => {
        const mDate = moment(date);

        return (
          <div className="DayPicker-Caption">{mDate.format("MMMM YYYY")}</div>
        );
      }}
      navbarElement={({ className, onNextClick, onPreviousClick }) => {
        return (
          <div className={className}>
            <IconButton
              disableRipple
              disableTouchRipple
              onClick={() => onPreviousClick()}
              className="nav-button nav-button--left"
            >
              <LeftIcon />
            </IconButton>
            <IconButton
              disableRipple
              disableTouchRipple
              onClick={() => onNextClick()}
              className="nav-button nav-button--right"
            >
              <RightIcon />
            </IconButton>
          </div>
        );
      }}
    />
  );
};
