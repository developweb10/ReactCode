import styles from "./case-details-tab.module.scss";
import classNames from "classnames";
import { useEffect, useState, useCallback, useMemo } from "react";
import { EmployeeModel } from "@models/employee.models";
import { CaseTableModel, CaseStatus, CaseType } from "@models/cases.models";
import { CasesApi } from "@api/cases/cases.api";
import { UserAuthModel } from "@models/authorization.models";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-left-icon.svg";

import { EditInvestigationCaseForm } from "@home/components/forms/cases-forms/investigation-case/edit-investigation-case-form/edit-investigation-case-form";
import { EditDisciplinaryCaseForm } from "@home/components/forms/cases-forms/disciplinary-case/edit-disciplinary-case-form/edit-disciplinary-case-form";
import { EditAppealCaseForm } from "@home/components/forms/cases-forms/appeal-case/edit-appeal-case-form/edit-appeal-case-form";
import { EditGrievanceCaseForm } from "@home/components/forms/cases-forms/grievance-case/edit-grievance-case-form/edit-grievance-case-form";
import { EditLTSCaseForm } from "@home/components/forms/cases-forms/lts-case/edit-lts-case-form/edit-lts-case-form";
import { EditPerformanceCaseForm } from "@home/components/forms/cases-forms/performance-case/edit-performance-case-form/edit-performance-case-form";

import { Input } from "@components/input/input";
import { Badge } from "@components/badge/badge";
import { Loader } from "@components/loader/loader";

import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";
import moment from "moment";

interface Props {
  employee: EmployeeModel;
  currentUser: UserAuthModel;
}

export const CaseDetailsTab: React.FC<Props> = ({ employee, currentUser }) => {
  const [employeeCases, setCases] = useState<CaseTableModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapseId, setCollapseId] = useState<null | number>(null);
  const currentDate = useMemo(() => moment().format("DD MMM YYYY"), []);

  const handleClick = (id: number) => () => {
    setCollapseId(id === collapseId ? null : id);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await CasesApi.fetchCases({
          employeeId: employee.id,
          size: 9999,
        });
        setCases(response.data.result);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, [employee.id]);

  const getCaseFormByType = useCallback((caseType: CaseType, props) => {
    let caseForm = null;
    switch (caseType) {
      case CaseType.Investigation:
        caseForm = <EditInvestigationCaseForm {...props} />;
        break;
      case CaseType.Disciplinary:
        caseForm = <EditDisciplinaryCaseForm {...props} />;
        break;
      case CaseType.Appeal:
        caseForm = <EditAppealCaseForm {...props} />;
        break;
      case CaseType.LTS:
        caseForm = <EditLTSCaseForm {...props} />;
        break;
      case CaseType.Performance:
        caseForm = <EditPerformanceCaseForm {...props} />;
        break;
      case CaseType.Grievance:
        caseForm = <EditGrievanceCaseForm {...props} />;
        break;
      default:
        break;
    }
    return caseForm;
  }, []);

  return (
    <div className={styles.Wrapper}>
      {loading && <Loader />}
      {!loading && !employeeCases.length && (
        <Typography className={styles.NoCaseText}>
          This Employee doesn't have cases
        </Typography>
      )}
      {employeeCases.map((caseInfo) => {
        const caseOpened = caseInfo.status === CaseStatus.OPEN;

        return (
          <Accordion
            elevation={0}
            TransitionProps={{ unmountOnExit: true }}
            square
            expanded={caseInfo.id === collapseId}
            onChange={handleClick(caseInfo.id)}
            classes={{
              root: styles.CaseItem,
              expanded: styles.Expanded,
            }}
          >
            <AccordionSummary
              classes={{
                content: styles.CaseItemHeader,
                root: styles.HeaderRoot,
              }}
            >
              <Input
                disabled
                value={CaseType[caseInfo.caseTypeId]}
                label="Case Type"
                inputClassname={styles.Input}
              />
              <Input
                disabled
                label={caseOpened ? "Ongoing" : "Closed Date"}
                value={
                  caseOpened
                    ? currentDate
                    : moment(caseInfo.statusUpdatedDate).format("DD MMM YYYY")
                }
                inputClassname={styles.Input}
              />
              <Badge
                className={styles.Badge}
                title={caseOpened ? "Open" : "Closed"}
                variant={caseOpened ? "success" : "error"}
              />
              <div className={styles.ArrowWrapper}>
                <ArrowIcon
                  className={classNames(styles.ArrowIcon, {
                    [styles.Expanded]: caseInfo.id === collapseId,
                  })}
                />
              </div>
            </AccordionSummary>
            <AccordionDetails classes={{ root: styles.CaseItemBody }}>
              {getCaseFormByType(caseInfo.caseTypeId, {
                authUser: { currentUser },
                caseData: caseInfo,
                editMode: false,
                onCreate: () => {},
                noPadding: true,
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};
