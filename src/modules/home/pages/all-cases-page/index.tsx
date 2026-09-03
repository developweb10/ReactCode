import { useParams } from "react-router-dom";
import { CaseTypeRouteParams, CaseType } from "@models/cases.models";

import { InvestigationsTable } from "./investigations-table/investigations-table";
import { AppealTable } from "./appeal-table/appeal-table";
import { DisciplinaryTable } from "./disciplinary-table/disciplinary-table";
import { GrievanceTable } from "./grievance-table/grievance-table";
import { LTSTable } from "./lts-table/lts-table";
import { PerformanceTable } from "./performance-table/performance-table";

import { useObservableState } from "observable-hooks";
import { useObservable } from "@libreact/use-observable";
import { casesQuery } from "@store/cases/cases.query";
import { authorizationQuery } from "@store/authorization/authorization.query";

const AllCasesPage = () => {
  const { caseType } = useParams<{ caseType: CaseTypeRouteParams }>();

  const [
    cases,
    { total, pagesCount },
  ] = useObservableState(casesQuery.casesState$, [
    [],
    { total: 0, pagesCount: 0 },
  ]);

  const [currentUser] = useObservable(authorizationQuery.user$);

  const props = {
    cases,
    pagesCount,
    total,
    currentUser: currentUser!,
  };

  let table = null;

  switch (caseType) {
    case CaseTypeRouteParams.Investigations:
      table = (
        <InvestigationsTable {...props} caseType={CaseType.Investigation} />
      );
      break;
    case CaseTypeRouteParams.Appeal:
      table = <AppealTable {...props} caseType={CaseType.Appeal} />;
      break;
    case CaseTypeRouteParams.Disciplinary:
      table = <DisciplinaryTable {...props} caseType={CaseType.Disciplinary} />;
      break;
    case CaseTypeRouteParams.Grievance:
      table = <GrievanceTable {...props} caseType={CaseType.Grievance} />;
      break;
    case CaseTypeRouteParams.LTS:
      table = <LTSTable {...props} caseType={CaseType.LTS} />;
      break;
    case CaseTypeRouteParams.Performance:
      table = <PerformanceTable {...props} caseType={CaseType.Performance} />;
      break;
    default:
      break;
  }

  return table;
};

export default AllCasesPage;
