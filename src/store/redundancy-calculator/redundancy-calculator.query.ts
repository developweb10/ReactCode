import { QueryEntity, combineQueries } from "@datorama/akita";

import {
  CalculatorStore,
  CalculatorState,
  calculatorStore,
} from "./redundancy-calculator.store";

export class CalculatorQuery extends QueryEntity<CalculatorState> {
  loading$ = this.selectLoading();

  calculatorState$ = combineQueries([
    this.selectAll(),
    this.select((state) => ({
      total: state.total,
      pagesCount: state.ui.pagesCount,
    })),
    this.selectLoading(),
  ]);

  constructor(protected store: CalculatorStore) {
    super(store);
  }
}

export const calculatorQuery = new CalculatorQuery(calculatorStore);
