import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import { CaseTableModel } from "@models/cases.models";

export interface CasesState extends EntityState<CaseTableModel, number> {
  total: number;
  ui: {
    pagesCount: number;
  };
}

const initialState = {
  ui: { pagesCount: 0 },
  total: 0,
};

@StoreConfig({ name: "cases", idKey: "id" })
export class CasesStore extends EntityStore<CasesState> {
  constructor() {
    super(initialState);
  }
}

export const casesStore = new CasesStore();
