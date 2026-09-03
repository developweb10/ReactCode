import { CaseType } from "@models/cases.models";

export const getCaseTypeLabel = (caseTypeId?: CaseType | string | number) => {
  if (caseTypeId === undefined || caseTypeId === null) {
    return "";
  }

  if (typeof caseTypeId === "number") {
    return CaseType[caseTypeId] || "";
  }

  if (typeof caseTypeId === "string") {
    const numericCaseType = Number(caseTypeId);
    if (!Number.isNaN(numericCaseType) && CaseType[numericCaseType]) {
      return CaseType[numericCaseType];
    }

    if (CaseType[caseTypeId as keyof typeof CaseType]) {
      return caseTypeId;
    }

    return caseTypeId;
  }

  return "";
};
