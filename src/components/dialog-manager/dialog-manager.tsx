import { useCallback } from "react";
import { useObservableState } from "observable-hooks";
import { dialogManagerQuery } from "@store/dialog-manager/dialog.query";
import { dialogManagerService } from "@store/dialog-manager/dialog.service";
import { DialogType } from "@store/dialog-manager/dialog.store";
import { UserAuthModel } from "@models/authorization.models";

// REQUESTS DIALOGS
import { NewRequestDialog } from "@modules/home/components/dialogs/requests-dialogs/new-request-dialog/new-request-dialog";
import { RequestDetailsDialog } from "@modules/home/components/dialogs/requests-dialogs/request-info-dialog/request-info-dialog";
import { RejectRequestDialog } from "@modules/home/components/dialogs/requests-dialogs/reject-request-dialog/reject-request-dialog";
import { DeleteRequestDialog } from "@modules/home/components/dialogs/requests-dialogs/delete-request-dialog/delete-request-dialog";
import { EditRequestDialog } from "@modules/home/components/dialogs/requests-dialogs/edit-request-dialog/edit-request-dialog";
import { NoteReasonDialog } from "@modules/home/components/dialogs/requests-dialogs/note-reason-dialog/note-reason-dialog";

// STORES DIALOGS

import { AddStoreDialog } from "@modules/home/components/dialogs/stores-dialogs/add-store-dialog/add-store-dialog";
import { EditStoreDialog } from "@modules/home/components/dialogs/stores-dialogs/edit-store-dialog/edit-store-dialog";
import { DeleteStoreDialog } from "@modules/home/components/dialogs/stores-dialogs/delete-store-dialog/delete-store-dialog";

// EMPLOYEES DIALOGS

import { AddEmployeeDialog } from "@modules/home/components/dialogs/employee-dialogs/add-employee-dialog/add-employee-dialog";
import { DeleteEmployeeDialog } from "@modules/home/components/dialogs/employee-dialogs/delete-employee-dialog/delete-employee-dialog";

// CASES DIALOGS

import { AddCaseDialog } from "@modules/home/components/dialogs/cases-dialogs/add-case-dialog/add-case-dialog";
import { ViewCaseDialog } from "@modules/home/components/dialogs/cases-dialogs/view-case-dialog/view-case-dialog";
import { DeleteCaseDialog } from "@modules/home/components/dialogs/cases-dialogs/delete-case-dialog/delete-case-dialog";

// TASKS DIALOGS

import { TasksDateRangeDialog } from "@modules/home/components/dialogs/tasks-dialogs/date-range-dialog/date-range-dialog";
import { AddTaskDialog } from "@modules/home/components/dialogs/tasks-dialogs/add-task-dialog/add-task-dialog";
import { DeleteTaskDialog } from "@modules/home/components/dialogs/tasks-dialogs/delete-task-dialog/delete-task-dialog";
import { ViewTaskDialog } from "@modules/home/components/dialogs/tasks-dialogs/view-task-dialog/view-task-dialog";

// TIME & ATTENDENCE DIALOGS

import { AddAssignmentDialog } from "@modules/home/components/dialogs/attendance-dialogs/add-assignment-dialog/add-assignment-dialog";
import { EditAssignmentDialog } from "@modules/home/components/dialogs/attendance-dialogs/edit-assignment-dialog/edit-assignment-dialog";
import { DeleteAssignmentDialog } from "@modules/home/components/dialogs/attendance-dialogs/delete-assignment-dialog/delete-assignment-dialog";
import { TrackerClockInDialog } from "@modules/home/components/dialogs/attendance-dialogs/tracker-clockin-dialog/tracker-clockin-dialog";
import { TrackerClockOutDialog } from "@modules/home/components/dialogs/attendance-dialogs/tracker-clockout-dialog/tracker-clockout-dialog";
import { StatusChangeTimesheetDialog } from "@modules/home/components/dialogs/attendance-dialogs/status-change-timesheet-dialog/status-change-timesheet-dialog";
import { TrackerClockoutWarningDialog } from "@modules/home/components/dialogs/attendance-dialogs/tracker-clockout-warning-dialog/tracker-clockout-warning-dialog";

