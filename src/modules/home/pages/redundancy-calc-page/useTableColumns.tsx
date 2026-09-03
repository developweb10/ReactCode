import { useMemo, useRef, useEffect, useState } from "react";
import { CalculatorDataColumn } from "./types";
import { Typography, IconButton, ClickAwayListener } from "@material-ui/core";
import styles from "./redundancy-calc-page.module.scss";

import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";

import { Autocomplete } from "@components/autocomplete/autocomplete";
import { Input } from "@components/input/input";

import { EmployeesApi } from "@api/employees/employees.api";
import { StoresApi } from "@api/stores/stores.api";
import {
  EditCalculatorDto,
  CalculatorModel,
} from "@models/redundancy-calculator.models";
import { StoreModel } from "@models/store.models";

import NumberFormat from "react-number-format";
import { getOneDateItemDuration, howAgoDateDifference } from "@utils/dateUtils";
import moment from "moment";
import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";

const EditableCellInput: React.FC<{
  initialValue: string;
  placeholder: string;
  onChange: (newValue: string) => void;
}> = ({ initialValue, placeholder, onChange }) => {
  const value$ = useRef(new Subject<string>());
  useEffect(() => {
    const subscription = value$.current
      .pipe(debounceTime(600))
      .subscribe((newValue) => {
        onChange(newValue);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [onChange]);
  return (
    <NumberFormat
      defaultValue={initialValue}
      placeholder={placeholder}
      customInput={Input}
      type="text"
      isNumericString
      inputClassname={styles.TextField}
      decimalScale={0}
      allowNegative={false}
      onValueChange={({ value }) => {
        value$.current.next(value);
      }}
    />
  );
};

const LocationAutocomplete: React.FC<{
  handleAddRow: (employeeId: number) => void;
}> = ({ handleAddRow }) => {
  const [selectedLocationId, setLocationId] = useState<null | number>(null);

  const handleResetLocation = () => {
    setLocationId(null);
  };

  if (selectedLocationId) {
    return (
      <ClickAwayListener onClickAway={handleResetLocation}>
        <div>
          <Autocomplete
            hideArrow
            key={Math.random()}
            fetch={async (search) => {
              const result = await EmployeesApi.fetchEmployees({
                search,
                sort: "firstname,asc",
                storeId: selectedLocationId,
              });
              return { data: result.data.result };
            }}
            inputProps={{
              id: "employee",
              placeholder: "Employee",
              name: `employee`,
              inputClassname: styles.TextField,
              autoFocus: true,
            }}
            debouncedSearch
            onChange={(event: React.ChangeEvent<{}>, selectedValue, reason) => {
              if (reason === "select-option" && selectedValue?.id) {
                handleResetLocation();
                handleAddRow(selectedValue.id);
              }
            }}
            getOptionLabel={(option) => `${option.firstname} ${option.surname}`}
          />
        </div>
      </ClickAwayListener>
    );
  }
  return (
    <Autocomplete
      hideArrow
      key={Math.random()}
      fetch={async (search) => {
        const result = await StoresApi.fetchStores({
          search,
          sort: "name,asc",
        });
        return { data: result.data.result };
      }}
      inputProps={{
        id: "location",
        placeholder: "Location",
        name: `location`,
        inputClassname: styles.TextField,
      }}
      debouncedSearch
      onChange={(event: React.ChangeEvent<{}>, selectedValue, reason) => {
        if (reason === "select-option" && selectedValue?.id) {
          setLocationId(selectedValue.id);
        }
      }}
      getOptionLabel={(option) => option.name}
    />
  );
};

export const SEARCHABLE_FIELDS = [
  "employeeId",
  "firstname",
  "surname",
  "store.name",
];
export const EDITABLE_FIELDS = ["unworkedNoticePeriod", "noticePeriod"];

interface Args {
  handleAddRow: (employeeId: number) => void;
  handleDeleteRow: (id: number) => void;
  handleUpdateRow: (id: number, dto: EditCalculatorDto) => void;
  handleShowStoreDetails?: (data: StoreModel) => void;
  handleShowEmployeeDetails: (employee: CalculatorModel) => void;
}

export const useTableColumns = ({
  handleAddRow,
  handleDeleteRow,
  handleUpdateRow,
  handleShowStoreDetails,
  handleShowEmployeeDetails,
}: Args) => {
  const tableColumns = useMemo(() => {
    const cols: CalculatorDataColumn[] = [
      {
        headerName: "Employee ID",
        field: "employeeId",
        align: "center",
        headCellClassName: styles.EmployeeIdColumn,
        bodyCellClassName: styles.EmployeeIdColumn,
        render: (data, options) => {
          if (!options || !options.searchableField)
            return (
              <Typography
                className="table-text-clickable"
                onClick={() => {
                  if (data) {
                    handleShowEmployeeDetails(data);
                  }
                }}
              >
                {data?.employeeId || "-"}
              </Typography>
            );

          return (
            <Autocomplete
              hideArrow
              key={Math.random()}
              fetch={async (search) => {
                const result = await EmployeesApi.fetchEmployees({
                  fields: ["id", "firstname", "surname"],
                  search,
                  sort: "id,asc",
                });
                return { data: result.data.result };
              }}
              inputProps={{
                id: "employeeId",
                placeholder: "Employee ID",
                name: `employeeId`,
                inputClassname: styles.TextField,
              }}
              debouncedSearch
              onChange={(
                event: React.ChangeEvent<{}>,
                selectedValue,
                reason
              ) => {
                if (reason === "select-option" && selectedValue?.id) {
                  handleAddRow(selectedValue.id);
                }
              }}
              getOptionSelected={(option, optionValue) =>
                optionValue.id === option.id
              }
              getOptionLabel={(option) => `${option.id}`}
            />
          );
        },
      },
      {
        headerName: "First Name",
        field: "firstname",
        align: "center",
        headCellClassName: styles.EmployeeNameColumn,
        bodyCellClassName: styles.EmployeeNameColumn,
        render: (data, options) => {
          if (!options || !options.searchableField)
            return (
              <Typography
                className="bold-text table-text-clickable"
                onClick={() => {
                  if (data) {
                    handleShowEmployeeDetails(data);
                  }
                }}
              >
                {data?.firstname || "-"}
              </Typography>
            );

          return (
            <Autocomplete
              hideArrow
              key={Math.random()}
              fetch={async (search) => {
                const result = await EmployeesApi.fetchEmployees({
                  fields: ["id", "firstname", "surname"],
                  search,
                  sort: "firstname,asc",
                });
                return { data: result.data.result };
              }}
              inputProps={{
                id: "firstname",
                placeholder: "First Name",
                name: `firstname`,
                inputClassname: styles.TextField,
              }}
              debouncedSearch
              onChange={(
                event: React.ChangeEvent<{}>,
                selectedValue,
                reason
              ) => {
                if (reason === "select-option" && selectedValue?.id) {
                  handleAddRow(selectedValue.id);
                }
              }}
              getOptionSelected={(option, optionValue) =>
                optionValue.id === option.id
              }
              getOptionLabel={(option) => option.firstname}
            />
          );
        },
      },
      {
        headerName: "Last Name",
        field: "surname",
        align: "center",
        headCellClassName: styles.EmployeeNameColumn,
        bodyCellClassName: styles.EmployeeNameColumn,
        render: (data, options) => {
          if (!options || !options.searchableField)
            return (
              <Typography
                className="bold-text table-text-clickable"
                onClick={() => {
                  if (data) {
                    handleShowEmployeeDetails(data);
                  }
                }}
              >
                {data?.surname || "-"}
              </Typography>
            );

          return (
            <Autocomplete
              hideArrow
              key={Math.random()}
              fetch={async (search) => {
                const result = await EmployeesApi.fetchEmployees({
                  fields: ["id", "firstname", "surname"],
                  search,
                  sort: "surname,asc",
                });
                return { data: result.data.result };
              }}
              inputProps={{
                id: "surname",
                placeholder: "Last Name",
                name: `surname`,
                inputClassname: styles.TextField,
              }}
              debouncedSearch
              onChange={(
                event: React.ChangeEvent<{}>,
                selectedValue,
                reason
              ) => {
                if (reason === "select-option" && selectedValue?.id) {
                  handleAddRow(selectedValue.id);
                }
              }}
              getOptionSelected={(option, optionValue) =>
                option.id === optionValue.id
              }
              getOptionLabel={(option) =>
                typeof option === "string" ? option : `${option.surname}`
              }
            />
          );
        },
      },
      {
        headerName: "DOB",
        field: "dateOfBirth",
        align: "center",
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.dateOfBirth
                ? moment(data.dateOfBirth).format("DD MMM YYYY")
                : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Location Name",
        field: "store.name",
        align: "center",
        headCellClassName: styles.LocationColumn,
        bodyCellClassName: styles.LocationColumn,
        render: (data, options) => {
          if (!options || !options.searchableField) {
            return (
              <Typography
                className="table-text-clickable"
                onClick={() => {
                  if (handleShowStoreDetails && data?.store) {
                    handleShowStoreDetails(data?.store);
                  }
                }}
              >
                {data?.store?.name || "-"}
              </Typography>
            );
          }

          return <LocationAutocomplete handleAddRow={handleAddRow} />;
        },
      },
      {
        headerName: "Job Title",
        field: "jobTitle",
        align: "center",
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.jobTitle || "-"}
            </Typography>
          );
        },
      },

      {
        headerName: "Age",
        field: "dateOfBirth",
        align: "center",
        reversedSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.dateOfBirth
                ? getOneDateItemDuration("year", new Date(data.dateOfBirth))
                : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Start Date",
        field: "joinDate",
        align: "center",
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.joinDate
                ? moment(data.joinDate).format("DD MMM YYYY")
                : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Length of Service",
        field: "lengthOfService",
        align: "center",
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.lengthOfService
                ? howAgoDateDifference(
                    moment(data.joinDate).startOf("day").toDate(),
                    moment(data.leaveDate || new Date())
                      .startOf("day")
                      .toDate()
                  )
                : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Salary (£)",
        field: "salary",
        align: "center",
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.salary ? `£${data.salary.toFixed(2)}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Stat Red Wkly (£)",
        field: "statRedWkly",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.statRedWkly ? `£${data.statRedWkly}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Weekly (£)",
        field: "weakly",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.weakly ? `£${data.weakly}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Red Wks Due",
        field: "redWksDue",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.redWksDue ? `${data.redWksDue}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Stat Redundancy (£)",
        field: "statRedundancy",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.statRedundancy ? `£${data.statRedundancy}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Notice Period (Weeks)",
        field: "noticePeriod",
        align: "center",
        disableSort: true,
        render: (data, options) => {
          if (!data || !options || !options.editableField)
            return <Typography className="table-text">-</Typography>;

          return (
            <EditableCellInput
              initialValue={`${data.noticePeriod || ""}`}
              placeholder="Notice Period"
              onChange={(newValue) => {
                handleUpdateRow(data.id, {
                  noticePeriod: parseInt(newValue),
                  unworkedNoticePeriod: data.unworkedNoticePeriod || null,
                });
              }}
            />
          );
        },
        bodyCellClassName: styles.NoticeCell,
        headCellClassName: styles.NoticeCell,
      },
      {
        headerName: "Unworked Notice Period",
        field: "unworkedNoticePeriod",
        align: "center",
        disableSort: true,
        bodyCellClassName: styles.NoticeCell,
        headCellClassName: styles.NoticeCell,
        render: (data, options) => {
          if (!data || !options || !options.editableField)
            return <Typography className="table-text">-</Typography>;

          return (
            <EditableCellInput
              initialValue={`${data.unworkedNoticePeriod || ""}`}
              placeholder="Unworked Notice Period"
              onChange={(newValue) => {
                handleUpdateRow(data.id, {
                  noticePeriod: data.noticePeriod || null,
                  unworkedNoticePeriod: parseInt(newValue),
                });
              }}
            />
          );
        },
      },
      {
        headerName: "PILON (£)",
        field: "pilon",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.pilon ? `£${data.pilon}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Grand Total (£)",
        field: "grandTotal",
        align: "center",
        disableSort: true,
        render: (data) => {
          return (
            <Typography className="table-text">
              {data?.grandTotal ? `£${data.grandTotal}` : "-"}
            </Typography>
          );
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        disableSort: true,
        align: "center",
        render: (data) => {
          if (!data) return null;
          return (
            <IconButton
              onClick={() => handleDeleteRow(data.id)}
              className={styles.DeleteBtn}
            >
              <DeleteIcon />
            </IconButton>
          );
        },
      },
    ];
    return cols;
  }, [
    handleAddRow,
    handleDeleteRow,
    handleShowEmployeeDetails,
    handleShowStoreDetails,
    handleUpdateRow,
  ]);
  return tableColumns;
};
