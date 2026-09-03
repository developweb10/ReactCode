import React, { useCallback, useMemo, useState, useEffect } from "react";
import RequestsIcon from "@assets/images/requests-yellow-icon.svg";
import styles from "./requests-table.module.scss";

import { requestsService } from "@store/requests/requests.service";
import { requestsQuery } from "@store/requests/requests.query";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";

import { RequestModel, RequestStatus } from "@models/requests.models";
import { UserAuthModel } from "@models/authorization.models";
import { UserRoleEnum } from "@models/users.models";

import { useTableControls } from "@hooks/useTableControls";

import { PageHeader } from "@components/page-header/page-header";
import { Table } from "@components/table/table";

import { useTableColumns } from "./useTableColumns";

interface RequestsTableProps {
  requests: RequestModel[];
  total: number;
  pagesCount: number;
  currentUser: UserAuthModel;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  total,
  pagesCount,
  currentUser,
}) => {
  // DATA FETCH CONTROL

  const [requestRequired, setRequestRequired] = useState(false);

  // TABLE STATE

  const isAdmin = useMemo(
    () => currentUser.role === UserRoleEnum.ROLE_ADMIN,
    [currentUser.role]
  );

  const {
    values: { page, size, sort },
    handlers: { handlePageChange, handleSizeChange, handleSortChange },
  } = useTableControls({
    onDataFetchRequired: () => {
      setRequestRequired(true);
    },
  });

  // MAIN FETCH FUNC

  const fetchRequestsData = useCallback(async () => {
    await requestsService.fetchRequests({
      size,
      page,
      sort,
    });
    setRequestRequired(false);
  }, [page, size, sort]);

  // DATA FETCH HOOK

  useEffect(() => {
    if (requestRequired) {
      fetchRequestsData();
    }
  }, [fetchRequestsData, requestRequired]);

  // ============= HANDLERS ===============

  const handleRequestApprove = useCallback((id: number) => {
    requestsService.updateRequestStatus(id, { status: RequestStatus.APPROVED });
  }, []);

  const handleRequestReject = useCallback((data: RequestModel) => {
    dialogManagerService.openDialog(DialogType.REJECT_REQUEST, {
      requestInfo: data,
    });
  }, []);

  const handleViewNoteOrReason = useCallback((text: string, label: string) => {
    dialogManagerService.openDialog(DialogType.VIEW_NOTE_OR_REASON, {
      content: {
        label,
        text,
        header: label,
      },
    });
  }, []);

  const handleEditRequest = useCallback((data: RequestModel) => {
    dialogManagerService.openDialog(DialogType.EDIT_REQUEST, {
      requestInfo: {
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        id: data.id,
        type: data.requestType,
        status: data.status,
      },
      user: data.user,
    });
  }, []);

  const handleDeleteRequest = useCallback((id: number) => {
    dialogManagerService.openDialog(DialogType.DELETE_REQUEST, {
      requestId: id,
      handleRefetch: () => {
        setRequestRequired(true);
      },
    });
  }, []);

  const columns = useTableColumns({
    handleViewNoteOrReason,
    handleRequestApprove,
    handleRequestReject,
    handleEditRequest,
    handleDeleteRequest,
    isAdmin,
  });

  return (
    <div className={styles.PageWrapper}>
      <PageHeader title="Requests" icon={RequestsIcon} />
      <div className="page-content">
        <Table
          id="requests-table"
          cols={columns}
          tableData={requests}
          loading$={requestsQuery.loading$}
          title="Requests"
          count={total}
          currentPage={page}
          pagesCount={pagesCount}
          onPagination={handlePageChange}
          currentSize={size}
          onSizeChanged={handleSizeChange}
          currentSort={sort}
          onSortChanged={handleSortChange}
        />
      </div>
    </div>
  );
};
