import { QueryEntity, combineQueries } from "@datorama/akita";

import { CasesStore, CasesState, casesStore } from "./cases.store";

export class CasesQuery extends QueryEntity<CasesState> {
  casesState$ = combineQueries([
    this.selectAll(),
    this.select((state) => ({
      total: state.total,
      pagesCount: state.ui.pagesCount,
    })),
  ]);

  loading$ = this.selectLoading();

  constructor(protected store: CasesStore) {
    super(store);
  }
}

export const casesQuery = new CasesQuery(casesStore);
