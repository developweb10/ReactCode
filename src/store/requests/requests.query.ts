import { QueryEntity, combineQueries } from "@datorama/akita";
import { RequestsStore, requestsStore, RequestState } from "./requests.store";

export class RequestsQuery extends QueryEntity<RequestState> {
  requestsState$ = combineQueries([
    this.selectAll(),
    this.select((state) => ({
      total: state.total,
      pagesCount: state.ui.pagesCount,
    })),
  ]);

  loading$ = this.selectLoading();

  constructor(protected store: RequestsStore) {
    super(store);
  }
}

export const requestsQuery = new RequestsQuery(requestsStore);
