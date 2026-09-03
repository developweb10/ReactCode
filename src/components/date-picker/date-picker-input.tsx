import React from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { DayPickerInputProps } from "react-day-picker";
import MomentLocaleUtils from "react-day-picker/moment";

export { DayPickerInput as DayPickerInputClass };
export interface Props extends DayPickerInputProps {
  handleDateChange: (newValue: Date) => void;
}
export const DatePickerInput = React.forwardRef<DayPickerInput, Props>(
  ({ handleDateChange, value, ...props }, ref) => {
    return (
      <DayPickerInput
        value={value}
        onDayChange={handleDateChange}
        ref={ref}
        formatDate={MomentLocaleUtils.formatDate}
        parseDate={MomentLocaleUtils.parseDate}
        format="DD MMM YYYY"
        placeholder="__/__/__"
        {...props}
      />
    );
  }
);
