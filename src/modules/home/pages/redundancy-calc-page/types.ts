import { CalculatorModel } from "@models/redundancy-calculator.models";

interface CellRenderOptions {
  searchableField?: boolean;
  editableField?: boolean;
}

export interface CalculatorDataColumn {
  headerName: string;
  field: string;
  align: "inherit" | "left" | "center" | "right" | "justify";
  render: (
    entity?: CalculatorModel,
    options?: CellRenderOptions
  ) => string | number | JSX.Element | null;
  disableSort?: boolean;
  reversedSort?: boolean;
  bodyCellClassName?: string;
  headCellClassName?: string;
}
