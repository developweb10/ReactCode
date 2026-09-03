import styles from "./calendar-requests-row.module.scss";
import classNames from "classnames";
import { useMemo, memo } from "react";

import { ReactComponent as HolidayIcon } from "@assets/images/aeroplane-icon.svg";
import { ReactComponent as SicknessIcon } from "@assets/images/heart-icon.svg";
import { UserModel } from "@models/users.models";

import {
  ICalendarUserRequestWithDate,
  ISelectedDate,
} from "@models/calendar.models";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import { RequestType, RequestStatus } from "@models/requests.models";

import { ButtonBase } from "@material-ui/core";
import moment from "moment";
interface RequestCellProps {
  requestInfo: ICalendarUserRequestWithDate;
  selectedDate: ISelectedDate;
  user: UserModel;
}

export const RequestCell: React.FC<RequestCellProps> = memo(
  ({ requestInfo, selectedDate, user }) => {
    let cell = null;

    const afterToday = useMemo(() => {
      return moment(requestInfo.requestFullDate, "DD-MM-YYYY").isAfter(
        moment(),
        "days"
      );
    }, [requestInfo.requestFullDate]);

    const onRequestCellClick = (requestInfo: ICalendarUserRequestWithDate) => {
      dialogManagerService.openDialog(DialogType.VIEW_REQUEST, {
        selectedRequest: requestInfo,
        user,
      });
    };
    if (requestInfo.status === RequestStatus.APPROVED) {
      switch (requestInfo.type) {
        case RequestType.HOLIDAY:
          cell = (
            <ButtonBase
              className={styles.HolidayCell}
              disableRipple
              onClick={() => onRequestCellClick(requestInfo)}
            >
              {afterToday ? (
                <div
                  className={classNames(
                    styles.AfterTodayCircle,
                    styles.Holiday
                  )}
                ></div>
              ) : (
                <div className={styles.HolidayIconWrapper}>
                  <HolidayIcon className={styles.HolidayIcon} />
                </div>
              )}
            </ButtonBase>
          );
          break;
        case RequestType.SICKNESS:
          cell = (
            <ButtonBase
              className={styles.SicknessCell}
              disableRipple
              onClick={() => onRequestCellClick(requestInfo)}
            >
              {afterToday ? (
                <div
                  className={classNames(
                    styles.AfterTodayCircle,
                    styles.Sickness
                  )}
                ></div>
              ) : (
                <div className={styles.SicknessIconWrapper}>
                  <SicknessIcon className={styles.SicknessIcon} />
                </div>
              )}
            </ButtonBase>
          );
          break;
        default:
          break;
      }
    }
    if (requestInfo.status === RequestStatus.PENDING) {
      switch (requestInfo.type) {
        case RequestType.HOLIDAY:
          cell = (
            <ButtonBase
              className={styles.PendingCell}
              disableRipple
              onClick={() => onRequestCellClick(requestInfo)}
            >
              <div className={styles.HolidayIconWrapper}>
                <HolidayIcon className={styles.HolidayIcon} />
              </div>
            </ButtonBase>
          );
          break;
        case RequestType.SICKNESS:
          cell = (
            <ButtonBase
              className={styles.PendingCell}
              disableRipple
              onClick={() => onRequestCellClick(requestInfo)}
            >
              <div className={styles.SicknessIconWrapper}>
                <SicknessIcon
                  className={classNames(
                    styles.SicknessIcon,
                    styles.SicknessPathGray
                  )}
                />
              </div>
            </ButtonBase>
          );
          break;
        default:
          break;
      }
    }

    return <>{cell}</>;
  }
);
