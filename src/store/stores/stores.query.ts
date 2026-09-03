import { QueryEntity, combineQueries } from "@datorama/akita";

import { StoreState, StoresStore, storesStore } from "./stores.store";

export class StoresQuery extends QueryEntity<StoreState> {
  storesState$ = combineQueries([
    this.selectAll(),
    this.select((state) => ({
      total: state.total,
      pagesCount: state.ui.pagesCount,
    })),
  ]);

  loading$ = this.selectLoading();

  constructor(protected store: StoresStore) {
    super(store);
  }
}

export const storesQuery = new StoresQuery(storesStore);
