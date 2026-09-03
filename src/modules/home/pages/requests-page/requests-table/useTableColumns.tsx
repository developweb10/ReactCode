import { useMemo } from "react";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { RequestsTableColumns } from "./types";
import {
  RequestModel,
  RequestType,
  RequestStatus,
} from "@models/requests.models";
import { Typography, IconButton } from "@material-ui/core";
import { Button } from "@components/button/button";
import { RequestStatusBadge } from "@components/request-status-badge/requests-status-badge";

import styles from "./requests-table.module.scss";
import classNames from "classnames";

import moment from "moment";
import { getRole } from "@utils/get-user-role";

interface Args {
  handleViewNoteOrReason: (text: string, label: string) => void;
  handleRequestApprove: (id: number) => void;
  handleRequestReject: (data: RequestModel) => void;
  handleEditRequest: (data: RequestModel) => void;
  handleDeleteRequest: (id: number) => void;
  isAdmin: boolean;
}

export const useTableColumns = ({
  handleViewNoteOrReason,
  handleRequestApprove,
  handleRequestReject,
  handleEditRequest,
  handleDeleteRequest,
  isAdmin,
}: Args) => {
  const actionsColumn: RequestsTableColumns = useMemo(() => {
    return [
      {
        headerName: "Actions",
        field: "actions",
        align: "right",
        render: (data) => (
          <div className={styles.RequestActions}>
            {data.status === RequestStatus.PENDING ? (
              <>
                <Button
                  className={classNames("button-primary", styles.ActionButton)}
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={() => handleRequestApprove(data.id)}
                >
                  Approve
                </Button>
                <Button
                  className={classNames("button-primary", styles.ActionButton)}
                  color="secondary"
                  variant="contained"
                  disableElevation
                  onClick={() => handleRequestReject(data)}
                >
                  Reject
                </Button>
              </>
            ) : (
              <>
                <IconButton
                  className={styles.EditButton}
                  onClick={() => handleEditRequest(data)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  className={styles.DeleteButton}
                  onClick={() => {
                    handleDeleteRequest(data.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </div>
        ),
        disableSort: true,
        bodyCellClassName: styles.RequestActionsCell,
      },
    ];
  }, [
    handleDeleteRequest,
    handleEditRequest,
    handleRequestApprove,
    handleRequestReject,
  ]);

  const tableColumns = useMemo(() => {
    const cols: RequestsTableColumns = [
      {
        headerName: "Request Type",
        field: "requestType",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.requestType === RequestType.HOLIDAY && "Holiday"}
            {data.requestType === RequestType.SICKNESS && "Sickness"}
          </Typography>
        ),

        headCellClassName: styles.RequestTypeHeader,
        bodyCellClassName: styles.RequestTypeHeader,
      },
      {
        headerName: "First Name",
        field: "user.firstname",
        align: "left",
        render: (data) => (
          <div className={styles.UserNameColumn}>
            <Typography className="table-text">
              {data.user.firstname}
            </Typography>
          </div>
        ),
      },
      {
        headerName: "Last Name",
        field: "user.surname",
        align: "left",
        render: (data) => (
          <div className={styles.UserSurnameColumn}>
            <Typography className="table-text">{data.user.surname}</Typography>
          </div>
        ),
      },
      {
        headerName: "User Role",
        field: "user.role",
        align: "left",
        render: (data) => (
          <div className={styles.UserRoleColumn}>
            <Typography className="table-text">
              {getRole(data.user.role)}
            </Typography>
          </div>
        ),
      },
      {
        headerName: "Date of Creation",
        field: "dateOfCreation",
        align: "left",

        render: (data) => (
          <Typography className="table-text">
            {moment(data.dateOfCreation).format("DD MMM YYYY")}
          </Typography>
        ),
      },
      {
        headerName: "Period",
        field: "startDate",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {`${moment(data.startDate).format("DD MMM")} -
    ${moment(data.endDate).format("DD MMM YYYY")}`}
          </Typography>
        ),
        bodyCellClassName: styles.PeriodCell,
        headCellClassName: styles.PeriodCell,
      },
      {
        headerName: "Note",
        field: "note",
        align: "center",
        render: (data) => (
          <Typography
            className={classNames(
              data.notes ? "table-view-text" : "table-text"
            )}
            onClick={() => {
              if (!!data.notes) {
                handleViewNoteOrReason(data.notes, "Note");
              }
            }}
          >
            {data.notes ? "View" : "-"}
          </Typography>
        ),
        disableSort: true,
      },
      {
        headerName: "Status",
        field: "status",
        align: "center",
        render: (data) => (
          <div className={styles.BadgeCellWrapper}>
            <RequestStatusBadge status={data.status} />
          </div>
        ),
      },
      {
        headerName: "Reason",
        field: "rejectedReason",
        align: "center",
        render: (data) => (
          <Typography
            className={classNames(
              data.rejectedReason ? "table-view-text" : "table-text"
            )}
            onClick={() => {
              if (!!data.rejectedReason) {
                handleViewNoteOrReason(data.rejectedReason, "Reason");
              }
            }}
          >
            {data.rejectedReason ? "View" : "-"}
          </Typography>
        ),
        disableSort: true,
        bodyCellClassName: styles.ReasonCell,
        headCellClassName: styles.ReasonCell,
      },
    ];
    return cols;
  }, [handleViewNoteOrReason]);

  if (isAdmin) {
    return tableColumns.concat(actionsColumn);
  }
  return tableColumns;
};
