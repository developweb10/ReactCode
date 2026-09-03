import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { RequestModel } from "@models/requests.models";

export interface RequestState extends EntityState<RequestModel, number> {
  total: number;
  ui: {
    pagesCount: number;
  };
}

const initialState = {
  ui: { pagesCount: 0 },
  total: 0,
};

@StoreConfig({ name: "requests", idKey: "id" })
export class RequestsStore extends EntityStore<RequestState> {
  constructor() {
    super(initialState);
  }
}

export const requestsStore = new RequestsStore();
