import styles from "./employee-selection-form.module.scss";

import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { useState, useCallback } from "react";
import { Input } from "@components/input/input";
import { DatePicker } from "@material-ui/pickers";
import { Controller } from "react-hook-form";
import { Typography, ButtonBase, IconButton } from "@material-ui/core";
import { Autocomplete } from "@components/autocomplete/autocomplete";

import { EmployeesApi } from "@api/employees/employees.api";
import { UsersApi } from "@api/users/users.api";

import { EmployeeModel } from "@models/employee.models";

import { EmployeeCaseInfo } from "../../../subforms/case-employee-info/case-employee-info";

export const EmployeeSelectionForm = ({
  register,
  setFieldValue,
  errors,
  control,
  clearErrors,
  setLoading,
  editMode,
  caseData,
}: any) => {
  const [employeeData, setEmployeeData] = useState<EmployeeModel | null>(
    caseData?.employee || null
  );
  const [showMoreHr, setShowMoreHr] = useState(!!caseData?.hrUser);

  const onEmployeeFetched = useCallback((employee: EmployeeModel) => {
    setEmployeeData(employee);
  }, []);

  const additionalHrToggle = useCallback(() => {
    setShowMoreHr(!showMoreHr);
  }, [showMoreHr]);

  const renderHrUser = useCallback(
    (hrUser?: string) => {
      return (
        <>
          <div className="input-wrap">
            <Input
              type="text"
              placeholder="HR User"
              label="HR User"
              value={hrUser || ""}
              disabled
            />
            {!showMoreHr && editMode && (
              <ButtonBase
                disableRipple
                disableTouchRipple
                onClick={additionalHrToggle}
                className={styles.MoreHrBtn}
              >
                <Typography className={styles.MoreHrText}>
                  + Add One More HR
                </Typography>
              </ButtonBase>
            )}
          </div>
          {showMoreHr && (
            <div className="input-wrap" style={{ marginLeft: "auto" }}>
              <Autocomplete
                fetch={async (search) => {
                  const result = await UsersApi.getUsers({
                    search,
                    sort: "surname,asc",
                  });
                  return { data: result.data };
                }}
                defaultValue={caseData?.hrUser || null}
                disabled={!editMode}
                inputProps={{
                  label: "HR User",
                  inputRef: register({
                    name: `hrId`,
                    type: "custom",
                  }),
                  id: "hrUser",
                  placeholder: "HR User",
                  endAdornment: editMode && (
                    <IconButton
                      className={styles.IconButton}
                      onClick={() => {
                        additionalHrToggle();
                        setFieldValue(`hrId`, "");
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ),
                }}
                debouncedSearch
                onChange={(event: React.ChangeEvent<{}>, value, reason) => {
                  setFieldValue(`hrId`, value?.userId || null);
                  clearErrors(`hrId`);
                }}
                getOptionSelected={(option, value) =>
                  option.userId === value.userId
                }
                getOptionLabel={(option) =>
                  `${option.firstname} ${option.surname}`
                }
              />
            </div>
          )}
        </>
      );
    },
    [
      showMoreHr,
      additionalHrToggle,
      register,
      setFieldValue,
      clearErrors,
      editMode,
      caseData?.hrUser,
    ]
  );

  return (
    <>
      <div className={styles.CaseTypeWrapper}>
        <Input
          type="text"
          placeholder="Case Type"
          label="Case Type"
          value="Performance"
          disabled
        />
      </div>

      <div className="input-group">
        <div className="input-wrap">
          <Controller
            control={control}
            name={`specificDetails.reviewFrom`}
            render={(props) => (
              <DatePicker
                value={props.value || null}
                onChange={(date) => {
                  props.onChange(date?.toISOString());
                }}
                disabled={!editMode}
                TextFieldComponent={(props) => (
                  <Input
                    label="Review From"
                    labelRequired
                    disabled={!editMode}
                    placeholder="_ _ /_ _ /_ _ _ _ "
                    value={props.value}
                    onClick={props.onClick}
                    errorMessage={errors.specificDetails?.reviewFrom?.message}
                  />
                )}
                format="DD MMM YYYY"
              />
            )}
          />
        </div>
        <div className="input-wrap">
          <Controller
            control={control}
            name={`specificDetails.reviewTo`}
            render={(props) => (
              <DatePicker
                value={props.value || null}
                onChange={(date) => {
                  props.onChange(date?.toISOString());
                }}
                disabled={!editMode}
                TextFieldComponent={(props) => (
                  <Input
                    label="Review To"
                    labelRequired
                    disabled={!editMode}
                    placeholder="_ _ /_ _ /_ _ _ _ "
                    value={props.value}
                    onClick={props.onClick}
                    errorMessage={errors.specificDetails?.reviewTo?.message}
                  />
                )}
                format="DD MMM YYYY"
              />
            )}
          />
        </div>

        <div className="input-wrap">
          <Autocomplete
            fetch={async (search) => {
              const result = await EmployeesApi.fetchEmployees({
                fields: ["id", "firstname", "surname"],
                search,
                sort: "surname,asc",
              });
              return { data: result.data.result };
            }}
            defaultValue={caseData?.employee || null}
            disabled={!editMode}
            inputProps={{
              label: "Employee ID",
              labelRequired: true,
              id: "employeeId",
              placeholder: "Employee ID",
              inputRef: register({
                name: `employeeId`,
                type: "custom",
              }),
              name: `employeeId`,
              errorMessage: errors.employeeId?.message,
            }}
            browserAutocompleteOff
            debouncedSearch
            onChange={(event: React.ChangeEvent<{}>, value, reason) => {
              if (reason === "select-option") {
                setFieldValue(`employeeId`, value.id);
                clearErrors(`employeeId`);
              }
            }}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) =>
              `${option.id} - ${option.firstname} ${option.surname}`
            }
          />
        </div>
        {renderHrUser(employeeData?.store?.hrManager.name)}
      </div>

      <EmployeeCaseInfo
        control={control}
        employeeData={employeeData}
        onEmployeeFetched={onEmployeeFetched}
        setLoading={setLoading}
      />
    </>
  );
};
