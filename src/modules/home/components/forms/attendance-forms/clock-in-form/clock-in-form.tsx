import { useState, forwardRef, useEffect, useRef, useMemo } from "react";
import styles from "./clock-in-form.module.scss";
import { ReactComponent as CalendarIcon } from "@assets/images/calendar-alt-yellow-icon.svg";
import { Button } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { SelectOption, Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";

import moment from "moment";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { useInterval } from "@hooks/useInterval";

import { validationSchema } from "./validation-schema";
import { ClockInDto } from "@models/time-attendance.models";

interface Props {
  onSubmitCallback: (dto: ClockInDto) => void;
  onCancel: () => void;
}

const StartTimeInput = () => {
  const [time, setTime] = useState(moment());
  useInterval(() => {
    const clonedTimer = time.clone().add(1, "s");
    setTime(clonedTimer);
  }, 1000);

  return (
    <div className={styles.InputWrapper}>
      <Input
        label="Start Time"
        value={`${time.format("HH:mm:ss")}`}
        disabled
        inputClassname={styles.DateInput}
      />
    </div>
  );
};

export const ClockInForm = forwardRef<HTMLFormElement, Props>(
  ({ onSubmitCallback, onCancel }, ref) => {
    const now = useRef(moment());
    const assignmentTypes = useRef(
      timeAttendanceQuery.getCurrentAssignments("assigmentTypeId")
    );
    const initialAssignmentOptions = useMemo(() => {
      return assignmentTypes.current.map((o) => ({
        name: o.name,
        value: o.id,
      }));
    }, []);
    const [assignmentOptions] = useState<SelectOption[]>(
      initialAssignmentOptions
    );

    const { register, handleSubmit, setValue, clearErrors, errors } = useForm({
      defaultValues: {
        assigmentTypeId: "",
        note: "",
      },

      resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
      register({ name: "assigmentTypeId" });
    }, [register]);

    const onSubmit = async (formValues: any) => {
      const assignment = timeAttendanceQuery.getAssignmentByTypeId(
        formValues.assigmentTypeId
      );

      if (assignment) {
        const day = assignment.perDays.find(
          (d) => d.date === now.current.format("YYYY-MM-DD")
        );
        if (day) {
          onSubmitCallback({
            ...formValues,
            assignmentName:
              assignmentTypes.current.find(
                (a) => a.id === formValues.assigmentTypeId
              )?.name || "Assignment",
            assigmentTimesheetId: assignment.id,
            perDayDate: day.date,
            perDayId: day.id,
            startDate: new Date().toISOString(),
          });
        }
      }
    };

    return (
      <div className={styles.Wrap}>
        <form
          id="clock-in-form"
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
              label="Date"
              value={now.current.format("D MMM YYYY")}
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
          <div className={styles.InputGroup}>
            <StartTimeInput />
            <div className={styles.InputWrapper}>
              <Input
                label="End time"
                disabled
                inputClassname={styles.DateInput}
              />
            </div>
          </div>
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
              Clock In
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
