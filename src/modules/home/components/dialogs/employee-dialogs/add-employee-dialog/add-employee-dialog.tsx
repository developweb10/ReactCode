import styles from "./add-employee-dialog.module.scss";

import React, { useState } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

import { DialogContent } from "@material-ui/core/";
import { Dialog } from "@components/dialog/dialog";
import { Tabs } from "@components/tabs/tabs";
import { TabPanel } from "@components/tabs/tab-panel";
import { UploadEmployee } from "./upload-employees/upload-employees";
import { AddEmployeeForm } from "@home/components/forms/employee-forms/add-employee-form/add-employee-form";

interface Props {
  open: boolean;
  handleRefetch: () => void;
  onClose: () => void;
}

export const AddEmployeeDialog: React.FC<Props> = ({
  open,
  onClose,
  handleRefetch,
}) => {
  const [tab, setTab] = useState(1);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );
  const [success, setSuccess] = useState(false);
  const handleSuccessSubmit = () => {
    setSuccess(true);
    onClose();
  };
  const onExited = () => {
    if (success) {
      handleRefetch();
      setSuccess(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Add Employee"
      fullScreen={fullScreen}
      onExited={onExited}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Heading}>
          <Tabs
            value={tab}
            labels={[
              { label: "Upload CSV", value: 1 },
              { label: "Add Manually", value: 2 },
            ]}
            onChange={(event: React.ChangeEvent<{}>, newTab) => {
              setTab(newTab);
            }}
          />
        </div>
        <div className={styles.Body}>
          <TabPanel selectedValue={tab} tabValue={1}>
            <UploadEmployee
              onUpload={() => {
                onClose();
              }}
            />
          </TabPanel>
          <TabPanel selectedValue={tab} tabValue={2}>
            <AddEmployeeForm handleSuccessSubmit={handleSuccessSubmit} />
          </TabPanel>
        </div>
      </DialogContent>
    </Dialog>
  );
};
