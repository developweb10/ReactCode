import { useState, useCallback, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { useObservableState } from "observable-hooks";
import { StoreModel } from "@models/store.models";
import { EmployeeModel } from "@models/employee.models";
import { employeesQuery } from "@store/employees/employees.query";

import { EmployeesTable } from "@modules/home/pages/employees-page/employees-table/employees-table";

const StoreEmployees: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{
    store: StoreModel;
    backPath: string;
  } | null>();
  const store = location.state ? location.state.store : null;
  const [selectedStore] = useState<StoreModel | null>(store);

  const backPath = useRef(location.state?.backPath || "/store-details");

  useEffect(() => {
    if (!store && !selectedStore) {
      history.push("/store-details");
    }
  }, [store, history, selectedStore]);

  const [
    employees,
    { pagesCount: pagesCountEmployees, total: totalEmployees },
    ,
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

  const handleStoreDetailsOnBack = useCallback(() => {
    history.push(backPath.current);
  }, [history]);

  if (selectedStore) {
    return (
      <EmployeesTable
        employees={employees}
        pagesCount={pagesCountEmployees}
        total={totalEmployees}
        onBack={handleStoreDetailsOnBack}
        selectedStore={selectedStore}
        openEmployeeDefails={handleShowEmployeeDetails}
        historyState={{
          store: selectedStore,
          backPath: backPath.current,
        }}
      />
    );
  }

  return null;
};

export default StoreEmployees;
