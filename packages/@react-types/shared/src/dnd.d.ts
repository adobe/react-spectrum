import {ReactNode} from 'react';

export interface DndBase {
  dragDelegate?: DragDelegate,
  dropDelegate?: DropDelegate
}

export enum DropOperation {
  NONE = 0,
  MOVE = 1 << 0,
  COPY = 1 << 1,
  LINK = 1 << 2,
  ALL = MOVE | COPY | LINK
}

export enum DropPosition {
  ON = 1 << 0,
  BETWEEN = 1 << 1,
  ANY = ON | BETWEEN
}

export interface DragTarget {
  value: any
}

export interface DropTarget {
  value: null | any, // if null, represents the entire tree/table
  index: number, // todo: figure out tableview sections
  dropPosition: DropPosition
}

export interface DragDelegate {
  shouldAllowDrag(target: DragTarget): boolean,
  prepareDragData(target: DragTarget, dataTransfer: DataTransfer): void,
  getAllowedDropOperations(target: DropTarget): DropOperation,
  renderDragView(items: Array<any>): ReactNode,
  onDragEnd(target: DropTarget, dropOperation: DropOperation): void
}

export interface DropDelegate {
  shouldAcceptDrop(target: DropTarget, types: Set<string>): boolean,
  getAllowedDropPositions(target: DropTarget): DropPosition,
  overrideDropTarget(target: DropTarget): DropTarget,
  getDropOperation(target: DropTarget, allowedOperations: DropOperation): DropOperation,
  onDrop(target: DropTarget, dataTransfer: DataTransfer, dropOperation: DropOperation): void
}
