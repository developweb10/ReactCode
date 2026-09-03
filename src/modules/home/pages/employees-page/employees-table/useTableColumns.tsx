import styles from "./employees-table.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { ReactComponent as ViewIcon } from "@assets/images/view-icon.svg";

import { useMemo } from "react";
import { ActionsMenu } from "@components/actions-menu/actions-menu";

import { Typography } from "@material-ui/core";

import moment from "moment";

import { EmployeesTableColumns } from "./types";
import { StoreModel } from "@models/store.models";
import { EmployeeModel } from "@models/employee.models";

import { howAgoDateDifference } from "@utils/dateUtils";

interface Args {
  selectedStore?: StoreModel;
  isLeaverTab: boolean;
  openEmployeeDefails: (employee: EmployeeModel) => void;
  openStoreDetails?: (data: StoreModel) => void;
  handleDeleteEmployee: (id: number) => void;
  handleDriverAction?: (employee: EmployeeModel) => void;
}

export const useTableColumns = ({
  isLeaverTab,
  selectedStore,
  openStoreDetails,
  openEmployeeDefails,
  handleDeleteEmployee,
  handleDriverAction,
}: Args) => {
  const isDriver = (jobTitle?: string) =>
    jobTitle === "Driver" || jobTitle === "Multi Drop Delivery Driver";

  const storeColumns: EmployeesTableColumns = useMemo(
    () => [
      {
        headerName: "Location Name",
        field: "store.name",
        align: "left",
        render: (data) => (
          <Typography
            className="table-text-clickable"
            onClick={() => {
              if (openStoreDetails && data.store) {
                openStoreDetails(data.store);
              }
            }}
          >
            {data.store ? data.store.name : "-"}
          </Typography>
        ),
      },
      {
        headerName: "Location No",
        field: "store.id",
        align: "center",
        render: (data) => (
          <Typography
            className="table-text-clickable"
            onClick={() => {
              if (openStoreDetails && data.store) {
                openStoreDetails(data.store);
              }
            }}
          >
            {data.store ? data.store.id : "-"}
          </Typography>
        ),
        headCellClassName: styles.LocationNoCell,
        bodyCellClassName: styles.LocationNoCell,
      },
    ],
    [openStoreDetails]
  );
  const storeManagerColumn: EmployeesTableColumns = useMemo(
    () => [
      {
        headerName:
          selectedStore?.isLineManager || ""
            ? "Line Manager"
            : "District Manager",
        field: "store.districtManager",
        align: "right",
        render: (data) => (
          <Typography className="table-text">
            {selectedStore?.districtManager?.name || ""}
          </Typography>
        ),
      },
    ],
    [selectedStore?.districtManager?.name, selectedStore?.isLineManager]
  );

  const leaverTabColumn: EmployeesTableColumns = useMemo(
    () => [
      {
        headerName: "Leave Date",
        field: "leaveDate",
        align: "center",
        render: (data: EmployeeModel) => {
          return (
            <Typography className="table-text">
              {data.leaveDate
                ? new Date(data.leaveDate).toLocaleDateString("en-gb", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </Typography>
          );
        },
      },
    ],
    []
  );

  const actionsColumn: EmployeesTableColumns = useMemo(
    () => [
      {
        headerName: "Actions",
        field: "actions",
        align: "right",
        disableSort: true,
        headCellClassName: styles.ActionsCell,
        bodyCellClassName: styles.ActionsCell,
        render: (data) => {
          return (
            <ActionsMenu
              options={[
                {
                  id: 1,
                  content: () => (
                    <div className={styles.ActionsMenuItem}>
                      <div className={styles.ActionsMenuItemIconWrapper}>
                        <ViewIcon />
                      </div>
                      <Typography className={styles.ActionsMenuItemText}>
                        View Employee
                      </Typography>
                    </div>
                  ),
                  onClick: () => {
                    openEmployeeDefails(data);
                  },
                },
              ...(isDriver(data.jobTitle) && handleDriverAction
                ? [
                    {
                      id: 99,
                      content: () => (
                        <div className={styles.ActionsMenuItem}>
                          <div className={styles.ActionsMenuItemIconWrapper}>🔑</div>
                          <Typography className={styles.ActionsMenuItemText}>
                            Send Password
                          </Typography>
                        </div>
                      ),
                      onClick: () => handleDriverAction(data),
                    },
                  ]
                : []),

                ...(data.isEditable
                  ? [
                      {
                        id: 2,
                        content: () => (
                          <div className={styles.ActionsMenuItem}>
                            <div className={styles.ActionsMenuItemIconWrapper}>
                              <EditIcon />
                            </div>
                            <Typography className={styles.ActionsMenuItemText}>
                              Edit Employee
                            </Typography>
                          </div>
                        ),
                        onClick: () => {
                          openEmployeeDefails(data);
                        },
                      },
                      {
                        id: 3,
                        content: () => (
                          <div className={styles.ActionsMenuItem}>
                            <div className={styles.ActionsMenuItemIconWrapper}>
                              <DeleteIcon />
                            </div>
                            <Typography className={styles.ActionsMenuItemText}>
                              Remove Employee
                            </Typography>
                          </div>
                        ),
                        onClick: () => {
                          handleDeleteEmployee(data.id);
                        },
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [handleDeleteEmployee, openEmployeeDefails]
  );

  const tableColumns = useMemo(() => {
    const cols: EmployeesTableColumns = [
      {
        headerName: "Employee ID",
        field: "id",
        align: "center",
        render: (data) => (
          <Typography
            onClick={() => {
              openEmployeeDefails(data);
            }}
            className="table-text-clickable"
          >
            {data.id}
          </Typography>
        ),
        headCellClassName: styles.ColumnIDCell,
        bodyCellClassName: styles.ColumnIDCell,
      },
      {
        headerName: "First Name",
        field: "firstname",
        align: "left",
        render: (data) => (
          <Typography
            className={classNames("table-text-clickable", "bold-text")}
            onClick={() => {
              openEmployeeDefails(data);
            }}
          >
            {data.firstname}
          </Typography>
        ),
        headCellClassName: styles.ColumnNameCell,
        bodyCellClassName: styles.ColumnNameCell,
      },
      {
        headerName: "Last Name",
        field: "surname",
        align: "left",
        render: (data) => (
          <Typography
            className={classNames("table-text-clickable", "bold-text")}
            onClick={() => {
              openEmployeeDefails(data);
            }}
          >
            {data.surname}
          </Typography>
        ),
        headCellClassName: styles.ColumnSurnameCell,
        bodyCellClassName: styles.ColumnSurnameCell,
      },
      {
        headerName: "Position",
        field: "jobTitle",
        align: "left",
        render: (data) => (
          <Typography className="table-text">{data.jobTitle || "-"}</Typography>
        ),
        headCellClassName: styles.ColumnPositionCell,
        bodyCellClassName: styles.ColumnPositionCell,
      },
      ...(!!selectedStore ? [] : storeColumns),
      {
        headerName: "Start Date",
        field: "joinDate",
        align: "center",
        render: (data) => (
          <Typography className="table-text">
            {data.joinDate
              ? new Date(data.joinDate).toLocaleDateString("en-gb", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </Typography>
        ),

        headCellClassName: styles.StartDateCell,
        bodyCellClassName: styles.StartDateCell,
      },
      ...(isLeaverTab ? leaverTabColumn : []),
      {
        headerName: "Length of Service",
        field: "lengthOfService",
        align: "left",
        render: (data: EmployeeModel) => {
          if (!data.lengthOfService) return "-";

          return (
            <Typography className="table-text">
              {howAgoDateDifference(
                moment(data.joinDate).startOf("day").toDate(),
                moment(data.leaveDate || new Date())
                  .startOf("day")
                  .toDate()
              ) || "-"}
            </Typography>
          );
        },
      },
      ...(!!selectedStore ? storeManagerColumn : []),
      ...actionsColumn,
    ];

    return cols;
  }, [
    selectedStore,
    storeColumns,
    isLeaverTab,
    leaverTabColumn,
    storeManagerColumn,
    actionsColumn,
    openEmployeeDefails,
  ]);
  return tableColumns;
};
