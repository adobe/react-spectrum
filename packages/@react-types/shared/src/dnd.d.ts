import {ReactNode, Key} from 'react';

export interface DndBase {
  dragDelegate?: DragDelegate,
  dropDelegate?: DropDelegate
}

// TODO: move this somewhere - enums in .d.ts files don't work well
export enum DropOperation {
  /** The drop is not allowed. */
  NONE = 0,

  /** The dropped data can be moved between the source and destination. */
  MOVE = 1 << 0,

  /** The dropped data can be copied between the source and destination. */
  COPY = 1 << 1,

  /** The dropped data can be shared between the source and destination. */
  LINK = 1 << 2,

  /** All types of drops are allowed. */
  ALL = MOVE | COPY | LINK
}

export enum DropPosition {
  ON = 1 << 0,
  BETWEEN = 1 << 1,
  ANY = ON | BETWEEN
}

export interface DragTarget {
  /** The type of view being dragged */
  type: string,

  /** The key of the view being dragged */
  key: Key
}

export interface DropTarget {
  /** The type of view being dropped on or between. */
  type: string,

  /** 
   * The key of the view being dropped on or between. 
   * If null, it represents the entire collection view.
   */
  key: Key | null

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
