import {
  useState,
  forwardRef,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styles from "./edit-assignment-form.module.scss";
import classNames from "classnames";

import { CircularProgress, Button, Typography } from "@material-ui/core/";
import { useForm, useFieldArray, Controller, Control } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { SelectOption } from "@components/select/select";

import moment, { Moment } from "moment";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";
import {
  AssigmentPerDayModel,
  AssignmentTimesheetWithNameModel,
} from "@models/time-attendance.models";

import { validationSchema } from "./validation-schema";
import { ReactComponent as CalendarIcon } from "@assets/images/calendar-alt-yellow-icon.svg";

import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";

import {
  formatCountTimeInput,
  formatMinutes,
} from "@utils/date/time-attendance/utils";

const RangeArrayInputs = ({
  control,
  register,
  setValue,
  viewMode,
  adminView,
}: {
  control: Control;
  register: any;
  setValue: any;
  viewMode?: boolean;
  adminView: boolean;
}) => {
  const { fields } = useFieldArray<AssigmentPerDayModel>({
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
          let nextIndex = index === 21 ? index + 2 : index + 3;

          if (adminView) {
            nextIndex = index % 3 === 0 || index === 22 ? index + 1 : index + 2;
          }
          const nextInput = form.elements[nextIndex] as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
          event.preventDefault();
        }
      }
    },
    [adminView]
  );
  return (
    <div className={styles.InputWrapper}>
      {fields.map((field, index) => {
        const date = moment(field.date, "YYYY-MM-DD");
        return (
          <div className={styles.PerDayFieldWrapper} key={field.id}>
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
            <div className={styles.PerDayInputGroup}>
              <div className={styles.PerDayInputWrapper}>
                <Controller
                  control={control}
                  name={`perDays.${index}.expectedSpentTimeMin`}
                  defaultValue={field.expectedSpentTimeMin}
                  render={(props) => {
                    return (
                      <Input
                        defaultValue={formatMinutes(
                          field.expectedSpentTimeMin || 0
                        )}
                        disabled={viewMode}
                        onKeyDown={onKeyDown}
                        placeholder="0h"
                        label="Scheduled Time"
                        onBlur={(e) => {
                          const value = e.target.value;

                          const { formattedValue, totalMinutes } =
                            formatCountTimeInput(value);

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
              <div className={styles.PerDayInputWrapper}>
                <Controller
                  control={control}
                  name={`perDays.${index}.actualSpentTimeMin`}
                  defaultValue={field.actualSpentTimeMin}
                  render={(props) => {
                    return (
                      <Input
                        disabled={viewMode || !adminView}
                        defaultValue={formatMinutes(
                          field.actualSpentTimeMin || 0
                        )}
                        label="Actual Time"
                        placeholder="0h"
                        onKeyDown={onKeyDown}
                        onBlur={(e) => {
                          const value = e.target.value;

                          const { formattedValue, totalMinutes } =
                            formatCountTimeInput(value);

                          setValue(
                            `perDays.${index}.actualSpentTimeMin`,
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
          </div>
        );
      })}
    </div>
  );
};

interface Props {
  assignment: AssignmentTimesheetWithNameModel;
  weekRange: {
    from: Moment;
    to: Moment;
  };
  viewMode?: boolean;
  adminView: boolean;
  onUpdated: () => void;
  onCancel: () => void;
}

export const EditAssignmentForm = forwardRef<HTMLFormElement, Props>(
  (
    { weekRange, assignment, viewMode, adminView, onUpdated, onCancel },
    ref
  ) => {
    const assignmentTypes = useRef(
      timeAttendanceQuery.getEditRowAssignmentTypes(assignment.assigmentTypeId)
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
        const assignmentPerDay = assignment.perDays[i] || {};
        perDays.push({
          date:
            assignmentPerDay.date ||
            date.utcOffset(0, true).format("YYYY-MM-DD"),
          expectedSpentTimeMin: assignmentPerDay.expectedSpentTimeMin || 0,
          actualSpentTimeMin: assignmentPerDay.actualSpentTimeMin || 0,
        });
      }
      return perDays;
    }, [assignment.perDays, weekRange.from, weekRange.to]);

    const { register, control, handleSubmit, setValue, clearErrors, errors } =
      useForm({
        defaultValues: {
          assigmentTypeId: assignment.assigmentTypeId,
          note: assignment.note || "",
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
      };
      setLoading(true);

      try {
        await timeAttendanceService.editAssignmentRow(dto, assignment.id);
        setLoading(false);
        onUpdated();
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
          id="edit-assignment-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.InputWrapper}>
            <Select
              disabled={viewMode}
              defaultValue={assignment.assigmentTypeId}
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
            viewMode={viewMode}
            adminView={adminView}
          />
          <div className={styles.InputWrapper}>
            <TextArea
              disabled={viewMode}
              label="Note"
              rows={13}
              placeholder="Text Here"
              name="note"
              inputRef={register()}
              errorMessage={errors.note?.message}
            />
          </div>
          {!viewMode && (
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
                Save Updates
              </Button>
            </div>
          )}
        </form>
      </div>
    );
  }
);
