import { UserModel } from "./users.models";
import { EmployeeModel, EmployeeMinDto } from "./employee.models";
import { MessageModel } from "./message.models";

export enum CaseStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum CaseType {
  Investigation = 1,
  Disciplinary = 2,
  LTS = 3,
  Grievance = 4,
  Appeal = 5,
  Performance = 6,
}

export enum CaseStringType {
  Investigation = "Investigation",
  Disciplinary = "Disciplinary",
  LTS = "LTS",
  Grievance = "Grievance",
  Appeal = "Appeal",
  Performance = "Performance",
}

export enum CaseTypeRouteParams {
  Investigations = "investigations",
  Disciplinary = "disciplinary",
  LTS = "lts",
  Grievance = "grievance",
  Appeal = "appeal",
  Performance = "performance",
}

export interface CaseOutcomeDto {
  id: number;
  caseTypeId: CaseType;
  name: string;
  closed: boolean;
  isDefault: boolean;
}

export interface CaseAilmentDto {
  id: number;
  name: string;
}

// Messages

// CASE TABLE FETCH DTOS
export interface CaseTableModel {
  id: number;
  caseTypeId: CaseType;
  status: CaseStatus;
  date: string;
  employee: EmployeeModel;
  hrUser: UserModel;
  details?: string;
  note?: string;
  messageDtos: MessageModel[];
  statusUpdatedDate?: string;
  outcome: CaseOutcomeDto;
  specificDetails: AppealTableDto &
    DisciplinaryTableDto &
    GrievanceCaseTableDto &
    InvestigationTableDto &
    LtsCaseTableDto &
    PerformanceCaseTableDto;
}

export interface AppealTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  currentIssue?: string;
  appealDate: string;
  appeal: boolean;
  suspended: boolean;
  suspensionDate: string;
}

export interface DisciplinaryTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  discipliningDate: string;
  reason: string;
  appeal: boolean;
  suspended: boolean;
  suspensionDate: string;
}

export interface GrievanceCaseTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  currentIssue?: string;
  dateGrievanceRaised: string;
  dateGrievanceHearing: string;
  appeal: boolean;
  suspended: boolean;
  suspensionDate: string;
}

export interface InvestigationTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  currentIssue?: string;
  investigationDate: string;
  suspended: boolean;
  suspensionDate: string;
  appeal: boolean;
}

export interface LtsCaseTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  dateOfSickness: string;
  ailment: string;
  fitNoteExpiresOn: string;
  returnToWork: boolean;
  returnDate: string;
}

export interface EvaluationsTableDto {
  improvementArea?: string;
  min?: number | string;
  max?: number | string;
  rating?: number | string;
  comment?: string;
}
export interface PerformanceCaseTableDto {
  officer: EmployeeMinDto;
  caseTypeId: CaseType;
  reviewFrom: string;
  reviewTo: string;
  finalComment: string;
  finalScore: number;
  improvementOverview: string;
  completionDate: string;
  appeal: boolean;
  evaluations: EvaluationsTableDto[];
}

interface SharedFetchParams {
  status?: CaseStatus;
  createdById?: number;
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}
export interface CasesFetchParams extends SharedFetchParams {
  caseType?: CaseType;
  employeeId?: number;
}

interface SharedFilterParams {
  firstnames?: string[];
  surnames?: string[];
  positions?: string[];
  storeNames?: string[];
  storeNumbers?: string[];
  hrsId?: number[];
  districtManagersId?: number[];
}
export interface InvestigationCasesFilterParams extends SharedFilterParams {
  investigationDate?: string;
  suspended?: boolean;
}

export interface InvestigationCasesFetchParams
  extends InvestigationCasesFilterParams,
    SharedFetchParams {}

export interface DisciplinaryFilterParams extends SharedFilterParams {
  discipliningDate?: string;
  suspended?: boolean;
}

export interface DisciplinaryCasesFetchParams
  extends DisciplinaryFilterParams,
    SharedFetchParams {}

export interface LTSFilterParams extends SharedFilterParams {
  ailments?: string[];
  dateOfSickness?: string;
  fitNoteExpiresOn?: string;
}

export interface LTSCasesFetchParams
  extends LTSFilterParams,
    SharedFetchParams {}

export interface GrievanceFilterParams extends SharedFilterParams {
  dateGrievanceRaised?: string;
  dateGrievanceHearing?: string;
}

export interface GrievanceCasesFetchParams
  extends GrievanceFilterParams,
    SharedFetchParams {}

export interface AppealFilterParams extends SharedFilterParams {
  appealDate?: string;
  suspended?: boolean;
}

export interface AppealCasesFetchParams
  extends AppealFilterParams,
    SharedFetchParams {}

export interface PerformanceFilterParams extends SharedFilterParams {
  reviewFrom?: string;
  reviewTo?: string;
}

export interface PerformanceCasesFetchParams
  extends PerformanceFilterParams,
    SharedFetchParams {}

// ADD CASE DTOS

export interface BaseCaseDto {
  caseTypeId: CaseType;
  date?: string;
  employeeId: number;
  hrId?: number;
  details?: string;
  note?: string;
  messages?: string[];
  outcomeId: number;
}
export interface AppealCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    currentIssue?: string;
    officerId?: number;
    appealDate?: string;
    appeal?: boolean;
    suspended?: boolean;
    suspensionDate?: string;
  };
}

export interface DisciplinaryCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    discipliningDate?: string;
    officerId?: number;
    reason?: string;
    appeal?: boolean;
    suspended?: boolean;
    suspensionDate?: string;
  };
}

export interface GrievanceCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    currentIssue?: string;
    officerId?: number;
    dateGrievanceRaised?: string;
    dateGrievanceHearing?: string;
    appeal?: boolean;
    suspended?: boolean;
    suspensionDate?: string;
  };
}

export interface InvestigationCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    currentIssue?: string;
    investigationDate?: string;
    officerId?: number;
    appeal?: boolean;
    suspended?: boolean;
    suspensionDate?: string;
  };
}

export interface LtsCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    dateOfSickness?: string;
    ailment?: string;
    fitNoteExpiresOn?: string;
    returnToWork?: boolean;
    returnDate?: string;
    suspensionDate?: string;
  };
}

export interface PerformanceCaseDto extends BaseCaseDto {
  specificDetails: {
    caseTypeId: CaseType;
    reviewFrom: string;
    reviewTo: string;
    finalComment: string;
    finalScore: number;
    appeal?: boolean;
    improvementOverview?: string;
    completionDate: string;
    evaluations?: EvaluationsTableDto[];
  };
}

export interface CaseInfoDto<T> {
  caseId: number;
  status: CaseStatus;
  employeeId: number;
  name: string;
  hrUser: string;
  position: string;
  age: number;
  startDate: string;
  lengthOfService: number;
  storeNo: string;
  storeName: string;
  districtManager: string;
  regionalManager: string;
  trackerCase: T;
}
