import React, { useState, useCallback } from "react";
import styles from "./reject-request-dialog.module.scss";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-yellow-icon.svg";
import classNames from "classnames";
import moment from "moment";
import { Dialog } from "@components/dialog/dialog";
import { TextArea } from "@components/text-area/text-area";
import { RequestStatusBadge } from "@components/request-status-badge/requests-status-badge";

import {
  RequestType,
  RequestModel,
  RequestStatus,
} from "@models/requests.models";
import { requestsService } from "@store/requests/requests.service";
import {
  useMediaQuery,
  Button,
  CircularProgress,
  DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

interface Props {
  open: boolean;
  requestInfo: RequestModel;
  onClose: () => void;
}

export const RejectRequestDialog: React.FC<Props> = ({
  open,
  requestInfo,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const onExited = useCallback(() => {
    setReason("");
  }, []);

  const handleReject = async () => {
    setLoading(true);
    await requestsService.updateRequestStatus(requestInfo.id, {
      status: RequestStatus.REJECTED,
      rejectedReason: reason || undefined,
    });
    setLoading(false);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Reject Request"
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
      onExited={onExited}
    >
      <DialogContent className={styles.Wrapper}>
        {!!loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}

        <div className={styles.HeadingWrapper}>
          <div className={styles.IconWrapper}>
            <div className={styles.Icon}>
              <DeleteIcon />
            </div>
          </div>
          <span className={styles.TitleText}>
            Are you sure <strong>you want to reject?</strong>
          </span>

          {requestInfo && (
            <div className={styles.Card}>
              <div className={styles.CardHeader}>
                <div className={styles.TypeWrapper}>
                  {requestInfo.requestType === RequestType.HOLIDAY && "Holiday"}
                  {requestInfo.requestType === RequestType.SICKNESS &&
                    "Sickness"}
                </div>
                <div className={styles.BadgeWrapper}>
                  <RequestStatusBadge status={requestInfo.status} />
                </div>
              </div>
              <div className={styles.CardBody}>
                <span className={styles.UserName}>
                  {`${requestInfo.user.firstname} ${requestInfo.user.surname}`}
                </span>
                <span className={styles.RequestPeriod}>
                  {`${moment(requestInfo.startDate).format("DD.MM")}-${moment(
                    requestInfo.endDate
                  ).format("DD.MM.YY")}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <label htmlFor="reason-textarea" className={styles.ReasonLabel}>
          Add Reason
        </label>
        <TextArea
          rows={13}
          placeholder="Text Here"
          id="reason-textarea"
          value={reason}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setReason(event.target.value);
          }}
        />
        <div className={styles.ButtonsWrapper}>
          <Button
            disableElevation
            disableRipple
            className="button-tertiary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disableElevation
            className={classNames("button-primary", styles.RejectButton)}
            color="primary"
            variant="contained"
            type="submit"
            onClick={handleReject}
          >
            Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
