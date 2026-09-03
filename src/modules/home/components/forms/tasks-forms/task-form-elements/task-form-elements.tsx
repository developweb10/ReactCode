import styles from "./task-form-elements.module.scss";
import { useEffect, useState, useMemo } from "react";
import { useWatch, Controller } from "react-hook-form";

import { ClickAwayListener, Divider } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import { CaseType, CaseTableModel, CaseStatus } from "@models/cases.models";

import { CasesApi } from "@api/cases/cases.api";
import { UsersApi } from "@api/users/users.api";
import { EmployeesApi } from "@api/employees/employees.api";
import { UserRoleEnum } from "@models/users.models";
import { TaskPriority } from "@models/tasks.models";

export const NOTICEBOARD_CASE_TYPE = 8;
export const NOTICEBOARD_ALL_USER = {
  userId: -1,
  firstname: "All",
  surname: "Noticeboard",
  role: UserRoleEnum.ROLE_HR,
  email: "",
};

const getNoticeboardUsers = (users: any[]) => [
  NOTICEBOARD_ALL_USER,
  ...users.filter((user) => user.userId !== NOTICEBOARD_ALL_USER.userId),
];

const CaseTypeSelect = ({
  register,
  control,
  editMode,
  setFieldValue,
  caseEntity,
  taskCaseType,
}: any) => {
  const [selectedValue, setValue] = useState(
    caseEntity ? caseEntity.caseTypeId : taskCaseType || 0
  );

  const [showSelect, setShowSelect] = useState(true);

  useEffect(() => {
    setValue(caseEntity ? caseEntity.caseTypeId : taskCaseType || 0);
  }, [caseEntity, taskCaseType]);

  const handleClickAway = () => {
    if (!caseEntity) {
      setFieldValue("employee", null);
      setFieldValue("hr", null);
      setValue(0);
    } else {
      setShowSelect(true);
      setValue(caseEntity.caseTypeId);
    }
  };

  const handleOptionClick = (value: number) => {
    setShowSelect(false);
    setValue(value);
    setFieldValue("taskCaseType", value);
    if (value === 0) {
      setFieldValue("caseEntity", null);
      setFieldValue("employee", null);
      setFieldValue("hr", null);
      setFieldValue("priority", null);
    }
    if (value === NOTICEBOARD_CASE_TYPE) {
      setShowSelect(true);
      setFieldValue("caseEntity", null);
      setFieldValue("employee", null);
      setFieldValue("hr", null);
      setFieldValue("priority", null);
    }
    if (value !== NOTICEBOARD_CASE_TYPE && value !== 0) {
      setFieldValue("priority", null);
    }
  };

  if (!!selectedValue && !showSelect) {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <Controller
            control={control}
            name={`caseEntity`}
            render={(props) => {
              let autoCompleteValue = null;

              if (props.value && props.value.caseTypeId === selectedValue) {
                autoCompleteValue = props.value;
              }
              return (
                <Autocomplete
                  disabled={!editMode}
                  inputProps={{
                    id: "caseEntity",
                    placeholder: `${CaseType[selectedValue]} Case`,
                    autoFocus: true,
                    label: "Case Type",
                    labelRequired: true,
                  }}
                  value={autoCompleteValue}
                  fetch={async (search) => {
                    const result = await CasesApi.fetchCases({
                      search,
                      caseType: selectedValue,
                      status: CaseStatus.OPEN,
                    });
                    return { data: result.data.result };
                  }}
                  debouncedSearch
                  onChange={(event: React.ChangeEvent<{}>, value, reason) => {
                    props.onChange(value);
                    if (reason === "select-option" && value) {
                      const caseHr = value.hrUser;
                      const storeHr = value.employee?.store?.hrManager;
                      const employee = value.employee;

                      if (employee) {
                        setFieldValue("employee", {
                          id: employee.id,
                          firstname: employee.firstname,
                          surname: employee.surname,
                        });
                      }
                      if (caseHr) {
                        setFieldValue("hr", {
                          userId: caseHr.userId,
                          firstname: caseHr.firstname,
                          surname: caseHr.surname,
                        });
                        return;
                      }
                      if (storeHr) {
                        const [firstname, surname] = storeHr.name.split(" ");
                        setFieldValue("hr", {
                          userId: storeHr.id,
                          firstname,
                          surname,
                        });
                      }
                      setShowSelect(true);
                    }
                  }}
                  getOptionLabel={(option) =>
                    `ID: ${option.id} - ${option.employee.firstname} ${option.employee.surname}`
                  }
                  getOptionSelected={(option) => {
                    return option.id === props.value?.id;
                  }}
                />
              );
            }}
          />
        </div>
      </ClickAwayListener>
    );
  }

  return (
    <Select
      disabled={!editMode}
      inputProps={{
        label: "Case Type",
        labelRequired: true,
      }}
      value={selectedValue}
      options={[
        { name: "Ad Hoc", value: 0, onOptionClick: handleOptionClick },
        {
          name: "Investigation",
          value: CaseType.Investigation,
          onOptionClick: handleOptionClick,
        },
        {
          name: "Disciplinary",
          value: CaseType.Disciplinary,
          onOptionClick: handleOptionClick,
        },
        { name: "LTS", value: CaseType.LTS, onOptionClick: handleOptionClick },
        {
          name: "Grievance",
          value: CaseType.Grievance,
          onOptionClick: handleOptionClick,
        },
        {
          name: "Appeal",
          value: CaseType.Appeal,
          onOptionClick: handleOptionClick,
        },
        {
          name: "Performance",
          value: CaseType.Performance,
          onOptionClick: handleOptionClick,
        },
        {
          name: "Noticeboard",
          value: NOTICEBOARD_CASE_TYPE,
          onOptionClick: handleOptionClick,
        },
      ]}
      onChange={(
        event: React.ChangeEvent<{
          name?: string | undefined;
          value: unknown;
        }>
      ) => {}}
    />
  );
};

