import { useState, useCallback } from "react";

import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import styles from "./new-request-form.module.scss";
import { RequestType } from "@models/requests.models";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { DatePicker, DateState } from "@components/date-picker/date-picker";
import { TextArea } from "@components/text-area/text-area";
import { Input } from "@components/input/input";
import {
  Button,
  Popover,
  CircularProgress,
  PopoverOrigin,
  Typography,
} from "@material-ui/core";

import { calendarService } from "@store/calendar/calendar.service";

import { validationSchema } from "../validation-schema";

interface NewRequestFormProps {
  onClose: () => void;
  startDate: string;
  requestType: RequestType;
}

export const NewRequestForm: React.FC<NewRequestFormProps> = ({
  startDate,
  onClose,
  requestType,
}) => {
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [anchorProps, setAnchorProps] = useState<{
    anchorOrigin: PopoverOrigin;
    transformOrigin: PopoverOrigin;
  }>({
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "center",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
  });

  const { register, control, handleSubmit, setValue, watch, errors, setError } =
    useForm({
      defaultValues: {
        startDate: moment(`${startDate} 12:00:00`, "DD-MM-YYYY HH:mm:ss")
          .utc()
          .startOf("day")
          .toDate(),
        endDate: moment(`${startDate} 12:00:00`, "DD-MM-YYYY HH:mm:ss")
          .utc()
          .startOf("day")
          .toDate(),
        notes: "",
      },
      resolver: yupResolver(validationSchema),
    });
  const formRange = watch(["startDate", "endDate"]);

  const [previewDateState, setPreviewDateState] = useState<DateState>({
    from: formRange.startDate,
    to: formRange.endDate,
    enteredTo: formRange.endDate,
  });

  const onSubmit = async (values: any) => {
    setLoading(true);

    try {
      await calendarService.createRequest({
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        type: requestType,
        notes: !!values.notes ? values.notes : undefined,
      });
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      if (error.errors && !!error.errors.length) {
        setError("startDate", {
          type: "manual",
          message: error.errors[0].message,
        });
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFocus = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    isEndDate?: boolean
  ) => {
    setAnchorEl(event.currentTarget);
    if (isEndDate) {
      setPreviewDateState({
        ...previewDateState,
        to: undefined,
      });
    }
  };

  const handlePreviewChange = useCallback((newState: DateState) => {
    setPreviewDateState(newState);
  }, []);

  const handleReset = () => {
    setPreviewDateState({
      from: formRange.startDate,
      to: formRange.endDate,
      enteredTo: formRange.endDate,
    });
  };

  const handleApply = () => {
    const from = moment(previewDateState.from).utc().startOf("day").toDate();
    const to = previewDateState.to
      ? moment(previewDateState.to).utc().startOf("day").toDate()
      : from;
    setValue("startDate", from);
    setValue("endDate", to);
    handleClose();
  };

  return (
    <form
      className={styles.BodyForm}
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      {loading && (
        <div className="overlay-loader with-opacity">
          <CircularProgress size="6rem" variant="indeterminate" disableShrink />
        </div>
      )}
      <div className={styles.DatesWrapper}>
        <div
          className={styles.StartDate}
          onClick={(event) => {
            handleFocus(event);
            setAnchorProps({
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "center",
              },
            });
          }}
        >
          <label htmlFor="new-request-start-date" className={styles.InputLabel}>
            Start Date
          </label>
          <Controller
            control={control}
            name="startDate"
            render={(props) => (
              <div style={{ pointerEvents: "none" }}>
                <Input
                  inputClassname={styles.Input}
                  value={moment(props.value).format("DD MMM YYYY")}
                  errorMessage={errors.startDate?.message}
                />
              </div>
            )}
          />
        </div>

        <div
          className={styles.EndDate}
          onClick={(event) => {
            handleFocus(event, true);
            setAnchorProps({
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "center",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            });
          }}
        >
          <label htmlFor="new-request-end-date" className={styles.InputLabel}>
            End Date
          </label>
          <Controller
            control={control}
            name="endDate"
            render={(props) => (
              <div style={{ pointerEvents: "none" }}>
                <Input
                  inputClassname={styles.Input}
                  value={moment(props.value).format("DD MMM YYYY")}
                  errorMessage={errors.endDate?.message}
                />
              </div>
            )}
          />
        </div>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          onExited={handleReset}
          anchorOrigin={anchorProps.anchorOrigin}
          transformOrigin={anchorProps.transformOrigin}
          classes={{
            paper: styles.Paper,
          }}
        >
          <DatePicker
            disabledWeekends
            range={previewDateState}
            onChange={handlePreviewChange}
          />
          <div className={styles.PopoverFooter}>
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
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </Popover>
      </div>

      <label htmlFor="notes-textarea" className={styles.NotesInputLabel}>
        Note
      </label>
      <TextArea
        id="notes-textarea"
        placeholder="Text Here"
        rows={15}
        inputRef={register()}
        name="notes"
        errorMessage={errors.notes?.message}
      />

      <div className={styles.ButtonsWrapper}>
        <Button
          disabled={loading}
          disableElevation
          disableRipple
          className="button-tertiary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          disableElevation
          className="button-primary"
          color="primary"
          variant="contained"
          type="submit"
        >
          Create New Request
        </Button>
      </div>
    </form>
  );
};
