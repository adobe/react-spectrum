<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# Shared APIs

## Inputs
```typescript
interface InputBase {
  isDisabled?: boolean,
  isRequired?: boolean,
  validationState?: 'valid' | 'invalid',
  isReadOnly?: boolean,
  autoFocus?: boolean
}

interface ValueBase<T> {
  value?: T,
  defaultValue?: T,
  onChange?: (value: T, e?: Event) => void,
}

interface TextInputBase {
  placeholder?: string
}

interface RangeValue<T> {
  start: T,
  end: T
}

interface RangeInputBase<T> {
  minValue?: T,
  maxValue?: T,
  step?: T // ??
}

type LabelPosition = 'top' | 'side';
type Alignment = 'start' | 'end';
type NecessityIndicator = 'icon' | 'label';

interface Labelable {
  label?: ReactNode,
  isRequired?: boolean,
  labelPosition?: LabelPosition,
  labelAlign?: Alignment,
  necessityIndicator?: NecessityIndicator
}
```

## Selection

```javascript
interface SelectionOptions {
  allowsSelection?: boolean,
  allowsMultipleSelection?: boolean,
  allowsEmptySelection?: boolean,
  typeToSelect?: boolean // ???
}

interface MultipleSelectionBase extends SelectionOptions {
  selectedItems?: Array<any>,
  defaultSelectedItems?: Array<any>,
  onSelectionChange?: (selectedItems: Array<any>) => void
}

interface SingleSelectionBase {
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  typeToSelect?: boolean // or is it really typeToFocus?
}

```

## Drag and Drop
```javascript
interface DndBase {
  dragDelegate?: DragDelegate,
  dropDelegate?: DropDelegate
};

enum DropOperation {
  NONE = 0,
  MOVE = 1 << 0,
  COPY = 1 << 1,
  LINK = 1 << 2,
  ALL = MOVE | COPY | LINK
};

enum DropPosition {
  ON = 1 << 0,
  BETWEEN = 1 << 1,
  ANY = ON | BETWEEN
};

interface DragTarget {
  value: any
}

interface DropTarget {
  value: null | any, // if null, represents the entire tree/table
  index: number, // todo: figure out tableview sections
  dropPosition: DropPosition
}

// drag and drop + copy/paste
interface DataTransferDelegate {
  write?(dataTransfer: DataTransfer, items: any[]): void,
  read?(dataTransfer: DataTransfer): any[]
}

interface ClipboardDelegate {
  copy?(dataTransfer: DataTransfer, items: any[]): void,
  cut?(dataTransfer: DataTransfer, items: any[],
  paste?(dataTransfer: DataTransfer): void
}

interface DragDelegate {
  shouldAllowDrag?(target: DragTarget): boolean,
  prepareDragData(target: DragTarget, dataTransfer: DataTransfer): void,
  getAllowedDropOperations?(target: DropTarget): DropOperation,
  renderDragView(items: any[]) => ReactNode,
  onDragEnd?(target: DropTarget, dropOperation: DropOperation): void
}

interface DropDelegate {
  shouldAcceptDrop?(target: DropTarget, types: Set<string>): boolean,
  getAllowedDropPositions?(target: DropTarget): DropPosition, // NEW
  overrideDropTarget?(target: DropTarget): DropTarget,
  getDropOperation?(target: DropTarget, allowedOperations: DropOperation): DropOperation,
  onDropTargetChange?(target: DropTarget): void,
  onDrop(target: DropTarget, dataTransfer: DataTransfer, dropOperation: DropOperation): void,

  // TODO: what to do about this??
  onReorder?(items: any[], dropTarget: DropTarget, dropOperation: DropOperation): void
}
```
