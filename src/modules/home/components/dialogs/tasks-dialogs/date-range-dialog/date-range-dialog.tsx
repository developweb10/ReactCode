import styles from "./date-range-dialog.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import React, { useState, useCallback } from "react";
import {
  useMediaQuery,
  DialogContent,
  Button,
  Typography,
} from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";
import {
  DatePicker,
  DateState,
  StateDate,
} from "@components/date-picker/date-picker";
import { Input } from "@components/input/input";
import moment from "moment";

interface ContentProps {
  currentRange: {
    from: StateDate;
    to: StateDate;
  };
  onClose: () => void;
  onApply: (newRange: { from: moment.Moment; to: moment.Moment }) => void;
}

const Content: React.FC<ContentProps> = ({
  currentRange,
  onClose,
  onApply,
}) => {
  const [previewDateState, setPreviewDateState] = useState<DateState>({
    from: currentRange.from,
    to: currentRange.to,
    enteredTo: currentRange.to,
  });

  const handlePreviewChange = useCallback(
    (newState: DateState) => setPreviewDateState(newState),
    []
  );

  const handleReset = useCallback(() => {
    setPreviewDateState({
      from: currentRange.from,
      to: currentRange.to,
      enteredTo: currentRange.to,
    });
  }, [currentRange.from, currentRange.to]);

  const handleApply = useCallback(() => {
    const from = moment(previewDateState.from).startOf("day");
    const to = previewDateState.enteredTo
      ? moment(previewDateState.enteredTo).endOf("day")
      : from;
    onApply({
      from,
      to,
    });

    onClose();
  }, [onApply, onClose, previewDateState.from, previewDateState.enteredTo]);

  return (
    <DialogContent className={styles.Wrapper}>
      <div className={styles.ContentWrapper}>
        <div className={styles.InputsWrapper}>
          <div className={styles.InputWrapper}>
            <Input
              label="From"
              value={moment(previewDateState.from).format("DD MMM YYYY")}
            />
          </div>
          <div className={styles.InputSeparator}>-</div>
          <div className={styles.InputWrapper}>
            <Input
              label="To"
              value={
                previewDateState.enteredTo
                  ? moment(previewDateState.enteredTo).format("DD MMM YYYY")
                  : "-"
              }
            />
          </div>
        </div>
        <DatePicker
          range={previewDateState}
          onChange={handlePreviewChange}
          limit={20}
        />
      </div>

      <div className={styles.Footer}>
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
            onClick={onClose}
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
    </DialogContent>
  );
};

interface DialogProps {
  open: boolean;
  currentRange: {
    from: StateDate;
    to: StateDate;
  };
  onClose: () => void;
  onApply: (newRange: { from: moment.Moment; to: moment.Moment }) => void;
}

export const TasksDateRangeDialog: React.FC<DialogProps> = ({
  open,
  currentRange,
  onApply,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Select Custom Date Range"
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
    >
      <Content
        onApply={onApply}
        currentRange={currentRange}
        onClose={onClose}
      />
    </Dialog>
  );
};
