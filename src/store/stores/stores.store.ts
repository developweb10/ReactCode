import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import { StoreModel } from "@models/store.models";

export interface StoreState extends EntityState<StoreModel, number> {
  total: number;
  ui: {
    pagesCount: number;
  };
}

const initialState = {
  ui: { pagesCount: 0 },
  total: 0,
};

@StoreConfig({ name: "stores" })
export class StoresStore extends EntityStore<StoreState> {
  constructor() {
    super(initialState);
  }
}

export const storesStore = new StoresStore();
