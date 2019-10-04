export interface SelectionOptions {
  allowsSelection?: boolean,
  allowsMultipleSelection?: boolean,
  allowsEmptySelection?: boolean,
  typeToSelect?: boolean // ???
}

export interface MultipleSelectionBase extends SelectionOptions {
  selectedItems?: Array<any>,
  defaultSelectedItems?: Array<any>,
  onSelectionChange?: (selectedItems: Array<any>) => void
}

export interface SingleSelectionBase {
  allowsEmptySelection?: boolean,
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  typeToSelect?: boolean // or is it really typeToFocus?
}
