import { useCallback } from "react";
import { useHistory } from "react-router-dom";

import { useObservableState } from "observable-hooks";
import { storesQuery } from "@store/stores/stores.query";
import { StoreModel } from "@models/store.models";

import { StoresTable } from "./stores-table/stores-table";

const Stores: React.FC = () => {
  const history = useHistory();

  const [
    stores,
    { pagesCount: pagesCountStores, total: totalStores },
  ] = useObservableState(storesQuery.storesState$, [
    [],
    { total: 0, pagesCount: 0 },
  ]);

  const handleShowStoreDetails = useCallback(
    (store: StoreModel) => {
      // clear query params
      history.push(`/store-details/employees`, {
        store,
        backPath: history.location.pathname + history.location.search,
      });
    },
    [history]
  );

  return (
    <StoresTable
      stores={stores}
      pagesCount={pagesCountStores}
      total={totalStores}
      openStoreDetails={handleShowStoreDetails}
    />
  );
};

export default Stores;
