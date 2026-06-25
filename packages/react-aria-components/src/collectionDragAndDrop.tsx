/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  DropIndicatorProps as AriaDropIndicatorProps,
  DropIndicatorAria,
  DroppableCollectionOptions,
  DroppableCollectionResult,
  DroppableItemResult,
  useDropIndicator,
  useDroppableCollection,
  useDroppableItem
} from 'react-aria/useDroppableCollection';
import {
  Collection,
  DragPreviewRenderer,
  DropActivateEvent,
  DropTargetDelegate,
  Key,
  Orientation,
  RefObject
} from '@react-types/shared';
import {DragAndDropHooks} from './useDragAndDrop';
import {
  DraggableCollectionState,
  useDraggableCollectionState
} from 'react-stately/useDraggableCollectionState';
import {
  DraggableItemResult,
  useDraggableCollection,
  useDraggableItem
} from 'react-aria/useDraggableCollection';
import {
  DroppableCollectionState,
  useDroppableCollectionState
} from 'react-stately/useDroppableCollectionState';
import {MultipleSelectionManager} from 'react-stately/useMultipleSelectionState';
import React, {JSX, ReactNode, useMemo, useRef} from 'react';

export type CollectionDragDropMode = 'none' | 'drag' | 'drop' | 'both';

export type DroppableOptionsFactory = (dropState: DroppableCollectionState) => {
  onDropActivate?: (e: DropActivateEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
};

export function getCollectionDragDropMode(hooks?: DragAndDropHooks): CollectionDragDropMode {
  if (!hooks?.isDraggable && !hooks?.isDroppable) {
    return 'none';
  }
  if (hooks.isDraggable && hooks.isDroppable) {
    return 'both';
  }
  if (hooks.isDraggable) {
    return 'drag';
  }
  return 'drop';
}

function resolveDroppableOptions(
  droppableOptions: CollectionDragDropStateProps<any>['droppableOptions'],
  dropState: DroppableCollectionState
) {
  if (typeof droppableOptions === 'function') {
    return droppableOptions(dropState);
  }
  return droppableOptions;
}

export function listDropTargetCollection(collection: Collection<any>): Collection<any> {
  return 'rows' in collection ? (collection as {rows: Collection<any>}).rows : collection;
}

export function configureDropTargetDelegate(
  delegate: DropTargetDelegate,
  configure?: (delegate: DropTargetDelegate) => DropTargetDelegate
): DropTargetDelegate {
  return configure ? configure(delegate) : delegate;
}

export function useCollectionDropTargetDelegate<T extends object>(
  props: CollectionDragDropStateInnerProps<T>,
  collection: Collection<any>,
  ref: RefObject<HTMLElement | null>
) {
  let {
    dragAndDropHooks,
    orientation = 'vertical',
    layout = 'stack',
    direction = 'ltr',
    ctxDropTargetDelegate,
    listDropTargetCollection: listDropTargetCollectionProp,
    dropTargetDelegate: dropTargetDelegateProp,
    configureDropTargetDelegate: configureDropTargetDelegateProp
  } = props;

  return useMemo(() => {
    if (dropTargetDelegateProp) {
      return dropTargetDelegateProp;
    }

    let dropTargetDelegate =
      dragAndDropHooks!.dropTargetDelegate ||
      ctxDropTargetDelegate ||
      new dragAndDropHooks!.ListDropTargetDelegate!(
        listDropTargetCollectionProp ?? collection,
        ref,
        {
          orientation,
          layout,
          direction
        }
      );

    if (configureDropTargetDelegateProp) {
      dropTargetDelegate = configureDropTargetDelegateProp(dropTargetDelegate);
    }

    return dropTargetDelegate;
  }, [
    dropTargetDelegateProp,
    configureDropTargetDelegateProp,
    dragAndDropHooks,
    ctxDropTargetDelegate,
    listDropTargetCollectionProp,
    collection,
    ref,
    orientation,
    layout,
    direction
  ]);
}

export interface CollectionDragDropStateValue {
  dragState?: DraggableCollectionState;
  dropState?: DroppableCollectionState;
  droppableCollection?: DroppableCollectionResult;
  isRootDropTarget: boolean;
  dragPreview: JSX.Element | null;
}

export interface CollectionDragDropStateProps<T extends object> {
  dragAndDropHooks?: DragAndDropHooks<T>;
  collection: Collection<any>;
  selectionManager: MultipleSelectionManager;
  ref: RefObject<HTMLElement | null>;
  keyboardDelegate: DroppableCollectionOptions['keyboardDelegate'];
  orientation?: Orientation;
  layout?: 'stack' | 'grid';
  direction?: 'ltr' | 'rtl';
  ctxDropTargetDelegate?: DropTargetDelegate;
  /** Optional override for the drop target delegate. */
  dropTargetDelegate?: DropTargetDelegate;
  /** Transform the default drop target delegate before use. */
  configureDropTargetDelegate?: (delegate: DropTargetDelegate) => DropTargetDelegate;
  /**
   * Collection used for ListDropTargetDelegate when no dropTargetDelegate is provided. Defaults to
   * `collection`.
   */
  listDropTargetCollection?: Collection<any>;
  /** Additional options passed to useDroppableCollection. */
  droppableOptions?:
    | {
        onDropActivate?: (e: DropActivateEvent) => void;
        onKeyDown?: (e: KeyboardEvent) => void;
      }
    | DroppableOptionsFactory;
  children: (state: CollectionDragDropStateValue) => ReactNode;
}

interface CollectionDragDropStateInnerProps<
  T extends object
> extends CollectionDragDropStateProps<T> {
  mode: 'drag' | 'drop' | 'both';
}

function CollectionDragDropStateBoth<T extends object>(
  props: CollectionDragDropStateInnerProps<T>
) {
  let {
    dragAndDropHooks,
    collection,
    selectionManager,
    ref,
    keyboardDelegate,
    droppableOptions,
    children
  } = props;
  let preview = useRef<DragPreviewRenderer>(null);
  let dragState = useDraggableCollectionState({
    collection,
    selectionManager,
    preview: dragAndDropHooks!.renderDragPreview ? preview : undefined,
    ...dragAndDropHooks!
  });
  useDraggableCollection({}, dragState, ref);

  let DragPreviewComponent = dragAndDropHooks!.DragPreview!;
  let dragPreview = dragAndDropHooks!.renderDragPreview ? (
    <DragPreviewComponent ref={preview}>{dragAndDropHooks!.renderDragPreview}</DragPreviewComponent>
  ) : null;

  let dropState = useDroppableCollectionState({
    collection,
    selectionManager,
    ...dragAndDropHooks!
  });

  let dropTargetDelegate = useCollectionDropTargetDelegate(props, collection, ref);
  let droppableCollection = useDroppableCollection(
    {
      keyboardDelegate,
      dropTargetDelegate,
      ...dragAndDropHooks!,
      ...resolveDroppableOptions(droppableOptions, dropState)
    },
    dropState,
    ref
  );

  return children({
    dragState,
    dropState,
    droppableCollection,
    isRootDropTarget: dropState.isDropTarget({type: 'root'}),
    dragPreview
  });
}

function CollectionDragDropStateDrag<T extends object>({
  dragAndDropHooks,
  collection,
  selectionManager,
  ref,
  children
}: CollectionDragDropStateInnerProps<T>) {
  let preview = useRef<DragPreviewRenderer>(null);
  let dragState = useDraggableCollectionState({
    collection,
    selectionManager,
    preview: dragAndDropHooks!.renderDragPreview ? preview : undefined,
    ...dragAndDropHooks!
  });
  useDraggableCollection({}, dragState, ref);

  let DragPreviewComponent = dragAndDropHooks!.DragPreview!;
  let dragPreview = dragAndDropHooks!.renderDragPreview ? (
    <DragPreviewComponent ref={preview}>{dragAndDropHooks!.renderDragPreview}</DragPreviewComponent>
  ) : null;

  return children({
    dragState,
    dropState: undefined,
    droppableCollection: undefined,
    isRootDropTarget: false,
    dragPreview
  });
}

function CollectionDragDropStateDrop<T extends object>(
  props: CollectionDragDropStateInnerProps<T>
) {
  let {
    dragAndDropHooks,
    collection,
    selectionManager,
    ref,
    keyboardDelegate,
    droppableOptions,
    children
  } = props;
  let dropState = useDroppableCollectionState({
    collection,
    selectionManager,
    ...dragAndDropHooks!
  });

  let dropTargetDelegate = useCollectionDropTargetDelegate(props, collection, ref);
  let droppableCollection = useDroppableCollection(
    {
      keyboardDelegate,
      dropTargetDelegate,
      ...dragAndDropHooks!,
      ...resolveDroppableOptions(droppableOptions, dropState)
    },
    dropState,
    ref
  );

  return children({
    dragState: undefined,
    dropState,
    droppableCollection,
    isRootDropTarget: dropState.isDropTarget({type: 'root'}),
    dragPreview: null
  });
}

export function CollectionDragDropState<T extends object>(props: CollectionDragDropStateProps<T>) {
  let mode = getCollectionDragDropMode(props.dragAndDropHooks);
  if (mode === 'none') {
    return props.children({
      dragState: undefined,
      dropState: undefined,
      droppableCollection: undefined,
      isRootDropTarget: false,
      dragPreview: null
    });
  }

  return <CollectionDragDropStateInner {...props} mode={mode} />;
}

function CollectionDragDropStateInner<T extends object>(
  props: CollectionDragDropStateProps<T> & {mode: 'drag' | 'drop' | 'both'}
) {
  switch (props.mode) {
    case 'both':
      return <CollectionDragDropStateBoth {...props} />;
    case 'drag':
      return <CollectionDragDropStateDrag {...props} />;
    case 'drop':
      return <CollectionDragDropStateDrop {...props} />;
  }
}

export type ItemDragDropMode = 'none' | 'drag' | 'drop' | 'both';

export function getItemDragDropMode(
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
): ItemDragDropMode {
  if (dragState && dropState) {
    return 'both';
  }
  if (dragState) {
    return 'drag';
  }
  if (dropState) {
    return 'drop';
  }
  return 'none';
}

export interface CollectionItemDragDropResult {
  draggableItem?: DraggableItemResult;
  droppableItem?: DroppableItemResult;
}

interface CollectionItemDragDropProps {
  mode: ItemDragDropMode;
  itemKey: Key;
  hasAction?: boolean;
  hasDragButton?: boolean;
  dragState?: DraggableCollectionState;
  dropState?: DroppableCollectionState;
  ref: RefObject<HTMLElement | null>;
  children: (result: CollectionItemDragDropResult) => ReactNode;
}

function CollectionItemDragDropBoth({
  itemKey,
  hasAction,
  hasDragButton,
  dragState,
  dropState,
  ref,
  children
}: Omit<CollectionItemDragDropProps, 'mode'>) {
  let draggableItem = useDraggableItem({key: itemKey, hasAction, hasDragButton}, dragState!);
  let droppableItem = useDroppableItem(
    {target: {type: 'item', key: itemKey, dropPosition: 'on'}},
    dropState!,
    ref
  );
  return children({draggableItem, droppableItem});
}

function CollectionItemDragDropDrag({
  itemKey,
  hasAction,
  hasDragButton,
  dragState,
  children
}: Omit<CollectionItemDragDropProps, 'mode' | 'dropState' | 'ref'>) {
  let draggableItem = useDraggableItem({key: itemKey, hasAction, hasDragButton}, dragState!);
  return children({draggableItem});
}

function CollectionItemDragDropDrop({
  itemKey,
  dropState,
  ref,
  children
}: Omit<CollectionItemDragDropProps, 'mode' | 'dragState' | 'hasAction'>) {
  let droppableItem = useDroppableItem(
    {target: {type: 'item', key: itemKey, dropPosition: 'on'}},
    dropState!,
    ref
  );
  return children({droppableItem});
}

export function CollectionItemDragDrop(props: CollectionItemDragDropProps) {
  switch (props.mode) {
    case 'both':
      return <CollectionItemDragDropBoth {...props} />;
    case 'drag':
      return <CollectionItemDragDropDrag {...props} />;
    case 'drop':
      return <CollectionItemDragDropDrop {...props} />;
    default:
      return props.children({});
  }
}

export interface CollectionDropIndicatorResult {
  dropIndicatorProps: DropIndicatorAria['dropIndicatorProps'];
  isHidden: boolean;
  isDropTarget: boolean;
}

interface CollectionDropIndicatorProps {
  props: AriaDropIndicatorProps;
  dropState: DroppableCollectionState;
  ref: RefObject<HTMLElement | null>;
  children: (result: CollectionDropIndicatorResult) => ReactNode;
}

export function CollectionDropIndicator({
  props,
  dropState,
  ref,
  children
}: CollectionDropIndicatorProps) {
  let {dropIndicatorProps, isHidden, isDropTarget} = useDropIndicator(props, dropState, ref);
  return children({dropIndicatorProps, isHidden, isDropTarget});
}
