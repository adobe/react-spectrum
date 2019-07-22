import {Transaction} from "./Transaction";
import { Rect } from "./Rect";
import { Size } from "./Size";
import { Point } from "./Point";
import { View } from "./View";
import {DropOperation} from './DropOperation';

// interface Point {
//   x: number,
//   y: number
// }

// interface Size {
//   width: number,
//   height: number
// }

// interface Rect extends Point, Size {}

// interface LayoutInfo {
//   type: string,
//   key: string,
//   rect: Rect,
//   isEstimatedSize: boolean,
//   opacity: number,
//   transform: string,
//   zIndex: number
// }

export interface InvalidationContext {
  contentChanged?: boolean,
  offsetChanged?: boolean,
  sizeChanged?: boolean,
  animated?: boolean,
  beforeLayout?(): void,
  afterLayout?(): void,
  afterAnimation?(): void,
  transaction?: Transaction
}

export interface Item {
  key?: string
}

export interface SelectableItem extends Item {
  isSelected?: boolean,
  isDisabled?: boolean
}

export interface Collection {
  getKeys(): Iterable<string>,
  getItem(key: string): Item,
}

export interface EditableCollection extends Collection {
  getItem(key: string): SelectableItem,
  update(key: string, item: SelectableItem): EditableCollection,
  insert(index: number, item: SelectableItem): EditableCollection,
  remove(key: string): EditableCollection,
  move(key: string, toIndex: number): EditableCollection
}

interface CollectionViewProps {
  onChange: (collection: Collection) => void
}

// interface Layout {
//   shouldInvalidate(rect: Rect): boolean,
//   validate(invalidationContext: InvalidationContext): void,
//   getVisibleLayoutInfos(rect: Rect): LayoutInfo[],
//   getLayoutInfo(type: string, key: string): LayoutInfo,
//   getDragTarget(point: Point): DragTarget,
//   getDropTarget(point: Point): DropTarget,
//   getInitialLayoutInfo(type: string, key: string): LayoutInfo,
//   getFinalLayoutInfo(type: string, key: string): LayoutInfo,
//   // remove change update handlers - not needed if not indexed
//   getLayoutInfoAbove(key: string): LayoutInfo,
//   getLayoutInfoBelow(key: string): LayoutInfo,
//   getLayoutInfoLeftOf(key: string): LayoutInfo,
//   getLayoutInfoRightOf(key: string): LayoutInfo,
//   getContentSize(): Size
// }

// interface ChangeEvent {
//   type: 'selection' | 'reorder' | 'delete',
//   keys: Set<string>,
//   collection: EditableCollection
// }

interface ScrollViewDelegate {
  getVisibleRect(): Rect;
  registerForVisibleRectUpdates(callback: (rect: Rect) => void): void,
  setContentSize(size: Size): void,
  setContentOffset(point: Point): void
}

export interface DragHandlerView extends View {
  dragStart(event: DragEvent): void,
  dragMoved(event: DragEvent, allowedOperations: DropOperation): DropOperation,
  dragEnd(event: DragEvent, operation: DropOperation): void,
  dragEntered(event: DragEvent, allowedOperations: DropOperation): DropOperation,
  dragExited(event: DragEvent): void,
  drop(event: DragEvent, operation: DropOperation): void
}

export interface Backend<T> {
  createView(view: View): T;
  registerDragEvents(view: DragHandlerView): void;
  unregisterDragEvents(view: DragHandlerView): void;
  setDragImage(event: DragEvent, view: View): void;
}

export interface BackendView<T> {
  getRenderContext(): any;
  render(backend: T): any;
  flushUpdates(fn?: () => void): void;
  forceStyleUpdate(): void;
  getRect(): Rect;
  getSize(): Size;
  getDOMNode(): HTMLElement;
  triggerEvent(event: string): void;
}
