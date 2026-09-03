import styles from "./edit-request-dialog.module.scss";
import classNames from "classnames";

import { ReactComponent as HolidayIcon } from "@assets/images/aeroplane-icon.svg";
import { ReactComponent as SicknessIcon } from "@assets/images/heart-icon.svg";
import React, { useState, useMemo, useCallback } from "react";

import moment from "moment";

import {
  useMediaQuery,
  CircularProgress,
  DialogContent,
  Button,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";
import { useRef } from "react";

import { UserAuthModel } from "@models/authorization.models";
import { UserRoleEnum, UserModel } from "@models/users.models";

import { RequestType, UpdateRequestReqDto } from "@models/requests.models";

import { EditRequestForm } from "@home/components/forms/request-forms/edit-request-form/edit-request-form";

interface Props {
  open: boolean;
  requestInfo: UpdateRequestReqDto;
  user: UserModel;
  authUser: UserAuthModel;
  onClose: () => void;
}

export const EditRequestDialog: React.FC<Props> = ({
  open,
  authUser,
  user,
  onClose,
  requestInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const formRef = useRef<HTMLFormElement>(null);

  const showStatusEdit = useMemo(
    () => authUser.role === UserRoleEnum.ROLE_ADMIN,
    [authUser.role]
  );

  const onSaveClick = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  }, []);

  const handleLoadingChange = (newLoading: boolean) => {
    setLoading(newLoading);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Edit Request"
      fullScreen={fullScreen}
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
        <div className={styles.Heading}>
          <div className={styles.IconWrapper}>
            {requestInfo.type === RequestType.HOLIDAY && (
              <div className={styles.HolidayIcon}>
                <HolidayIcon />
              </div>
            )}
            {requestInfo.type === RequestType.SICKNESS && (
              <div className={styles.SicknessIcon}>
                <SicknessIcon />
              </div>
            )}
          </div>
          <div className={styles.Title}>
            <span className={styles.TitleTextHeader}>
              {requestInfo.type === RequestType.HOLIDAY &&
                "Edit Holiday Request"}
              {requestInfo.type === RequestType.SICKNESS &&
                "Edit Sickness Request"}
            </span>
            <span className={styles.TitleTextSub}>
            Please edit needed fields within this
            </span>
            <span className={styles.TitleTextSub}>form and then save updates</span>
          </div>
        </div>
        <div className={styles.Body}>
          <div className={styles.MainSection}>
            <div className={styles.MainRequestInfo}>
              <div className={styles.UserInfo}>
                <div className={styles.BlockWrapper}>
                  <div className={styles.BlockLabel}>First Name</div>
                  <div className={styles.BlockValue}>
                    <span className={styles.Date}>{user.firstname}</span>
                  </div>
                </div>
                <div className={styles.BlockWrapper}>
                  <div className={styles.BlockLabel}>Last Name</div>
                  <div className={styles.BlockValue}>
                    <span className={styles.Date}>{user.surname}</span>
                  </div>
                </div>
              </div>
              <div className={styles.DatesWrapper}>
                <div className={styles.BlockWrapper}>
                  <div className={styles.BlockLabel}>Start Date</div>
                  <div className={styles.BlockValue}>
                    <span className={styles.Date}>
                      {moment(requestInfo.startDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>
                <div className={styles.BlockWrapper}>
                  <div className={styles.BlockLabel}>End Date</div>
                  <div className={styles.BlockValue}>
                    <span className={styles.Date}>
                      {moment(requestInfo.endDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.RequestNote}>
                <div className={styles.NoteLabel}>Note</div>
                <div className={styles.NoteValue}>
                  {requestInfo.notes || "-"}
                </div>
              </div>
            </div>
            <EditRequestForm
              requestInfo={requestInfo}
              showStatusEdit={showStatusEdit}
              loading={loading}
              onClose={onClose}
              setLoading={handleLoadingChange}
              ref={formRef}
            />
          </div>

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
              className={classNames("button-primary", styles.SaveButton)}
              color="primary"
              variant="contained"
              onClick={onSaveClick}
            >
              Save Updates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
