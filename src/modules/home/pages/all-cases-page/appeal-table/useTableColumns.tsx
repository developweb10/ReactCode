import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { CasesTableColumns } from "../types";
import { Typography } from "@material-ui/core";
import styles from "./appeal-table.module.scss";
import classNames from "classnames";

import { ActionsMenu } from "@components/actions-menu/actions-menu";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { ReactComponent as ViewIcon } from "@assets/images/view-icon.svg";
import { Badge } from "@components/badge/badge";
import { CaseStatus, CaseTableModel } from "@models/cases.models";
import moment from "moment";
import { getCaseStatusByTab } from "../config/table-config";

interface Args {
  tab: number;
  handleCaseDeleteClick: (caseData: CaseTableModel) => void;
  handleCaseViewClick: (caseData: CaseTableModel, editMode?: boolean) => void;
}

export const useTableColumns = ({
  tab,
  handleCaseDeleteClick,
  handleCaseViewClick,
}: Args) => {
  const history = useHistory();

  const tableColumns = useMemo(() => {
    const closedColumns: CasesTableColumns = [
      {
        headerName: "Outcome",
        field: "outcome",
        align: "center",
        render: (data) => (
          <Typography className="table-text">{data.outcome.name}</Typography>
        ),
      },
      {
        headerName: "Closed Date",
        field: "statusUpdatedDate",
        align: "center",
        render: (data) => (
          <Typography className="table-text">
            {moment(data.statusUpdatedDate).format("DD MMM YYYY")}
          </Typography>
        ),
      },
    ];

    const cols: CasesTableColumns = [
      {
        headerName: "Case ID",
        field: "id",
        align: "center",
        render: (data) => (
          <Typography
            className="table-text-clickable"
            onClick={() => handleCaseViewClick(data)}
          >
            {data.id}
          </Typography>
        ),
        headCellClassName: styles.FirstColumn,
        bodyCellClassName: styles.FirstColumn,
      },
      {
        headerName: "First Name",
        field: "employee.firstname",
        align: "left",
        render: (data) => (
          <Typography
            className={classNames("table-text-clickable", "bold-text")}
            onClick={() => {
              history.push("/employees?employeeDetails", {
                employee: data.employee,
              });
            }}
          >
            {data.employee.firstname}
          </Typography>
        ),
      },
      {
        headerName: "Last Name",
        field: "employee.surname",
        align: "left",
        render: (data) => (
          <Typography
            className={classNames("table-text-clickable", "bold-text")}
            onClick={() => {
              history.push("/employees?employeeDetails", {
                employee: data.employee,
              });
            }}
          >
            {data.employee.surname}
          </Typography>
        ),
        headCellClassName: styles.SurnameColumn,
        bodyCellClassName: styles.SurnameColumn,
      },
      {
        headerName: "Position",
        field: "employee.jobTitle",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.employee.jobTitle}
          </Typography>
        ),
        headCellClassName: styles.PositionColumn,
        bodyCellClassName: styles.PositionColumn,
      },
      {
        headerName: "Location Name",
        field: "employee.store.name",
        align: "left",
        render: (data) => (
          <Typography
            className="table-text-clickable"
            onClick={() => {
              history.push(`/store-details/employees`, {
                store: data.employee.store,
                backPath: history.location.pathname + history.location.search,
              });
            }}
          >
            {data.employee.store?.name}
          </Typography>
        ),
        headCellClassName: styles.LocationNameColumn,
        bodyCellClassName: styles.LocationNameColumnBody,
      },
      {
        headerName: "District Manager",
        field: "employee.store.districtManager",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.employee.store?.districtManager.name}
          </Typography>
        ),
        headCellClassName: styles.DistrictColumn,
        bodyCellClassName: styles.DistrictColumn,
      },
      {
        headerName: "Reason For Appeal",
        field: "currentIssue",
        disableSort: true,
        align: "center",
        render: (data) => (
          <Typography
            className="table-view-text"
            onClick={() => handleCaseViewClick(data)}
          >
            View
          </Typography>
        ),
        headCellClassName: styles.ReasonColumn,
        bodyCellClassName: styles.ReasonColumn,
      },
      {
        headerName: "Date Of Appeal Hearing",
        field: "appealDate",
        align: "center",
        render: (data) => (
          <Typography className="table-text">
            {data.specificDetails.appealDate
              ? moment(data.specificDetails.appealDate).format("DD MMM YYYY")
              : "-"}
          </Typography>
        ),

        headCellClassName: styles.AppealDateColumn,
        bodyCellClassName: styles.AppealDateColumn,
      },

      ...(getCaseStatusByTab(tab) === CaseStatus.CLOSED ? closedColumns : []),
      {
        headerName: "Status",
        field: "status",
        align: "center",
        render: (data) => (
          <Badge
            className={styles.Badge}
            title={data.status === CaseStatus.OPEN ? "Open" : "Closed"}
            variant={data.status === CaseStatus.OPEN ? "success" : "error"}
          />
        ),
        headCellClassName: styles.StatusColumn,
        bodyCellClassName: styles.StatusColumn,
      },
      {
        headerName: "HR User",
        field: "hrUser",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.employee.store?.hrManager.name}
            {data.hrUser
              ? `, ${data.hrUser.firstname} ${data.hrUser.surname}`
              : null}
          </Typography>
        ),
        headCellClassName: styles.HRColumn,
        bodyCellClassName: styles.HRColumnBody,
      },
      {
        headerName: "Actions",
        field: "actions",
        disableSort: true,
        align: "center",
        render: (data) => (
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
                      View Case
                    </Typography>
                  </div>
                ),
                onClick: () => handleCaseViewClick(data),
              },
              {
                id: 2,
                content: () => (
                  <div className={styles.ActionsMenuItem}>
                    <div className={styles.ActionsMenuItemIconWrapper}>
                      <EditIcon />
                    </div>
                    <Typography className={styles.ActionsMenuItemText}>
                      Edit Case
                    </Typography>
                  </div>
                ),
                onClick: () => handleCaseViewClick(data, true),
              },
              {
                id: 3,
                content: () => (
                  <div className={styles.ActionsMenuItem}>
                    <div className={styles.ActionsMenuItemIconWrapper}>
                      <DeleteIcon />
                    </div>
                    <Typography className={styles.ActionsMenuItemText}>
                      Remove Case
                    </Typography>
                  </div>
                ),
                onClick: () => handleCaseDeleteClick(data),
              },
            ]}
          />
        ),
        headCellClassName: styles.ActionsColumn,
        bodyCellClassName: styles.ActionsColumn,
      },
    ];
    return cols;
  }, [tab, history, handleCaseDeleteClick, handleCaseViewClick]);
  return tableColumns;
};
