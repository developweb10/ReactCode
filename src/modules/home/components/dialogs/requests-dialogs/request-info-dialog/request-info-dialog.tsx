import styles from "./request-info-dialog.module.scss";
import classNames from "classnames";

import { ICalendarUserRequestWithDate } from "@models/calendar.models";
import { RequestType, RequestStatus } from "@models/requests.models";
import { UserAuthModel } from "@models/authorization.models";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { UserRoleEnum, UserModel } from "@models/users.models";
import React from "react";
import moment from "moment";
import { useMediaQuery, Button, DialogContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { RequestStatusBadge } from "@components/request-status-badge/requests-status-badge";
import { ReactComponent as HolidayIcon } from "@assets/images/aeroplane-icon.svg";
import { ReactComponent as SicknessIcon } from "@assets/images/heart-icon.svg";
import { Dialog } from "@components/dialog/dialog";
interface Props {
  open: boolean;
  authUser: UserAuthModel;
  user: UserModel;
  onClose: () => void;
  selectedRequest: ICalendarUserRequestWithDate;
}

export const RequestDetailsDialog: React.FC<Props> = ({
  open,
  onClose,
  selectedRequest,
  authUser,
  user,
}) => {
  const hasPermissionToEdit =
    (selectedRequest.userId === authUser.userId &&
      (selectedRequest.status === RequestStatus.PENDING ||
        new Date() < new Date(selectedRequest.startDate))) ||
    authUser.role === UserRoleEnum.ROLE_ADMIN;

  // CHECK IF NOT PAST && CURRENT

  const hasPermissionToDelete =
    (selectedRequest.userId === authUser.userId &&
      (selectedRequest.status === RequestStatus.PENDING ||
        new Date() < new Date(selectedRequest.startDate))) ||
    authUser.role === UserRoleEnum.ROLE_ADMIN;

  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Request Details"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Heading}>
          <div className={styles.IconWrapper}>
            {selectedRequest.type === RequestType.HOLIDAY && (
              <div className={styles.HolidayIcon}>
                <HolidayIcon />
              </div>
            )}
            {selectedRequest.type === RequestType.SICKNESS && (
              <div className={styles.SicknessIcon}>
                <SicknessIcon />
              </div>
            )}
          </div>
          <div className={styles.Title}>
            <span className={styles.TitleTextHeader}>
              {selectedRequest.type === RequestType.HOLIDAY &&
                "View Holiday Request"}
              {selectedRequest.type === RequestType.SICKNESS &&
                "View Sickness Request"}
            </span>
          
          </div>
        </div>

        <div className={styles.Body}>
          <div className={styles.MainRequestInfo}>
            <div className={styles.BlockWrapper}>
              <div className={styles.BlockLabel}>Start Date</div>
              <div className={styles.BlockValue}>
                <span className={styles.Date}>
                  {moment(selectedRequest.startDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
            <div className={styles.BlockWrapper}>
              <div className={styles.BlockLabel}>End Date</div>
              <div className={styles.BlockValue}>
                <span className={styles.Date}>
                  {moment(selectedRequest.endDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
            <div className={styles.BlockWrapper}>
              <div className={styles.BlockLabel}>Status</div>
              <div className={styles.BlockValue}>
                <RequestStatusBadge status={selectedRequest.status} />
              </div>
            </div>
          </div>
          <div className={styles.RequestNote}>
            <div className={styles.NoteLabel}>Note</div>
            <div className={styles.NoteValue}>
              {selectedRequest.notes || "-"}
            </div>
          </div>
        </div>

        {(!!hasPermissionToEdit || !!hasPermissionToDelete) && (
          <div className={styles.ButtonsWrapper}>
            {!!hasPermissionToDelete && (
              <Button
                disableElevation
                disableRipple
                className="button-tertiary"
                onClick={() => {
                  dialogManagerService.openDialog(DialogType.DELETE_REQUEST, {
                    requestId: selectedRequest.requestId,
                  });
                }}
              >
                Remove
              </Button>
            )}
            {!!hasPermissionToEdit && (
              <Button
                disableElevation
                className={classNames("button-primary", styles.EditButton)}
                color="primary"
                variant="contained"
                onClick={() => {
                  dialogManagerService.openDialog(DialogType.EDIT_REQUEST, {
                    requestInfo: {
                      startDate: selectedRequest.startDate,
                      endDate: selectedRequest.endDate,
                      notes: selectedRequest.notes,
                      id: selectedRequest.requestId,
                      type: selectedRequest.type,
                      status: selectedRequest.status,
                    },
                    user,
                  });
                }}
              >
                Edit Request
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
