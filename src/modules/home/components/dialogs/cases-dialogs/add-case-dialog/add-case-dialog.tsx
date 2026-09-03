import styles from "./add-case-dialog.module.scss";
import { ReactComponent as FileIcon } from "@assets/images/paper-file-yellow-icon.svg";
import React, { useRef, useCallback } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { DialogActions, DialogContent, Button } from "@material-ui/core";

import { UserAuthModel } from "@models/authorization.models";
import { CaseStringType } from "@models/cases.models";

import { Dialog } from "@components/dialog/dialog";

import { AddInvestigationCaseForm } from "@home/components/forms/cases-forms/investigation-case/add-investigation-case-form/add-investigation-case-form";
import { AddLTSCaseForm } from "@home/components/forms/cases-forms/lts-case/add-lts-case-form/add-lts-case-form";
import { AddDisciplinaryCaseForm } from "@home/components/forms/cases-forms/disciplinary-case/add-disciplinary-case-form/add-disciplinary-case-form";
import { AddGrievanceCaseForm } from "@home/components/forms/cases-forms/grievance-case/add-grievance-case-form/add-grievance-case-form";
import { AddAppealCaseForm } from "@home/components/forms/cases-forms/appeal-case/add-appeal-case-form/add-appeal-case-form";
import { AddPerformanceCaseForm } from "@home/components/forms/cases-forms/performance-case/add-performance-case-form/add-performance-case-form";

interface Props {
  open: boolean;
  caseType: CaseStringType;
  authUser: UserAuthModel;
  onClose: () => void;
  handleRefetch: () => void;
}

export const AddCaseDialog: React.FC<Props> = ({
  open,
  caseType,
  authUser,
  onClose,
  handleRefetch,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmit = async () => {
    onClose();
    handleRefetch();
  };

  const formRef = useRef<HTMLFormElement>(null);

  const onCreateClick = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  }, []);

  let caseForm = null;

  const props = {
    onCreate: onSubmit,
    ref: formRef,
    authUser,
  };
  switch (caseType) {
    case CaseStringType.Investigation:
      caseForm = <AddInvestigationCaseForm {...props} />;
      break;
    case CaseStringType.Disciplinary:
      caseForm = <AddDisciplinaryCaseForm {...props} />;
      break;
    case CaseStringType.LTS:
      caseForm = <AddLTSCaseForm {...props} />;
      break;
    case CaseStringType.Grievance:
      caseForm = <AddGrievanceCaseForm {...props} />;
      break;
    case CaseStringType.Appeal:
      caseForm = <AddAppealCaseForm {...props} />;
      break;
    case CaseStringType.Performance:
      caseForm = <AddPerformanceCaseForm {...props} />;
      break;
    default:
      break;
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Create New Case:"
      headerEntity={caseType}
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
              <span className={styles.TitleTextHeader}>Create New Case</span>
              <span className={styles.TitleTextSub}>
                Please complete all fields within this
              </span>
              <span className={styles.TitleTextSub}>form and then submit</span>
            </div>
          </div>
        </div>
        {caseForm}
      </DialogContent>
      <DialogActions className={styles.Actions}>
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
            className="button-primary"
            color="primary"
            variant="contained"
            onClick={onCreateClick}
          >
            Create Case
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
