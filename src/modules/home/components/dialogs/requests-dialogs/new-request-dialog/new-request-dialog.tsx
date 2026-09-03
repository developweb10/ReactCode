import styles from "./new-request-dialog.module.scss";
import { ReactComponent as FileIcon } from "@assets/images/paper-file-yellow-icon.svg";
import React, { useState } from "react";
import { useMediaQuery, DialogContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { RequestType } from "@models/requests.models";

import { NewRequestForm } from "@home/components/forms/request-forms/new-request-form/new-request-form";

import { Dialog } from "@components/dialog/dialog";
import { Tabs } from "@components/tabs/tabs";

interface Props {
  open: boolean;
  startDate: string;
  onClose: () => void;
}

export const NewRequestDialog: React.FC<Props> = ({
  open,
  onClose,
  startDate,
}) => {
  const [tab, setTab] = useState(RequestType.HOLIDAY);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Create New Request"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Heading}>
          <div className={styles.TitleWrapper}>
            <div className={styles.IconWrapper}>
              <div className={styles.Icon}>
                <FileIcon />
              </div>
            </div>
            <div className={styles.Title}>
              <span className={styles.TitleTextHeader}>Create New Request</span>
              <span className={styles.TitleTextSub}>
                Please complete all fields within this
              </span>
              <span className={styles.TitleTextSub}>form and then submit</span>
            </div>
          </div>
          <Tabs
            value={tab}
            labels={[
              { label: "Holiday", value: RequestType.HOLIDAY },
              { label: "Sickness", value: RequestType.SICKNESS },
            ]}
            onChange={(event: React.ChangeEvent<{}>, newTab) => {
              setTab(newTab);
            }}
          />
        </div>
        <NewRequestForm
          startDate={startDate}
          onClose={onClose}
          requestType={tab}
        />
      </DialogContent>
    </Dialog>
  );
};
