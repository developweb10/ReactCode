import { EmployeeType } from "@models/employee.models";

export const TABS_LIST = [
  { label: "Employed", value: 1 },
  { label: "Leaver", value: 2 },
  { label: "Sick", value: 3 },
];

export const getEmployeeTypeByTabValue = (tab: number) => {
  switch (tab) {
    case 1:
      return EmployeeType.EMPLOYEED;

    case 2:
      return EmployeeType.LEAVER;

    case 3:
      return EmployeeType.SICK;

    default:
      return EmployeeType.EMPLOYEED;
  }
};
