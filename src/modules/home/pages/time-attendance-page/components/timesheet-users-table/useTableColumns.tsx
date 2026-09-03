import { useMemo } from "react";
import { Typography } from "@material-ui/core";
import styles from "./timesheet-users-table.module.scss";
import { getRole } from "@utils/get-user-role";
import { TableColumn } from "@components/table/types";

import { MinUserDto } from "@models/users.models";

type UsersTableColumns = TableColumn<MinUserDto>[];

interface Args {
  handleViewClick: (user: MinUserDto) => void;
  formattedRange: string;
}
export const useTableColumns = ({ handleViewClick, formattedRange }: Args) => {
  const tableColumns = useMemo(() => {
    const cols: UsersTableColumns = [
      {
        headerName: "First Name",
        field: "firstname",
        align: "left",
        render: (data) => (
          <Typography className="table-text">{data.firstname}</Typography>
        ),
        headCellClassName: styles.NameColumn,
        bodyCellClassName: styles.NameColumn,
      },
      {
        headerName: "Last Name",
        field: "surname",
        align: "left",
        render: (data) => (
          <Typography className="table-text">{data.surname}</Typography>
        ),
        headCellClassName: styles.SurnameColumn,
        bodyCellClassName: styles.SurnameColumn,
      },
      {
        headerName: "Position",
        field: "role",
        align: "left",
        render: (data) => (
          <Typography className="table-text">{getRole(data.role)}</Typography>
        ),
      },
      {
        headerName: "Timesheet",
        field: "timesheet",
        disableSort: true,
        align: "left",
        render: (data) => (
          <Typography className="table-text">{formattedRange}</Typography>
        ),
      },
      {
        headerName: "Action",
        field: "actions",
        disableSort: true,
        align: "right",
        headCellClassName: styles.ActionColumn,
        bodyCellClassName: styles.ActionColumn,
        render: (data) => (
          <Typography
            className="table-view-text"
            onClick={() => handleViewClick(data)}
          >
            View
          </Typography>
        ),
      },
    ];
    return cols;
  }, [handleViewClick, formattedRange]);

  return tableColumns;
};
