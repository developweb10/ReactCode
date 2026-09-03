import { useState } from "react";
import { Input } from "@components/input/input";
import { Controller } from "react-hook-form";
import NumberFormat from "react-number-format";
import Divider from "@material-ui/core/Divider";
import { getNextPayday } from "@utils/date/get-next-payday";
import moment from "moment";

export { salaryInfoSchema } from "./validation-schema";

export const SalaryDetailsForm = ({
  setFieldValue,
  getValues,
  control,
  groupName,
  errors,
  initialValues,
  withDivider,
  disabled,
}: any) => {
  const [weeklyPay, setWeeklyPay] = useState<string | number>(
    initialValues?.salaryInfo?.salary
      ? initialValues.salaryInfo.salary / 52
      : ""
  );
  const [monthlyPay, setMonthlyPay] = useState<string | number>(
    initialValues?.salaryInfo?.salary
      ? initialValues.salaryInfo.salary / 12
      : ""
  );

  return (
    <div className="input-group">
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.hoursPerWeek`}
          render={(props) => (
            <NumberFormat
              id="hoursPerWeek"
              label="Hours Per Week"
              labelRequired
              placeholder="Hours Per Week"
              value={props.value}
              customInput={Input}
              disabled={disabled}
              type="text"
              errorMessage={errors.hoursPerWeek?.message}
              isNumericString
              decimalScale={2}
              endAdornment="h"
              allowNegative={false}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                props.onChange(e.target.value);
                if (Number(value)) {
                  const hoursPerWeek = value;
                  const hourlyRate = getValues(`${groupName}.hourlyRate`);
                  if (hourlyRate) {
                    setFieldValue(
                      `${groupName}.salary`,
                      hourlyRate * hoursPerWeek * 52
                    );
                    setWeeklyPay(hourlyRate * hoursPerWeek);
                    setMonthlyPay((hourlyRate * hoursPerWeek * 52) / 12);
                  }
                }
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.hourlyRate`}
          render={(props) => (
            <NumberFormat
              placeholder="Hourly Rate"
              id="hourlyRate"
              label="Hourly Rate"
              labelRequired
              disabled={disabled}
              value={props.value}
              customInput={Input}
              allowNegative={false}
              errorMessage={errors.hourlyRate?.message}
              type="text"
              isNumericString
              decimalScale={2}
              endAdornment="£"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                props.onChange(value);
                if (Number(value)) {
                  const hourlyRate = value;
                  const hoursPerWeek = getValues(`${groupName}.hoursPerWeek`);

                  if (hoursPerWeek) {
                    setFieldValue(
                      `${groupName}.salary`,
                      hourlyRate * hoursPerWeek * 52
                    );
                    setWeeklyPay(hourlyRate * hoursPerWeek);
                    setMonthlyPay((hourlyRate * hoursPerWeek * 52) / 12);
                  }
                }
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.salary`}
          render={(props) => (
            <NumberFormat
              placeholder="Salary"
              id="salary"
              disabled={disabled}
              label="Salary"
              value={props.value}
              customInput={Input}
              errorMessage={errors.salary?.message}
              type="text"
              isNumericString
              decimalScale={2}
              endAdornment="£"
              allowNegative={false}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                props.onChange(value);
                if (Number(value)) {
                  const salary = value;
                  const hoursPerWeek = getValues(`${groupName}.hoursPerWeek`);

                  if (hoursPerWeek) {
                    setFieldValue(
                      `${groupName}.hourlyRate`,
                      salary / 52 / hoursPerWeek
                    );
                    setWeeklyPay(salary / 52);
                    setMonthlyPay(salary / 12);
                  }
                }
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Input
          placeholder="Next Payday"
          disabled
          label="Next Payday"
          value={moment(getNextPayday()).format("DD MMM YYYY")}
        />
      </div>
      <div className="input-wrap">
        <NumberFormat
          placeholder="Weekly Pay"
          id="weeklypay"
          label="Weekly pay"
          value={weeklyPay}
          disabled
          customInput={Input}
          type="text"
          isNumericString
          decimalScale={2}
          endAdornment="£"
        />
      </div>
      <div className="input-wrap">
        <NumberFormat
          disabled
          placeholder="Monthly Pay"
          id="montlypay"
          label="Monthly pay"
          value={monthlyPay}
          customInput={Input}
          type="text"
          isNumericString
          decimalScale={2}
          endAdornment="£"
        />
      </div>

      {withDivider && <Divider />}
    </div>
  );
};
