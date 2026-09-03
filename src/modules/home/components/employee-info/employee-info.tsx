import { useState } from "react";

import { useHistory } from "react-router-dom";
import styles from "./employees-info.module.scss";
import classNames from "classnames";
import EmployeesIcon from "@assets/images/employees-yellow-icon.svg";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-down-icon.svg";
import { ButtonBase, CircularProgress } from "@material-ui/core";
import { EmployeeModel, EmployeeEditDto } from "@models/employee.models";
import { employeesService } from "@store/employees/employees.service";

import { authorizationQuery } from "@store/authorization/authorization.query";
import { useObservable } from "@libreact/use-observable";
import { getOneDateItemDuration } from "@utils/dateUtils";
import { removeEmptyStringNullValues } from "@utils/object-clear";
import { useScrollTopMount } from "@hooks/useScrollTopMount";

import { PageHeader } from "@components/page-header/page-header";
import { Tabs } from "@components/tabs/tabs";
import { TabPanel } from "@components/tabs/tab-panel";
import Typography from "@material-ui/core/Typography";

import { EmployeeTypeBadge } from "@components/employee-type-badge/employee-type-badge";
import { PersonalDetailsTabForm } from "@home/components/forms/employee-forms/edit-employee-tab-forms/personal-details-tab-form";
import { ContactInfoTabForm } from "@home/components/forms/employee-forms/edit-employee-tab-forms/contact-info-tab-form";
import { EmergencyContactsTabForm } from "@home/components/forms/employee-forms/edit-employee-tab-forms/emergency-contacts-tab-form";
import { JobTabForm } from "@home/components/forms/employee-forms/edit-employee-tab-forms/job-tab-form";
import { SalaryDetailsTabForm } from "@home/components/forms/employee-forms/edit-employee-tab-forms/salary-details-tab-form";

import { CaseDetailsTab } from "./case-details-tab/case-details-tab";
import { EmployeeAvatar } from "./employee-avatar/employee-avatar";

const TABS = [
  {
    label: "Personal details",
    value: 1,
  },
  {
    label: "Contact info",
    value: 2,
  },
  {
    label: "Emergency Contacts",
    value: 3,
  },
  {
    label: "Job",
    value: 4,
  },
  {
    label: "Salary Details",
    value: 5,
  },
  {
    label: "Case Details",
    value: 6,
  },
];

interface EmployeeInfoProps {
  employee: EmployeeModel;
  onBack: () => void;
}
export const EmployeeInfo: React.FC<EmployeeInfoProps> = ({
  employee,
  onBack,
}) => {
  const [currentUser] = useObservable(authorizationQuery.user$);
  useScrollTopMount();
  const history = useHistory();
  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const onTabChange = (event: React.ChangeEvent<{}>, newTab: number) => {
    setTab(newTab);
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);

    let employeeDto: EmployeeEditDto & { genderName?: string } = {
      ...employee,
    };

    for (const key in formData) {
      employeeDto = { ...employeeDto, ...formData[key] };
    }

    // Custom gender name
    if (employeeDto.genderName) {
      employeeDto.gender = employeeDto.genderName;
      delete employeeDto.genderName;
    }

    employeeDto.storeId = employeeDto.storeId || employee.store?.id;

    const employeeDtoWoEmptyStrings: EmployeeEditDto = removeEmptyStringNullValues(
      employeeDto
    );

    try {
      const updatedEmployee = await employeesService.editEmployee(
        employeeDtoWoEmptyStrings,
        employee.id
      );
      setLoading(false);
      history.replace("/employees?employeeDetails", {
        employee: updatedEmployee,
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const onAvatarUpload = async (avatarId: number) => {
    try {
      const updatedEmployee = await employeesService.editEmployee(
        { ...employee, avatarId, storeId: employee.store?.id },
        employee.id
      );
      history.replace("/employees?employeeDetails", {
        employee: updatedEmployee,
      });
    } catch (error) {}
  };

  const handleAvatarDelete = async () => {
    try {
      const updatedEmployee = await employeesService.editEmployee(
        { ...employee, storeId: employee.store?.id, avatarId: undefined },
        employee.id
      );
      setLoading(false);
      history.replace("/employees?employeeDetails", {
        employee: updatedEmployee,
      });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className={styles.PageWrapper}>
      <PageHeader title="Employees" icon={EmployeesIcon} />

      <div className={classNames("page-content", styles.Wrap)}>
        <ButtonBase
          onClick={onBack}
          className={styles.BackButton}
          disableRipple
        >
          <ArrowIcon className={styles.BackIcon} />
          <Typography>Back</Typography>
        </ButtonBase>

        <div className={styles.EmployeeInfoWrapper}>
          <div className={styles.CardsWrapper}>
            <EmployeeAvatar
              avatarId={employee.avatarId}
              editable={employee.isEditable}
              onAvatarUpload={onAvatarUpload}
              handleAvatarDelete={handleAvatarDelete}
            />
            <div className={styles.EmployeeCard}>
              <div className={styles.CardHeader}>
                <div className={styles.EmployeeAge}>
                  <Typography>
                    {employee.dateOfBirth
                      ? `AGE - ${getOneDateItemDuration(
                          "year",
                          new Date(employee.dateOfBirth)
                        )}`
                      : "-"}
                  </Typography>
                </div>
                <div className={styles.EmployeeStatus}>
                  <EmployeeTypeBadge type={employee.type} />
                </div>
              </div>
              <div className={styles.CardBody}>
                <div className={styles.EmployeeName}>
                  <Typography variant="h5">
                    {employee.firstname} {employee.surname}
                  </Typography>
                </div>
                <div className={styles.EmployeeId}>
                  <Typography>ID: {employee.id}</Typography>
                </div>
                <div className={styles.EmployeePosition}>
                  <Typography>{employee.jobTitle} </Typography>
                </div>
              </div>
            </div>
          </div>

          <div id="employee-details-forms" className={styles.EmployeeDetails}>
            {loading && (
              <div className="overlay-loader with-opacity">
                <CircularProgress
                  size="6rem"
                  variant="indeterminate"
                  disableShrink
                />
              </div>
            )}

            <div className={styles.DetailsHeader}>
              <Tabs value={tab} onChange={onTabChange} labels={TABS} />
            </div>
            <TabPanel selectedValue={tab} tabValue={1}>
              <PersonalDetailsTabForm employee={employee} onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel selectedValue={tab} tabValue={2}>
              <ContactInfoTabForm employee={employee} onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel selectedValue={tab} tabValue={3}>
              <EmergencyContactsTabForm
                employee={employee}
                onSubmit={onSubmit}
              />
            </TabPanel>
            <TabPanel selectedValue={tab} tabValue={4}>
              <JobTabForm employee={employee} onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel selectedValue={tab} tabValue={5}>
              <SalaryDetailsTabForm employee={employee} onSubmit={onSubmit} />
            </TabPanel>
            <TabPanel selectedValue={tab} tabValue={6}>
              <CaseDetailsTab employee={employee} currentUser={currentUser!} />
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
