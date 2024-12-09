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
import {chain, mergeProps, useId} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import {DragPreview} from '../src';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {GridCollection, useGridState} from '@react-stately/grid';
import {Item} from '@react-stately/collections';
import React, {useRef} from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {useButton} from '@react-aria/button';
import {useDraggableCollection, useDraggableItem} from '..';
import {useDraggableCollectionState} from '@react-stately/dnd';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';

interface ItemValue {
  id: string,
  type: string,
  text: string
}

export function DraggableCollectionExample(props) {
  let list = useListData({
    initialItems: [
      {id: 'foo', type: 'folder', text: 'Foo'},
      {id: 'bar', type: 'folder', text: 'Bar'},
      {id: 'baz', type: 'item', text: 'Baz'}
    ]
  });

  let onDragEnd = (e) => {
    if (e.dropOperation === 'move') {
      list.remove(...e.keys);
    }
  };

  return (
    <DraggableCollection {...props} items={list.items} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} onDragEnd={chain(onDragEnd, props.onDragEnd)}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </DraggableCollection>
  );
}

function DraggableCollection(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let state = useListState<ItemValue>(props);
  let gridState = useGridState({
    selectionMode: 'multiple',
    collection: React.useMemo(() => new GridCollection<ItemValue>({
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

  let preview = useRef(null);
  let dragState = useDraggableCollectionState({
    collection: gridState.collection,
    selectionManager: gridState.selectionManager,
    getItems(keys) {
      return [...keys].map(key => {
        let item = gridState.collection.getItem(key)!;

        return {
          [item.value!.type]: item.textValue,
          'text/plain': item.textValue
        };
      }).filter(item => item != null);
    },
    preview,
    onDragStart: props.onDragStart,
    onDragMove: props.onDragMove,
    onDragEnd: props.onDragEnd
  });
  useDraggableCollection({}, dragState, ref);

  let {gridProps} = useGrid({
    ...props,
    'aria-label': 'Draggable list',
    focusMode: 'cell'
  }, gridState, ref);

  return (
    <div
      ref={ref}
      {...gridProps}
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
      {[...gridState.collection].map(item => (
        <DraggableCollectionItem
          key={item.key}
          item={item}
          state={gridState}
          dragState={dragState} />
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

function DraggableCollectionItem({item, state, dragState}) {
  let rowRef = React.useRef<HTMLDivElement | null>(null);
  let cellRef = React.useRef<HTMLDivElement | null>(null);
  let cellNode = [...item.childNodes][0];
  let isSelected = state.selectionManager.isSelected(item.key);

  let {rowProps} = useGridRow({node: item}, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell',
    shouldSelectOnPressUp: true
  }, state, cellRef);

  let {dragProps, dragButtonProps} = useDraggableItem({key: item.key, hasDragButton: true}, dragState);

  let buttonRef = React.useRef<HTMLDivElement | null>(null);
  let {buttonProps} = useButton({
    ...dragButtonProps,
    elementType: 'div'
  }, buttonRef);
  let id = useId();

  return (
    <div {...rowProps} ref={rowRef} aria-labelledby={id}>
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...mergeProps(gridCellProps, dragProps)}
          aria-labelledby={id}
          ref={cellRef}
          className={classNames(dndStyles, 'draggable', {
            'is-dragging': dragState.isDragging(item.key),
            'is-selected': isSelected
          })}>
          <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
            <div
              {...buttonProps}
              ref={buttonRef}
              className={classNames(dndStyles, 'drag-handle')}>
              <ShowMenu size="XS" />
            </div>
          </FocusRing>
          <span id={id}>{item.rendered}</span>
        </div>
      </FocusRing>
    </div>
  );
}
