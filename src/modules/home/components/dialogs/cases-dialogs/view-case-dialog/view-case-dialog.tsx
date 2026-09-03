import styles from "./view-case-dialog.module.scss";
import { ReactComponent as FileIcon } from "@assets/images/paper-file-yellow-icon.svg";
import React, { useState, useRef, useCallback, useEffect } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import {
  DialogActions,
  DialogContent,
  Button,
  CircularProgress,
} from "@material-ui/core";

import { UserAuthModel } from "@models/authorization.models";
import { CaseTableModel, CaseStringType } from "@models/cases.models";

import { CasesApi } from "@api/cases/cases.api";

import { Dialog } from "@components/dialog/dialog";

import { EditInvestigationCaseForm } from "@home/components/forms/cases-forms/investigation-case/edit-investigation-case-form/edit-investigation-case-form";
import { EditLTSCaseForm } from "@home/components/forms/cases-forms/lts-case/edit-lts-case-form/edit-lts-case-form";
import { EditDisciplinaryCaseForm } from "@home/components/forms/cases-forms/disciplinary-case/edit-disciplinary-case-form/edit-disciplinary-case-form";
import { EditGrievanceCaseForm } from "@home/components/forms/cases-forms/grievance-case/edit-grievance-case-form/edit-grievance-case-form";
import { EditAppealCaseForm } from "@home/components/forms/cases-forms/appeal-case/edit-appeal-case-form/edit-appeal-case-form";
import { EditPerformanceCaseForm } from "@home/components/forms/cases-forms/performance-case/edit-performance-case-form/edit-performance-case-form";

interface Props {
  open: boolean;
  caseType: CaseStringType;
  caseData: CaseTableModel;
  fetchEntity?: boolean;
  authUser: UserAuthModel;
  editMode?: boolean;
  hideActions?: boolean;
  onClose: () => void;
  handleRefetch: () => void;
}

export const ViewCaseDialog: React.FC<Props> = ({
  open,
  caseType,
  caseData,
  editMode,
  authUser,
  hideActions,
  fetchEntity,
  onClose,
  handleRefetch,
}) => {
  const [isEditMode, setEditMode] = useState(!!editMode);
  const [caseEntity, setCaseEntity] = useState(caseData);
  const [loading, setLoading] = useState(!!fetchEntity);

  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  useEffect(() => {
    if (open) {
      setCaseEntity(caseData);
    }
  }, [caseData, open]);

  const onSubmit = async () => {
    setEditMode(false);

    // To Check If Closed/Open Status change
    handleRefetch();
  };

  useEffect(() => {
    if (open && fetchEntity) {
      setLoading(true);
      (async () => {
        try {
          const caseResponse = await CasesApi.fetchCaseById(caseData.id);
          setCaseEntity(caseResponse.data);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      })();
    }
  }, [caseData.id, open, fetchEntity]);

  useEffect(() => {
    setEditMode(!!editMode);
  }, [editMode]);

  const formRef = useRef<HTMLFormElement>(null);

  const onSaveClick = useCallback(() => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  }, []);

  const onExited = () => {
    setEditMode(!!editMode);
  };

  const props = {
    onCreate: onSubmit,
    ref: formRef,
    authUser,
    editMode: isEditMode,
    caseData: caseEntity,
  };

  let caseForm = null;
  switch (caseType) {
    case CaseStringType.Investigation:
      caseForm = <EditInvestigationCaseForm {...props} />;
      break;
    case CaseStringType.Disciplinary:
      caseForm = <EditDisciplinaryCaseForm {...props} />;
      break;
    case CaseStringType.LTS:
      caseForm = <EditLTSCaseForm {...props} />;
      break;
    case CaseStringType.Grievance:
      caseForm = <EditGrievanceCaseForm {...props} />;
      break;
    case CaseStringType.Appeal:
      caseForm = <EditAppealCaseForm {...props} />;
      break;
    case CaseStringType.Performance:
      caseForm = <EditPerformanceCaseForm {...props} />;
      break;
    default:
      break;
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      fullWidth
      headerTitle={isEditMode ? "Edit Case:" : "View Case:"}
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
              <span className={styles.TitleTextHeader}>
                {isEditMode ? "Edit Case" : "View Case"}
              </span>
              {isEditMode && <>    <span className={styles.TitleTextSub}>
              Please edit needed fields within this 
              </span>
              <span className={styles.TitleTextSub}>form and then save updates</span></>}
          
            </div>
          </div>
        </div>
        {loading ? (
          <div className={styles.Loader}>
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        ) : (
          caseForm
        )}
      </DialogContent>
      {!hideActions && (
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
            {isEditMode ? (
              <Button
                disableElevation
                className="button-primary"
                color="primary"
                variant="contained"
                onClick={onSaveClick}
              >
                Save Updates
              </Button>
            ) : (
              <Button
                disableElevation
                className="button-primary"
                color="primary"
                variant="contained"
                onClick={() => {
                  setEditMode(true);
                }}
              >
                Edit Case
              </Button>
            )}
          </div>
        </DialogActions>
      )}
    </Dialog>
  );
};
