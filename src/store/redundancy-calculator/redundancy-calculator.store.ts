import { EntityStore, StoreConfig, EntityState } from "@datorama/akita";
import { CalculatorModel } from "@models/redundancy-calculator.models";

export interface CalculatorState extends EntityState<CalculatorModel, number> {
  total: number;
  ui: {
    pagesCount: number;
  };
}

const initialState = {
  ui: { pagesCount: 0 },
  total: 0,
};

@StoreConfig({ name: "redundancy-calculator", idKey: "id" })
export class CalculatorStore extends EntityStore<CalculatorState> {
  constructor() {
    super(initialState);
  }
}

export const calculatorStore = new CalculatorStore();
