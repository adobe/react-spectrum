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

import {action} from '@storybook/addon-actions';
import {chain, mergeProps, useId} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import {DragPreview} from '../src';
import dropIndicatorStyles from '@adobe/spectrum-css-temp/components/dropindicator/vars.css';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {GridCollection, useGridState} from '@react-stately/grid';
import {Item} from '@react-stately/collections';
import {ItemDropTarget, Key} from '@react-types/shared';
import {ListDropTargetDelegate} from '@react-aria/dnd';
import {ListKeyboardDelegate} from '@react-aria/selection';
import React, {useRef} from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {useButton} from '@react-aria/button';
import {useDraggableCollection, useDraggableItem, useDropIndicator, useDroppableCollection} from '..';
import {useDraggableCollectionState, useDroppableCollectionState} from '@react-stately/dnd';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export function ReorderableGridExample(props) {
  let list = useListData({
    initialItems: props.items || [
      {id: '1', type: 'item', text: 'One'},
      {id: '2', type: 'item', text: 'Two'},
      {id: '3', type: 'item', text: 'Three'},
      {id: '4', type: 'item', text: 'Four'},
      {id: '5', type: 'item', text: 'Five'},
      {id: '6', type: 'item', text: 'Six'}
    ]
  });

  let onMove = (keys: Key[], target: ItemDropTarget) => {
    if (target.dropPosition === 'before') {
      list.moveBefore(target.key, keys);
    } else {
      list.moveAfter(target.key, keys);
    }
  };

  return (
    <ReorderableGrid items={list.items} onMove={onMove}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </ReorderableGrid>
  );
}

function ReorderableGrid(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let state = useListState(props);
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), ref);
  let gridState = useGridState({
    selectionMode: 'multiple',
    collection: React.useMemo(() => new GridCollection<object>({
      columnCount: 1,
      items: [...state.collection].map(item => ({
        ...item,
        childNodes: [{
          key: `cell-${item.key}`,
          type: 'cell',
          index: 0,
          value: null,
          level: 0,
          rendered: null,
          textValue: item.textValue,
          hasChildNodes: false,
          childNodes: []
        }]
      }))
    }), [state.collection])
  });

  // Use a random drag type so the items can only be reordered within this list and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);
  let preview = useRef(null);
  let dragState = useDraggableCollectionState({
    collection: gridState.collection,
    selectionManager: gridState.selectionManager,
    getItems(keys) {
      return [...keys].map(key => ({
        [dragType]: JSON.stringify(key)
      }));
    },
    preview,
    onDragStart: action('onDragStart'),
    onDragEnd: chain(action('onDragEnd'), props.onDragEnd)
  });
  useDraggableCollection({}, dragState, ref);

  let onDrop = async (e) => {
    if (e.target.type !== 'root' && e.target.dropPosition !== 'on' && props.onMove) {
      let keys: Array<Key> = [];
      for (let item of e.items) {
        if (item.kind === 'text' && item.types.has(dragType)) {
          let key = JSON.parse(await item.getText(dragType));
          keys.push(key);
        }
      }

      props.onMove(keys, e.target);
    }
  };

  let dropState = useDroppableCollectionState({
    collection: gridState.collection,
    selectionManager: gridState.selectionManager,
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel';
      }

      return 'move';
    },
    onDrop
  });

  let {collectionProps} = useDroppableCollection({
    keyboardDelegate,
    dropTargetDelegate: new ListDropTargetDelegate(state.collection, ref),
    onDropActivate: chain(action('onDropActivate'), console.log),
    onDrop
  }, dropState, ref);

  let {gridProps} = useGrid({
    ...props,
    'aria-label': 'Reorderable list',
    focusMode: 'cell'
  }, gridState, ref);

  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let dropRef = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'root'}
  }, dropState, dropRef);
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    <div
      {...mergeProps(collectionProps, gridProps)}
      ref={ref}
      className={classNames(dndStyles, 'droppable-collection', {'is-drop-target': isDropTarget})}>
      {!dropIndicatorProps['aria-hidden'] &&
        <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
          <div
            role="gridcell"
            aria-selected="false">
            <div {...visuallyHiddenProps} role="button" tabIndex={-1} {...dropIndicatorProps} ref={dropRef} />
          </div>
        </div>
      }
      {[...gridState.collection].map(item => (
        <>
          <InsertionIndicator
            key={item.key + '-before'}
            collectionRef={ref}
            target={{type: 'item', key: item.key, dropPosition: 'before'}}
            dropState={dropState} />
          <CollectionItem
            key={item.key}
            item={item}
            state={gridState}
            dragState={dragState}
            dropState={dropState} />
          {gridState.collection.getKeyAfter(item.key) == null &&
            <InsertionIndicator
              key={item.key + '-after'}
              target={{type: 'item', key: item.key, dropPosition: 'after'}}
              collectionRef={ref}
              dropState={dropState} />
          }
        </>
      ))}
      <DragPreview ref={preview}>
        {() => {
          let item = dragState.draggedKey == null ? null : state.collection.getItem(dragState.draggedKey);
          return (
            <div className={classNames(dndStyles, 'draggable', 'is-drag-preview', {'is-dragging-multiple': dragState.draggingKeys.size > 1})}>
              <div className={classNames(dndStyles, 'drag-handle')}>
                <ShowMenu size="XS" />
              </div>
              {item && <span>{item.rendered}</span>}
              {dragState.draggingKeys.size > 1 &&
                <div className={classNames(dndStyles, 'badge')}>{dragState.draggingKeys.size}</div>
              }
            </div>
          );
        }}
      </DragPreview>
    </div>
  );
}

