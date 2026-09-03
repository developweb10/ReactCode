import styles from "./delete-case-dialog.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-yellow-icon.svg";
import React, { useState } from "react";
import { CaseTableModel, CaseStatus } from "@models/cases.models";
import { casesService } from "@store/cases/cases.service";
import { Badge } from "@components/badge/badge";
import { Typography } from "@material-ui/core";

import {
  useMediaQuery,
  Button,
  CircularProgress,
  DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

interface Props {
  open: boolean;
  caseType: string;
  caseData: CaseTableModel;
  onClose: () => void;
  handleRefetch: () => void;
}

export const DeleteCaseDialog: React.FC<Props> = ({
  open,
  onClose,
  caseType,
  caseData,
  handleRefetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  const handleCaseDelete = async () => {
    setLoading(true);
    try {
      await casesService.removeCase(caseData.id);
      setSuccess(true);
    } catch (error) {}

    setLoading(false);
  };

  const onExited = () => {
    if (success && handleRefetch) {
      handleRefetch();
    }
    setSuccess(false);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      fullWidth
      headerTitle="Remove Case"
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
    >
      {success ? (
        <DialogContent className={styles.SuccessWrapper}>
          <div className={styles.IconWrapper}>
            <div className={styles.Icon}>
              <DeleteIcon />
            </div>
          </div>
          <div className={styles.Title}>
            <span className={styles.TitleText}>Case successfully</span>
            <strong className={styles.TitleText}>removed</strong>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className={styles.Wrapper}>
          {loading && (
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
              <div className={styles.Icon}>
                <DeleteIcon />
              </div>
            </div>
            <div className={styles.Title}>
              <span className={styles.TitleText}>Are you sure you want to</span>
              <strong className={styles.TitleText}>remove Case?</strong>
            </div>
          </div>
          <div className={styles.CaseCard}>
            <div className={styles.CaseStatus}>
              <Badge
                className={styles.Badge}
                title={caseData.status === CaseStatus.OPEN ? "Open" : "Closed"}
                variant={
                  caseData.status === CaseStatus.OPEN ? "success" : "error"
                }
              />
            </div>
            <div className={styles.CaseEmployee}>
              <Typography variant="h5">{`${caseData.employee.firstname} ${caseData.employee.surname}`}</Typography>
            </div>

            <Typography className={styles.CaseType}>{caseType}</Typography>
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
              className={classNames("button-primary", styles.RemoveButton)}
              color="primary"
              variant="contained"
              onClick={handleCaseDelete}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
