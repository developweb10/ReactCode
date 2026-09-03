import styles from "./edit-request-form.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import React, { useState, forwardRef, useCallback } from "react";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

import { Popover, PopoverOrigin, Button, Typography } from "@material-ui/core";

import { DatePicker, DateState } from "@components/date-picker/date-picker";
import { Select } from "@components/select/select";
import { TextArea } from "@components/text-area/text-area";
import { Input } from "@components/input/input";

import { RequestStatus, UpdateRequestReqDto } from "@models/requests.models";

import { requestsService } from "@store/requests/requests.service";
import { validationSchema } from "../validation-schema";

interface Props {
  requestInfo: UpdateRequestReqDto;
  showStatusEdit: boolean;
  loading: boolean;
  onClose: () => void;
  setLoading: (newLoading: boolean) => void;
}

export const EditRequestForm = forwardRef<HTMLFormElement, Props>(
  ({ requestInfo, showStatusEdit, loading, onClose, setLoading }, ref) => {
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

    const {
      register,
      control,
      handleSubmit,
      setValue,
      errors,
      setError,
      watch,
    } = useForm({
      defaultValues: {
        startDate: moment(requestInfo.startDate).toDate(),
        endDate: moment(requestInfo.endDate).toDate(),
        notes: requestInfo.notes || "",
        status: requestInfo.status,
      },
      resolver: yupResolver(validationSchema),
    });

    const formRange = watch(["startDate", "endDate"]);

    const [previewDateState, setPreviewDateState] = useState<DateState>({
      from: formRange.startDate,
      to: formRange.endDate,
      enteredTo: formRange.endDate,
    });

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

    const handlePreviewChange = useCallback(
      (newState: DateState) => setPreviewDateState(newState),
      []
    );

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

    const onSubmit = async (values: any) => {
      setLoading(true);
      try {
        await requestsService.editRequest(
          {
            ...requestInfo,
            ...values,
            status: showStatusEdit ? values.status : undefined,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
          },
          requestInfo.id
        );
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

    return (
      <form
        ref={ref}
        className={styles.BodyForm}
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        {showStatusEdit && requestInfo.status !== RequestStatus.PENDING && (
          <div className={styles.StatusSelectWrap}>
            <Controller
              control={control}
              name="status"
              render={(props) => (
                <Select
                  inputProps={{
                    label: "Edit Status",
                  }}
                  value={props.value}
                  options={[
                    { name: "Approved", value: RequestStatus.APPROVED },
                    { name: "Rejected", value: RequestStatus.REJECTED },
                  ]}
                  onChange={(
                    event: React.ChangeEvent<{
                      name?: string | undefined;
                      value: unknown;
                    }>
                  ) => {
                    props.onChange(event.target.value);
                  }}
                />
              )}
            />
          </div>
        )}

        <div className={styles.FormDates}>
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
                  <Typography className={styles.ResetText}>
                    Reset All
                  </Typography>
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
        <div className={styles.NoteArea}>
          <TextArea
            disabled={loading}
            label="Note"
            id="notes-textarea"
            placeholder="Text Here"
            rows={15}
            inputRef={register()}
            name="notes"
            errorMessage={errors.notes?.message}
          />
        </div>
      </form>
    );
  }
);