function CollectionItem({item, state, dragState, dropState}) {
  let rowRef = React.useRef<HTMLDivElement | null>(null);
  let cellRef = React.useRef<HTMLDivElement | null>(null);
  let cellNode = [...item.childNodes][0];

  let {rowProps} = useGridRow({node: item}, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell',
    shouldSelectOnPressUp: true
  }, state, cellRef);

  let {dragProps, dragButtonProps} = useDraggableItem({key: item.key, hasDragButton: true}, dragState);

  let dragButtonRef = React.useRef<HTMLDivElement | null>(null);
  let {buttonProps} = useButton({
    ...dragButtonProps,
    elementType: 'div'
  }, dragButtonRef);

  let dropIndicatorRef = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'item', key: item.key, dropPosition: 'on'}
  }, dropState, dropIndicatorRef);
  let {visuallyHiddenProps} = useVisuallyHidden();
  let id = useId();

  return (
    <div {...mergeProps(rowProps, dragProps)} ref={rowRef} style={{outline: 'none'}} aria-labelledby={id}>
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...gridCellProps}
          aria-labelledby={id}
          ref={cellRef}
          className={classNames(dndStyles, 'draggable', 'droppable', {
            'is-dragging': dragState.isDragging(item.key),
            'is-drop-target': dropState.isDropTarget({type: 'item', key: item.key, dropPosition: 'on'}),
            'is-selected': state.selectionManager.isSelected(item.key)
          })}>
          <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
            <div
              {...buttonProps as React.HTMLAttributes<HTMLElement>}
              ref={dragButtonRef}
              className={classNames(dndStyles, 'drag-handle')}>
              <ShowMenu size="XS" />
            </div>
          </FocusRing>
          <span id={id}>{item.rendered}</span>
          {!dropIndicatorProps['aria-hidden'] &&
            <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={dropIndicatorRef} />
          }
        </div>
      </FocusRing>
    </div>
  );
}

function InsertionIndicator(props) {
  let ref = React.useRef(null);
  let {dropIndicatorProps} = useDropIndicator(props, props.dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
  if (!props.dropState.isDropTarget(props.target) && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false"
        className={props.dropState.isDropTarget(props.target)
        ? classNames(dropIndicatorStyles, 'spectrum-DropIndicator', 'spectrum-DropIndicator--horizontal')
        : undefined
      }
        style={{
          width: '100%',
          marginLeft: 0,
          height: 2,
          marginBottom: -2,
          outline: 'none'
        }}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
