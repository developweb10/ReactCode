export interface TableColumn<T> {
  headerName: string;
  field: string;
  align: "inherit" | "left" | "center" | "right" | "justify";
  render: (entity: T) => string | number | JSX.Element | null;
  disableSort?: boolean;
  reversedSort?: boolean;
  bodyCellClassName?: string;
  headCellClassName?: string;
}
