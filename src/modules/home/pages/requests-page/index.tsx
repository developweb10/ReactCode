import React from "react";
import { useObservableState } from "observable-hooks";
import { useObservable } from "@libreact/use-observable";

import { requestsQuery } from "@store/requests/requests.query";
import { authorizationQuery } from "@store/authorization/authorization.query";

import { RequestsTable } from "./requests-table/requests-table";

const RequestsPage: React.FC = () => {
  const [
    requests,
    { pagesCount, total },
  ] = useObservableState(requestsQuery.requestsState$, [
    [],
    { total: 0, pagesCount: 0 },
  ]);

  const [currentUser] = useObservable(authorizationQuery.user$);

  return (
    <RequestsTable
      requests={requests}
      total={total}
      pagesCount={pagesCount}
      currentUser={currentUser!}
    />
  );
};

export default RequestsPage;
