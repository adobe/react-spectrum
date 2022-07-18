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
  // Relative to the target element's position
  x: number,
  y: number
}

export type DropOperation = 'copy' | 'link' | 'move' | 'cancel';

export interface DragItem {
  [type: string]: string
}

export interface DragStartEvent extends DragDropEvent {
  type: 'dragstart'
}

export interface DragMoveEvent extends DragDropEvent {
  type: 'dragmove'
}

export interface DragEndEvent extends DragDropEvent {
  type: 'dragend',
  dropOperation: DropOperation
}

export interface DropEnterEvent extends DragDropEvent {
  type: 'dropenter'
}

export interface DropMoveEvent extends DragDropEvent {
  type: 'dropmove'
}

export interface DropActivateEvent extends DragDropEvent {
  type: 'dropactivate'
}

export interface DropExitEvent extends DragDropEvent {
  type: 'dropexit'
}

export interface TextItem {
  kind: 'text',
  types: Set<string>,
  getText(type: string): Promise<string>
}

export interface FileItem {
  kind: 'file',
  type: string,
  name: string,
  getFile(): Promise<File>,
  getText(): Promise<string>
}

export interface DirectoryItem {
  kind: 'directory',
  name: string,
  getEntries(): AsyncIterable<FileItem | DirectoryItem>
}

export type DropItem = TextItem | FileItem | DirectoryItem;

export interface DropEvent extends DragDropEvent {
  type: 'drop',
  dropOperation: DropOperation,
  items: DropItem[]
}

export type DropPosition = 'on' | 'before' | 'after';
interface RootDropTarget {
  type: 'root'
}

export interface ItemDropTarget {
  type: 'item',
  key: Key,
  dropPosition: DropPosition
}

export type DropTarget = RootDropTarget | ItemDropTarget;

interface DroppableCollectionEnterEvent extends DropEnterEvent {
  target: DropTarget
}

interface DroppableCollectionMoveEvent extends DropMoveEvent {
  target: DropTarget
}

interface DroppableCollectionActivateEvent extends DropActivateEvent {
  target: DropTarget
}

interface DroppableCollectionExitEvent extends DropExitEvent {
  target: DropTarget
}

interface DroppableCollectionDropEvent extends DropEvent {
  target: DropTarget
}

export interface DragTypes {
  has(type: string): boolean
}

export interface DroppableCollectionProps {
  /**
   * A function returning the drop operation to be performed when items matching the given types are dropped
   * on the drop target.
   */
  getDropOperation?: (target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation,
  /** Handler that is called when a valid drag element enters the drop target. */
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void,
  /** Handler that is called when a valid drag element is moved within the drop target. */
  onDropMove?: (e: DroppableCollectionMoveEvent) => void,
  /** Handler that is called after a valid drag element is held over the drop target for a period of time. */
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void,
  /** Handler that is called when a valid drag element exits the drop target. */
  onDropExit?: (e: DroppableCollectionExitEvent) => void,
  /** Handler that is called when a valid drag element is dropped on the drop target. */
  onDrop?: (e: DroppableCollectionDropEvent) => void
}

interface DraggableCollectionStartEvent extends DragStartEvent {
  keys: Set<Key>
}

interface DraggableCollectionMoveEvent extends DragMoveEvent {
  keys: Set<Key>
}

interface DraggableCollectionEndEvent extends DragEndEvent {
  keys: Set<Key>
}

export type DragPreviewRenderer = (items: DragItem[], callback: (node: HTMLElement) => void) => void;

export interface DraggableCollectionProps {
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DraggableCollectionStartEvent) => void,
  /** Handler that is called when the dragged element is moved. */
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
