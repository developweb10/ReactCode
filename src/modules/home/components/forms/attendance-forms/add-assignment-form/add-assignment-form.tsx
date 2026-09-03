import {
  useState,
  forwardRef,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styles from "./add-assignment-form.module.scss";
import classNames from "classnames";

import { CircularProgress, Button, Typography } from "@material-ui/core/";
import { useForm, useFieldArray, Controller, Control } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { SelectOption } from "@components/select/select";

import moment, { Moment } from "moment";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

import { validationSchema } from "./validation-schema";
import { ReactComponent as CalendarIcon } from "@assets/images/calendar-alt-yellow-icon.svg";

import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";

import { AssigmentPerDayDto } from "@models/time-attendance.models";

import { formatCountTimeInput } from "@utils/date/time-attendance/utils";

const RangeArrayInputs = ({
  control,
  register,
  setValue,
}: {
  control: Control;
  register: any;
  setValue: any;
}) => {
  const { fields } = useFieldArray<AssigmentPerDayDto>({
    control,
    name: "perDays",
  });

  const today = useRef(moment());

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === "Enter") {
        const target = event.target as HTMLInputElement;
        const form = target.form;
        if (form) {
          const index = Array.prototype.indexOf.call(form, event.target);
          const nextIndex = index === 15 ? index + 1 : index + 2;
          const nextInput = form.elements[nextIndex] as HTMLInputElement;

          if (nextInput) {
            nextInput.focus();
          }
          event.preventDefault();
        }
      }
    },
    []
  );
  return (
    <div className={styles.InputWrapper}>
      {fields.map((field, index) => {
        const date = moment(field.date, "YYYY-MM-DD");

        return (
          <div className={styles.EstimationFieldWrapper} key={field.id}>
            <Typography
              className={classNames(styles.DayText, {
                [styles.Today]: date.isSame(today.current, "day"),
              })}
            >
              {date.format("ddd D")}
            </Typography>
            <input
              style={{ display: "none" }}
              name={`perDays.${index}.date`}
              ref={register()}
              defaultValue={field.date}
            />
            <div className={styles.EstimationInputWrapper}>
              <Controller
                key={field.id}
                control={control}
                name={`perDays.${index}.expectedSpentTimeMin`}
                defaultValue={field.expectedSpentTimeMin}
                render={(props) => {
                  return (
                    <Input
                      defaultValue=""
                      placeholder="0h"
                      label="Scheduled Time"
                      onKeyDown={onKeyDown}
                      onBlur={(e) => {
                        const value = e.target.value;

                        const {
                          formattedValue,
                          totalMinutes,
                        } = formatCountTimeInput(value);

                        setValue(
                          `perDays.${index}.expectedSpentTimeMin`,
                          totalMinutes
                        );

                        e.target.value = formattedValue;
                      }}
                    />
                  );
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface Props {
  weekRange: {
    from: Moment;
    to: Moment;
  };
  userId?: number;
  onAdded: () => void;
  onCancel: () => void;
}

export const AddAssignmentForm = forwardRef<HTMLFormElement, Props>(
  ({ weekRange, userId, onAdded, onCancel }, ref) => {
    const assignmentTypes = useRef(
      timeAttendanceQuery.getAddRowAssignmentTypes()
    );
    const initialAssignmentOptions = useMemo(() => {
      return assignmentTypes.current.map((o) => ({
        name: o.name,
        value: o.id,
      }));
    }, []);
    const [loading, setLoading] = useState(false);
    const [assignmentOptions] = useState<SelectOption[]>(
      initialAssignmentOptions
    );

    const initialPerDays = useMemo(() => {
      let perDays = [];

      const diff = weekRange.to.diff(weekRange.from, "days");

      for (let i = 0; i <= diff; i++) {
        let date = moment(weekRange.from).add(i, "days");
        perDays.push({
          date: date.utcOffset(0, true).format("YYYY-MM-DD"),
          expectedSpentTimeMin: 0,
        });
      }
      return perDays;
    }, [weekRange.from, weekRange.to]);

    const {
      register,
      control,
      handleSubmit,
      setValue,
      clearErrors,
      errors,
    } = useForm({
      defaultValues: {
        assigmentTypeId: "",
        note: "",
        perDays: initialPerDays,
      },

      resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
      register({ name: "assigmentTypeId" });
    }, [register]);

    const onSubmit = async (formValues: any) => {
      const dto = {
        ...formValues,
        dateFrom: weekRange.from.format("YYYY-MM-DD"),
        dateTo: weekRange.to.format("YYYY-MM-DD"),
        userId,
      };

      setLoading(true);
      try {
        await timeAttendanceService.addAssignmentRow(dto);
        setLoading(false);
        onAdded();
      } catch (error) {
        setLoading(false);
      }
    };

    return (
      <div className={styles.Wrap}>
        {loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}
        <form
          id="add-assignment-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.InputWrapper}>
            <Select
              defaultValue=""
              inputProps={{
                label: "Assignment Name",
                labelRequired: true,
                errorMessage: errors.assigmentTypeId?.message,
              }}
              displayEmpty
              renderValue={(value) => {
                return (
                  assignmentTypes.current.find((type: any) => type.id === value)
                    ?.name || <div>Select Assignment Name</div>
                );
              }}
              options={assignmentOptions}
              onChange={(
                event: React.ChangeEvent<{
                  name?: string | undefined;
                  value: unknown;
                }>
              ) => {
                setValue("assigmentTypeId", event.target.value);
                clearErrors("assigmentTypeId");
              }}
            />
          </div>
          <div className={styles.InputWrapper}>
            <Input
              label="Selected Week"
              value={`${weekRange.from.format("D MMM")} - ${weekRange.to.format(
                "D MMM YYYY"
              )}`}
              disabled
              inputClassname={styles.DateInput}
              startAdornment={
                <CalendarIcon
                  style={{
                    marginBottom: 2,
                  }}
                />
              }
            />
          </div>
          <RangeArrayInputs
            control={control}
            register={register}
            setValue={setValue}
          />
          <div className={styles.InputWrapper}>
            <TextArea
              label="Note"
              rows={13}
              placeholder="Text Here"
              name="note"
              inputRef={register()}
              errorMessage={errors.note?.message}
            />
          </div>

          <div className={styles.ButtonsWrapper}>
            <Button
              disableElevation
              disableRipple
              className="button-tertiary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              disableElevation
              className="button-primary"
              color="primary"
              variant="contained"
              type="submit"
              style={{
                padding: `4px 40px`,
                marginLeft: 10,
              }}
            >
              Add Row
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