interface DialogManagerProps {
  currentUser: UserAuthModel;
}
export const DialogManager: React.FC<DialogManagerProps> = ({
  currentUser,
}) => {
  const dialogs = useObservableState(dialogManagerQuery.dialogs$, []);

  const handleDialogClose = useCallback((dialogType: DialogType) => {
    dialogManagerService.closeDialog(dialogType);
  }, []);

  const mapModalTypeToComponent = useCallback(
    ({ dialogProps, dialogType, dialogOpen }) => {
      let modalComponent = null;
      let sharedProps = {
        open: dialogOpen,
        onClose: () => handleDialogClose(dialogType),
        authUser: currentUser,
        key: dialogType,
      };
      switch (dialogType) {
        case DialogType.CREATE_REQUEST:
          modalComponent = (
            <NewRequestDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.VIEW_REQUEST:
          modalComponent = (
            <RequestDetailsDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.DELETE_REQUEST:
          modalComponent = (
            <DeleteRequestDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.EDIT_REQUEST:
          modalComponent = (
            <EditRequestDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.REJECT_REQUEST:
          modalComponent = (
            <RejectRequestDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.VIEW_NOTE_OR_REASON:
          modalComponent = (
            <NoteReasonDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.CREATE_STORE:
          modalComponent = <AddStoreDialog {...sharedProps} {...dialogProps} />;
          break;
        case DialogType.EDIT_STORE:
          modalComponent = (
            <EditStoreDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.DELETE_STORE:
          modalComponent = (
            <DeleteStoreDialog {...sharedProps} {...dialogProps} />
          );
          break;

        case DialogType.ADD_EMPLOYEE:
          modalComponent = (
            <AddEmployeeDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.DELETE_EMPLOYEE:
          modalComponent = (
            <DeleteEmployeeDialog {...sharedProps} {...dialogProps} />
          );
          break;

        case DialogType.ADD_CASE:
          modalComponent = <AddCaseDialog {...sharedProps} {...dialogProps} />;
          break;
        case DialogType.VIEW_CASE:
          modalComponent = <ViewCaseDialog {...sharedProps} {...dialogProps} />;
          break;
        case DialogType.DELETE_CASE:
          modalComponent = (
            <DeleteCaseDialog {...sharedProps} {...dialogProps} />
          );
          break;

        case DialogType.TASKS_DATE_RANGE:
          modalComponent = (
            <TasksDateRangeDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.ADD_TASK:
          modalComponent = <AddTaskDialog {...sharedProps} {...dialogProps} />;
          break;
        case DialogType.VIEW_TASK:
          modalComponent = <ViewTaskDialog {...sharedProps} {...dialogProps} />;
          break;
        case DialogType.DELETE_TASK:
          modalComponent = (
            <DeleteTaskDialog {...sharedProps} {...dialogProps} />
          );
          break;

        case DialogType.ADD_ASSIGNMENT:
          modalComponent = (
            <AddAssignmentDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.EDIT_ASSIGNMENT:
          modalComponent = (
            <EditAssignmentDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.DELETE_ASSIGNMENT:
          modalComponent = (
            <DeleteAssignmentDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.TRACKER_CLOCK_IN:
          modalComponent = (
            <TrackerClockInDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.TRACKER_CLOCK_OUT:
          modalComponent = (
            <TrackerClockOutDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.TRACKER_CLOCK_OUT_WARNING:
          modalComponent = (
            <TrackerClockoutWarningDialog {...sharedProps} {...dialogProps} />
          );
          break;
        case DialogType.STATUS_CHANGE_TIMESHEET:
          modalComponent = (
            <StatusChangeTimesheetDialog {...sharedProps} {...dialogProps} />
          );
          break;
        default:
          break;
      }
      return modalComponent;
    },
    [currentUser, handleDialogClose]
  );

  return <>{dialogs.map((dialog) => mapModalTypeToComponent(dialog))}</>;
};
