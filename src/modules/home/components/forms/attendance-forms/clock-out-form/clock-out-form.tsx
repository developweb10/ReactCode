import { useState, forwardRef, useEffect, useRef, useMemo } from "react";
import styles from "./clock-out-form.module.scss";
import { ReactComponent as CalendarIcon } from "@assets/images/calendar-alt-yellow-icon.svg";
import { Button } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { SelectOption, Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";

import moment from "moment";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

import { validationSchema } from "./validation-schema";
import { TrackerLocalStorageData } from "@models/time-attendance.models";

interface Props {
  onSubmitCallback: () => void;
  onCancel: () => void;
  trackedMinutes: number;
  trackerData: TrackerLocalStorageData;
}

export const ClockOutForm = forwardRef<HTMLFormElement, Props>(
  ({ onSubmitCallback, onCancel, trackedMinutes, trackerData }, ref) => {
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
        assigmentTypeId: trackerData.assigmentTypeId,
        note: trackerData.note,
      },

      resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
      register({ name: "assigmentTypeId" });
    }, [register]);

    const onSubmit = async (formValues: any) => {
      try {
        await timeAttendanceService.timesheetClockOut(
          trackerData.assigmentTimesheetId,
          {
            actualSpentTimeMin: trackedMinutes,
            note: formValues.note,
          }
        );

        onSubmitCallback();
      } catch (error) {}
    };

    return (
      <div className={styles.Wrap}>
        <form
          id="clock-out-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.InputWrapper}>
            <Select
              defaultValue={trackerData.assigmentTypeId}
              inputProps={{
                label: "Assignment Name",
                labelRequired: true,
                errorMessage: errors.assigmentTypeId?.message,
              }}
              disabled
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
              value={moment().format("D MMM YYYY")}
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
            <div className={styles.InputWrapper}>
              <Input
                label="Start time"
                disabled
                value={moment(trackerData.startDate).format("D MMM HH:mm:ss")}
                inputClassname={styles.DateInput}
              />
            </div>
            <div className={styles.InputWrapper}>
              <Input
                label="End time"
                disabled
                value={moment().format("D MMM HH:mm:ss")}
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
              Clock Out
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
