import { useMemo } from "react";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { ReactComponent as ViewIcon } from "@assets/images/view-icon.svg";
import { StoresTableColumns } from "./types";
import { StoreModel } from "@models/store.models";
import { Typography } from "@material-ui/core";
import styles from "./stores-table.module.scss";

import { ActionsMenu } from "@components/actions-menu/actions-menu";

interface Args {
  openStoreDetails: (data: StoreModel) => void;
  handleStoreEditClick: (data: StoreModel) => void;
  handleStoreDeleteClick: (data: StoreModel) => void;
}

export const useTableColumns = ({
  openStoreDetails,
  handleStoreEditClick,
  handleStoreDeleteClick,
}: Args) => {
  const tableColumns = useMemo(() => {
    const cols: StoresTableColumns = [
      {
        headerName: "Location Name",
        field: "name",
        align: "left",
        render: (data) => (
          <Typography
            className="bold-text table-text-clickable"
            onClick={() => {
              openStoreDetails(data);
            }}
          >
            {data.name}
          </Typography>
        ),
        bodyCellClassName: styles.ColumnStoreNameBody,
        headCellClassName: styles.ColumnStoreName,
      },
      {
        headerName: "Location Number",
        field: "id",
        align: "center",
        render: (data) => (
          <Typography
            className="bold-text table-text-clickable"
            onClick={() => {
              openStoreDetails(data);
            }}
          >
            {data.id}
          </Typography>
        ),
        bodyCellClassName: styles.ColumnLocationNo,
        headCellClassName: styles.ColumnLocationNo,
      },
      {
        headerName: "Location Contact Info",
        field: "contactInfo",
        align: "left",
        render: (data) => (
          <div className="table-cell-content">
            <Typography className="table-text-2">
              {data.contactInfo || "-"}
            </Typography>
          </div>
        ),
        bodyCellClassName: styles.ColumnLocationContactBody,
        headCellClassName: styles.ColumnLocationContact,
      },
      {
        headerName: "Location Phone",
        field: "mobileNumber",
        align: "center",
        render: (data) => (
          <Typography className="table-text">
            {data.mobileNumber || "-"}
          </Typography>
        ),
        bodyCellClassName: styles.ColumnLocationPhone,
        headCellClassName: styles.ColumnLocationPhone,
      },
      {
        headerName: "District Manager",
        field: "districtManager.name",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.isLineManager
              ? "-"
              : data?.districtManager?.name
              ? data.districtManager.name
              : "-"}
          </Typography>
        ),
        bodyCellClassName: styles.ColumnDistrictManager,
        headCellClassName: styles.ColumnDistrictManager,
      },
      {
        headerName: "Regional Manager",
        field: "regionalManager.name",
        align: "left",
        render: (data) => (
          <Typography className="table-text">
            {data.isLineManager
              ? "-"
              : data?.regionalManager?.name
              ? data.regionalManager.name
              : "-"}
          </Typography>
        ),
        bodyCellClassName: styles.ColumnRegionalManager,
        headCellClassName: styles.ColumnRegionalManager,
      },
      {
        headerName: "HR User",
        field: "hrManager.name",
        align: "left",
        render: (data) => (
          <Typography className="table-text">{data.hrManager.name}</Typography>
        ),
        bodyCellClassName: styles.ColumnHRManager,
        headCellClassName: styles.ColumnHRManager,
      },
      {
        headerName: "Actions",
        field: "actions",
        align: "right",
        disableSort: true,
        bodyCellClassName: styles.ColumnActions,
        headCellClassName: styles.ColumnActions,
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
                        View Location
                      </Typography>
                    </div>
                  ),
                  onClick: () => {
                    openStoreDetails(data);
                  },
                },
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
                              Edit Details
                            </Typography>
                          </div>
                        ),
                        onClick: () => {
                          handleStoreEditClick(data);
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
                              Remove Location
                            </Typography>
                          </div>
                        ),
                        onClick: () => {
                          handleStoreDeleteClick(data);
                        },
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ];
    return cols;
  }, [handleStoreDeleteClick, handleStoreEditClick, openStoreDetails]);
  return tableColumns;
};
