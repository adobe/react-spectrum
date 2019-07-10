interface ItemOptions {
  key?: any;
  value?: any;
  isSelected?: boolean;
  isExpanded?: boolean;
  isDisabled?: boolean;
  hasChildren?: boolean;
  children?: Item[];
}

export class Item {
  key?: any;
  value?: any;
  isSelected: boolean;
  isExpanded: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  hasChildren: boolean;
  children: Item[];

  constructor(opts: ItemOptions, ...children: Item[]) {
    this.key = opts.key || opts.value;
    this.value = opts.value;
    this.isSelected = opts.isSelected || false;
    this.isExpanded = opts.isExpanded || false;
    this.isDisabled = opts.isDisabled || false;
    this.isLoading = false;
    this.children = opts.children || children;
    this.hasChildren = this.children.length > 0 || opts.hasChildren || false;
  }
}
