import styles from "./assignment-footer.module.scss";
import { useMemo } from "react";
import { Badge } from "@components/badge/badge";
import { Button, Typography } from "@material-ui/core";

import { TimesheetStatus } from "@models/time-attendance.models";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

import {
  DialogType,
  dialogManagerService,
} from "@store/dialog-manager/dialog.service";

interface Props {
  status: TimesheetStatus;
  assignmentsExist: boolean;
  trackerStarted: boolean;
  adminMode?: boolean;
}

export const AssignmentFooter: React.FC<Props> = ({
  trackerStarted,
  status,
  assignmentsExist,
  adminMode,
}) => {
  const handlePeriodSubmit = async () => {
    dialogManagerService.openDialog(DialogType.STATUS_CHANGE_TIMESHEET, {
      title: "Submit",
      onSubmit: async () => {
        await timeAttendanceService.updateTimesheetStatus(
          TimesheetStatus.PENDING
        );
      },
    });
  };

  const handlePeriodApprove = async () => {
    dialogManagerService.openDialog(DialogType.STATUS_CHANGE_TIMESHEET, {
      title: "Approve",
      onSubmit: async () => {
        await timeAttendanceService.updateTimesheetStatus(
          TimesheetStatus.APPROVED
        );
      },
    });
  };

  const handlePeriodReject = async () => {
    dialogManagerService.openDialog(DialogType.STATUS_CHANGE_TIMESHEET, {
      title: "Reject",
      onSubmit: async () => {
        await timeAttendanceService.updateTimesheetStatus(
          TimesheetStatus.REJECTED
        );
      },
    });
  };

  const renderStatus = useMemo(() => {
    let badge = null;

    switch (status) {
      case TimesheetStatus.PENDING:
        badge = (
          <div className={styles.StatusWrapper}>
            <Typography>Status:</Typography>
            <Badge className={styles.Badge} title="Pending" variant="info" />
          </div>
        );
        break;
      case TimesheetStatus.APPROVED:
        badge = (
          <div className={styles.StatusWrapper}>
            <Typography>Status:</Typography>
            <Badge
              className={styles.Badge}
              title="Approved"
              variant="success"
            />
          </div>
        );
        break;
      case TimesheetStatus.REJECTED:
        badge = (
          <div className={styles.StatusWrapper}>
            <Typography>Status:</Typography>
            <Badge className={styles.Badge} title="Rejected" variant="error" />
          </div>
        );
        break;
      default:
        break;
    }
    return badge;
  }, [status]);

  const submitButton = useMemo(() => {
    if (!assignmentsExist) {
      return null;
    }

    if (status && status !== TimesheetStatus.CREATED) {
      return null;
    }

    return (
      <Button
        disableElevation
        className="button-primary"
        color="primary"
        variant="contained"
        style={{
          padding: "3px 14px",
          marginLeft: "auto",
        }}
        disabled={trackerStarted}
        onClick={handlePeriodSubmit}
      >
        Submit
      </Button>
    );
  }, [assignmentsExist, status, trackerStarted]);

  const approveRejectButtons = useMemo(() => {
    if (!adminMode || status === TimesheetStatus.CREATED) {
      return null;
    }

    const approveButton = (
      <Button
        key="approve-btn"
        disableElevation
        className="button-primary"
        color="primary"
        variant="contained"
        style={{
          padding: "3px 14px",
          marginLeft: "auto",
        }}
        onClick={handlePeriodApprove}
      >
        Approve
      </Button>
    );

    const rejectButton = (
      <Button
        key="reject-btn"
        disableElevation
        className="button-primary"
        color="secondary"
        variant="contained"
        style={{
          padding: "3px 14px",
          marginLeft: "5px",
        }}
        onClick={handlePeriodReject}
      >
        Reject
      </Button>
    );
    return (
      <div className={styles.AdminControlsGroup}>
        {status === TimesheetStatus.PENDING && [approveButton, rejectButton]}
        {status === TimesheetStatus.APPROVED && rejectButton}
        {status === TimesheetStatus.REJECTED && approveButton}
      </div>
    );
  }, [adminMode, status]);

  return (
    <div className={styles.Wrapper}>
      {renderStatus}
      {submitButton}
      {approveRejectButtons}
    </div>
  );
};
