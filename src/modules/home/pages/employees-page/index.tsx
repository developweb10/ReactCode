import { useState, useCallback, useEffect, memo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useObservableState } from "observable-hooks";
import { employeesQuery } from "@store/employees/employees.query";
import { StoreModel } from "@models/store.models";
import { EmployeeModel } from "@models/employee.models";
import { EmployeesTable } from "./employees-table/employees-table";
import { EmployeeInfo } from "@modules/home/components/employee-info/employee-info";
const Employees: React.FC = memo(() => {
  const history = useHistory();
  const location = useLocation<{ employee: EmployeeModel } | null>();
  const employeeDetails = location.state ? location.state.employee : null;

  const [selectedEmployeeData, setEmployee] = useState<EmployeeModel | null>(
    employeeDetails
  );

  const [
    employees,
    { total, pagesCount },
  ] = useObservableState(employeesQuery.employeesState$, [
    [],
    { total: 0, pagesCount: 0 },
  ]);

  const handleShowEmployeeDetails = useCallback(
    (employee: EmployeeModel) => {
      history.push("/employees?employeeDetails", { employee });
    },
    [history]
  );

  const handleEmployeeInfoOnBack = () => {
    history.goBack();
  };

  const handleShowStoreDetails = useCallback(
    (store: StoreModel) => {
      // clear query params

      history.push(`/store-details/employees`, {
        store,
        backPath: history.location.pathname + history.location.search,
      });
    },
    [history]
  );
  useEffect(() => {
    setEmployee(employeeDetails);
  }, [employeeDetails]);

  return selectedEmployeeData ? (
    <EmployeeInfo
      employee={selectedEmployeeData}
      onBack={handleEmployeeInfoOnBack}
    />
  ) : (
    <EmployeesTable
      employees={employees}
      total={total}
      pagesCount={pagesCount}
      openEmployeeDefails={handleShowEmployeeDetails}
      openStoreDetails={handleShowStoreDetails}
    />
  );
});

export default Employees;
