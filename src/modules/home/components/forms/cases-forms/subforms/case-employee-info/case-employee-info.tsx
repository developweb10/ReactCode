import styles from "./case-employee-info.module.scss";

import { useEffect } from "react";

import Divider from "@material-ui/core/Divider";

import { EmployeeModel } from "@models/employee.models";
import { EmployeesApi } from "@api/employees/employees.api";

import { useWatch, Control } from "react-hook-form";

import { getOneDateItemDuration, howAgoDateDifference } from "@utils/dateUtils";
import moment from "moment";

interface Props {
  control: Control;
  employeeData: EmployeeModel | null;
  onEmployeeFetched: (employee: EmployeeModel) => void;
  setLoading: (newLoading: boolean) => void;
}

export const EmployeeCaseInfo: React.FC<Props> = ({
  control,
  employeeData,
  onEmployeeFetched,
  setLoading,
}) => {
  const employeeId = useWatch<number>({ control, name: `employeeId` });

  useEffect(() => {
    (async () => {
      if (employeeId) {
        setLoading(true);
        const response = await EmployeesApi.fetchEmployees({
          employeeIds: [employeeId],
        });
        if (response.data.result?.length) {
          onEmployeeFetched(response.data.result[0]);
        }
        setLoading(false);
      }
    })();
  }, [employeeId, onEmployeeFetched, setLoading]);
  if (!employeeData) return null;

  return (
    <>
      <Divider />
      <div className={styles.Wrapper}>
        <div className={styles.Section}>
          <div className={styles.SectionHeader}>Position</div>
          <div className={styles.SectionValue}>{employeeData.jobTitle}</div>
        </div>
        {employeeData.dateOfBirth && (
          <div className={styles.Section}>
            <div className={styles.SectionHeader}>Age</div>
            <div className={styles.SectionValue}>
              {getOneDateItemDuration(
                "year",
                new Date(employeeData.dateOfBirth),
                true
              )}
            </div>
          </div>
        )}
        {employeeData.joinDate && (
          <>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>Start Date</div>
              <div className={styles.SectionValue}>
                {moment(employeeData.joinDate).format("DD MMM YYYY")}
              </div>
            </div>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>Length Of Service</div>
              <div className={styles.SectionValue}>
                {employeeData.lengthOfService
                  ? howAgoDateDifference(
                      moment(employeeData.joinDate).startOf("day").toDate(),
                      moment(employeeData.leaveDate || new Date())
                        .startOf("day")
                        .toDate()
                    )
                  : "-"}
              </div>
            </div>
          </>
        )}

        {employeeData.store && (
          <>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>Location Name</div>
              <div className={styles.SectionValue}>
                {employeeData.store.name}
              </div>
            </div>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>Location No:</div>
              <div className={styles.SectionValue}>{employeeData.store.id}</div>
            </div>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>District Manager</div>
              <div className={styles.SectionValue}>
                {employeeData.store.districtManager.name}
              </div>
            </div>
            <div className={styles.Section}>
              <div className={styles.SectionHeader}>Regional Manager</div>
              <div className={styles.SectionValue}>
                {employeeData.store.regionalManager.name}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
