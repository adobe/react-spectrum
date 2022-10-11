/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key, RefObject} from 'react';

export interface DragDropEvent {
  /** The x coordinate of the event, relative to the target element. */
  x: number,
  /** The y coordinate of the event, relative to the target element. */
  y: number
}

export type DropOperation = 'copy' | 'link' | 'move' | 'cancel';

export interface DragItem {
  [type: string]: string
}

export interface DragStartEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragstart'
}

export interface DragMoveEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragmove'
}

export interface DragEndEvent extends DragDropEvent {
  /** The event type. */
  type: 'dragend',
  /** The drop operation that occurred. */
  dropOperation: DropOperation
}

export interface DropEnterEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropenter'
}

export interface DropMoveEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropmove'
}

export interface DropActivateEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropactivate'
}

export interface DropExitEvent extends DragDropEvent {
  /** The event type. */
  type: 'dropexit'
}

export interface TextItem {
  /** The item kind. */
  kind: 'text',
  /**
   * The drag types available for this item.
   * These are often mime types, but may be custom app-specific types.
   */
  types: Set<string>,
  /** Returns the data for the given type as a string. */
  getText(type: string): Promise<string>
}

export interface FileItem {
  /** The item kind. */
  kind: 'file',
  /** The file type (usually a mime type). */
  type: string,
  /** The file name. */
  name: string,
  /** Returns the contents of the file as a blob. */
  getFile(): Promise<File>,
  /** Returns the contents of the file as a string. */
  getText(): Promise<string>
}

export interface DirectoryItem {
  /** The item kind. */
  kind: 'directory',
  /** The directory name. */
  name: string,
  /** Returns the entries contained within the directory. */
  getEntries(): AsyncIterable<FileItem | DirectoryItem>
}

export type DropItem = TextItem | FileItem | DirectoryItem;

export interface DropEvent extends DragDropEvent {
  /** The event type. */
  type: 'drop',
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** The dropped items. */
  items: DropItem[]
}

export type DropPosition = 'on' | 'before' | 'after';
export interface RootDropTarget {
  /** The event type. */
  type: 'root'
}

export interface ItemDropTarget {
  /** The drop target type. */
  type: 'item',
  /** The item key. */
  key: Key,
  /** The drop position relative to the item. */
  dropPosition: DropPosition
}

export type DropTarget = RootDropTarget | ItemDropTarget;

export interface DroppableCollectionEnterEvent extends DropEnterEvent {
  /** The drop target. */
  target: DropTarget
}

export interface DroppableCollectionMoveEvent extends DropMoveEvent {
  /** The drop target. */
  target: DropTarget
}

export interface DroppableCollectionActivateEvent extends DropActivateEvent {
  /** The drop target. */
  target: DropTarget
}

export interface DroppableCollectionExitEvent extends DropExitEvent {
  /** The drop target. */
  target: DropTarget
}

export interface DroppableCollectionDropEvent extends DropEvent {
  /** The drop target. */
  target: DropTarget
}

interface DroppableCollectionInsertDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
   /** The drop target. */
  target: ItemDropTarget
}

interface DroppableCollectionRootDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation
}

interface DroppableCollectionOnItemDropEvent {
  /** The dropped items. */
  items: DropItem[],
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** Whether the drag originated within the same collection as the drop. */
  isInternal: boolean,
  /** The drop target. */
  target: ItemDropTarget
}

interface DroppableCollectionReorderEvent {
  /** The keys of the items that were reordered. */
  keys: Set<Key>,
  /** The drop operation that should occur. */
  dropOperation: DropOperation,
  /** The drop target. */
  target: ItemDropTarget
}

export interface DragTypes {
  /** Returns whether the drag contains data of the given type. */
  has(type: string | symbol): boolean
}

export interface DropTargetDelegate {
  /**
   * Returns a drop target within a collection for the given x and y coordinates.
   * The point is provided relative to the top left corner of the collection container.
   * A drop target can be checked to see if it is valid using the provided `isValidDropTarget` function.
   */
  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget | null
}

export interface DroppableCollectionUtilityOptions {
  /**
   * The drag types that the droppable collection accepts. If the collection accepts directories, include `DIRECTORY_DRAG_TYPE` in your array of allowed types.
   * @default 'all'
   */
  acceptedDragTypes?: 'all' | Array<string | symbol>,
  /**
   * Handler that is called when external items are dropped "between" items.
   */
  onInsert?: (e: DroppableCollectionInsertDropEvent) => void,
  /**
   * Handler that is called when external items are dropped on the droppable collection's root.
   */
  onRootDrop?: (e: DroppableCollectionRootDropEvent) => void,
  /**
   * Handler that is called when items are dropped "on" an item.
   */
  onItemDrop?: (e: DroppableCollectionOnItemDropEvent) => void,
  /**
   * Handler that is called when items are reordered via drag in the source collection.
   */
  onReorder?: (e: DroppableCollectionReorderEvent) => void,
  /**
   * A function returning whether a given target in the droppable collection is a valid "on" drop target for the current drag types.
   */
  shouldAcceptItemDrop?: (target: ItemDropTarget, types: DragTypes) => boolean
}

export interface DroppableCollectionBaseProps {
  /** Handler that is called when a valid drag enters a drop target. */
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void,
  /**
   * Handler that is called after a valid drag is held over a drop target for a period of time.
   * @private
   */
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void,
  /** Handler that is called when a valid drag exits a drop target. */
  onDropExit?: (e: DroppableCollectionExitEvent) => void,
  /**
   * Handler that is called when a valid drag is dropped on a drop target. When defined, this overrides other
   * drop handlers such as `onInsert`, and `onItemDrop`.
   */
  onDrop?: (e: DroppableCollectionDropEvent) => void,
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target.
   */
  getDropOperation?: (target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation
}

export interface DroppableCollectionProps extends DroppableCollectionUtilityOptions, DroppableCollectionBaseProps {}

interface DraggableCollectionStartEvent extends DragStartEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>
}

interface DraggableCollectionMoveEvent extends DragMoveEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>
}

interface DraggableCollectionEndEvent extends DragEndEvent {
  /** The keys of the items that were dragged. */
  keys: Set<Key>,
  /** Whether the drop ended within the same collection as it originated. */
  isInternal: boolean
}

export type DragPreviewRenderer = (items: DragItem[], callback: (node: HTMLElement) => void) => void;

export interface DraggableCollectionProps {
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DraggableCollectionStartEvent) => void,
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DraggableCollectionMoveEvent) => void,
  /** Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. */
  onDragEnd?: (e: DraggableCollectionEndEvent) => void,
  /** A function that returns the items being dragged. */
  getItems: (keys: Set<Key>) => DragItem[],
  /** The ref of the element that will be rendered as the drag preview while dragging. */
  preview?: RefObject<DragPreviewRenderer>,
  /** Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. */
  getAllowedDropOperations?: () => DropOperation[]
}