export const TaskFormElements = ({
  register,
  setValue,
  errors,
  control,
  editMode,
}: any) => {
  const caseEntity = useWatch<CaseTableModel>({
    control,
    name: `caseEntity`,
  });
  const taskCaseType = useWatch<number>({
    control,
    name: `taskCaseType`,
  });
  const isNoticeboard = taskCaseType === NOTICEBOARD_CASE_TYPE;

  const caseLocationHr = useMemo(() => {
    if (!caseEntity) return null;
    if (!caseEntity.hrUser) return null;
    return caseEntity?.employee?.store?.hrManager;
  }, [caseEntity]);
  return (
    <div className={styles.InputGroup}>
      <div className={styles.InputWrapper}>
        <CaseTypeSelect
          control={control}
          register={register}
          editMode={editMode}
          setFieldValue={setValue}
          caseEntity={caseEntity}
          taskCaseType={taskCaseType}
        />
      </div>
      <div className={styles.InputWrapper}>
        <Controller
          control={control}
          name={`hr`}
          render={(props) => (
            <Autocomplete
              key={isNoticeboard ? "noticeboard-user" : "hr-user"}
              fetch={async (search) => {
                const result = await UsersApi.getUsers({
                  search,
                  sort: "surname,asc",
                });
                const users = result.data || [];
                return {
                  data: isNoticeboard ? getNoticeboardUsers(users) : users,
                };
              }}
              value={props.value || null}
              disabled={!editMode || !!caseEntity}
              inputProps={{
                label: isNoticeboard
                  ? "Noticeboard User"
                  : !!caseEntity
                  ? "Case HR"
                  : "Select HR",
                labelRequired: true,
                placeholder: isNoticeboard ? "Select All or User" : "Select HR",
                errorMessage: errors.hr?.message,
              }}
              debouncedSearch
              onChange={(event: React.ChangeEvent<{}>, value, reason) => {
                if (reason === "select-option" && value) {
                  props.onChange({
                    userId: value.userId,
                    firstname: value.firstname,
                    surname: value.surname,
                  });
                }
              }}
              getOptionSelected={(option, value) =>
                option.userId === value.userId
              }
              getOptionLabel={(option) =>
                `${option.firstname} ${option.surname}`
              }
            />
          )}
        />
      </div>
      {caseLocationHr && (
        <div className={styles.InputGroup}>
          <div
            className={styles.InputWrapper}
            style={{
              marginLeft: "auto",
            }}
          >
            <Input
              label="Case Location HR"
              value={caseLocationHr.name}
              disabled
            />
          </div>
        </div>
      )}

      <div className={styles.InputWrapper}>
        <Controller
          control={control}
          name={`dueDate`}
          render={(props) => (
            <DatePicker
              clearable
              value={props.value || null}
              onChange={(date) => {
                props.onChange(date?.toISOString());
              }}
              minDate={new Date()}
              disabled={!editMode}
              TextFieldComponent={(props) => (
                <Input
                  label="Set Deadline"
                  labelRequired
                  disabled={!editMode}
                  placeholder="_ _ /_ _ /_ _ _ _"
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={errors.dueDate?.message}
                />
              )}
              format="D MMM YYYY"
            />
          )}
        />
      </div>
      {isNoticeboard && (
        <div className={styles.InputWrapper}>
          <Controller
            control={control}
            name={`priority`}
            render={(props) => (
              <Select
                disabled={!editMode}
                inputProps={{
                  label: "Priority",
                  labelRequired: true,
                  errorMessage: errors.priority?.message,
                }}
                value={props.value || ""}
                options={[
                  { name: "High", value: TaskPriority.HIGH },
                  { name: "Medium", value: TaskPriority.MEDIUM },
                  { name: "Low", value: TaskPriority.LOW },
                ]}
                onChange={(event) => props.onChange(event.target.value)}
              />
            )}
          />
        </div>
      )}
      <div className={styles.InputWrapper}>
        <Controller
          control={control}
          name={`employee`}
          render={(props) => (
            <Autocomplete
              fetch={async (search) => {
                const result = await EmployeesApi.fetchEmployees({
                  fields: ["id", "firstname", "surname"],
                  search,
                  sort: "surname,asc",
                });
                return { data: result.data.result };
              }}
              value={props.value || null}
              disabled={!editMode || !!caseEntity}
              inputProps={{
                label: !!caseEntity ? "Case Employee" : "Select Employee",
                id: "employee",
                placeholder: "Select Employee",
                errorMessage: errors.employeeId?.message,
              }}
              browserAutocompleteOff
              debouncedSearch
              onChange={(event: React.ChangeEvent<{}>, value, reason) => {
                props.onChange(value);
              }}
              getOptionSelected={(option, value) => option.id === value.id}
              getOptionLabel={(option) =>
                `${option.id} - ${option.firstname} ${option.surname}`
              }
            />
          )}
        />
      </div>
      <div className={styles.TextAreaWrapper}>
        <TextArea
          label="Note"
          rows={13}
          placeholder="Text here"
          name="note"
          inputRef={register()}
          errorMessage={errors.details?.message}
          disabled={!editMode}
        />
      </div>
      <Divider className={styles.Divider} />
    </div>
  );
};
