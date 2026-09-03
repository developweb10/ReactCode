import { CaseStatus } from "@models/cases.models";

export const TABLE_TABS = [
  { label: "All Open", value: 1 },
  { label: "All Closed", value: 2 },
  { label: "My Open", value: 3 },
  { label: "My Closed", value: 4 },
];

export const getCaseStatusByTab = (tab: number) => {
  switch (tab) {
    case 1:
    case 3:
      return CaseStatus.OPEN;

    case 2:
    case 4:
      return CaseStatus.CLOSED;

    default:
      return CaseStatus.OPEN;
  }
};

export const getTableLabelByTab = (tab: number) => {
  const selectedTab = TABLE_TABS.find((t) => t.value === tab);
  return selectedTab?.label || "";
};

export const isMyTab = (tab: number) => {
  switch (tab) {
    case 1:
    case 2:
      return false;

    case 3:
    case 4:
      return true;

    default:
      return false;
  }
};
