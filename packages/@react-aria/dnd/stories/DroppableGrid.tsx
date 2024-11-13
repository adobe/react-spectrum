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

import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import dropIndicatorStyles from '@adobe/spectrum-css-temp/components/dropindicator/vars.css';
import {DroppableCollectionDropEvent} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {GridCollection, useGridState} from '@react-stately/grid';
import {Item} from '@react-stately/collections';
import {ListDropTargetDelegate} from '@react-aria/dnd';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useClipboard, useDropIndicator, useDroppableCollection} from '..';
import {useDroppableCollectionState} from '@react-stately/dnd';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface ListItem {
  id: string,
  type: string,
  text: string
}

export function DroppableGridExample(props) {
  let id = React.useRef(props.items?.length || 3);
  let list = useListData<ListItem>({
    initialItems: props.items || [
      {id: '1', type: 'folder', text: 'One'},
      {id: '2', type: 'item', text: 'Two'},
      {id: '3', type: 'folder', text: 'Three'}
    ]
  });

  let ref = React.useRef(null);

  let onDrop = async (e: DroppableCollectionDropEvent) => {
    if (props.onDrop) {
      props.onDrop(e);
    }

    if (e.target.type === 'root' || e.target.dropPosition !== 'on') {
      let items: ListItem[] = [];
      for (let item of e.items) {
        let type: string | undefined;
        if (item.kind === 'text') {
          if (item.types.has('folder')) {
            type = 'folder';
          } else if (item.types.has('item')) {
            type = 'item';
          } else if (item.types.has('text/plain')) {
            type = 'text/plain';
          }

          if (!type) {
            continue;
          }

          items.push({
            id: String(++id.current),
            type,
            text: await item.getText(type)
          });
        } else if (item.kind === 'file') {
          items.push({
            id: String(++id.current),
            type: 'file',
            text: item.name
          });
        } else if (item.kind === 'directory') {
          for await (let entry of item.getEntries()) {
            items.push({
              id: String(++id.current),
              type: entry.kind === 'directory' ? 'folder' : 'file',
              text: entry.name
            });
          }
        }
      }

      if (e.target.type === 'root') {
        list.prepend(...items);
      } else if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...items);
      } else {
        list.insertAfter(e.target.key, ...items);
      }
    }
  };

  return (
    <DroppableGrid {...props} items={list.items} onDrop={onDrop} ref={ref}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </DroppableGrid>
  );
}

const DroppableGrid = React.forwardRef(function (props: any, ref) {
  let domRef = React.useRef<HTMLDivElement>(null);
  let state = useListState(props);
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), domRef);
  let gridState = useGridState({
    selectionMode: 'multiple',
    focusMode: 'cell',
    selectedKeys: props.selectedKeys,
    onSelectionChange: props.onSelectionChange,
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

  React.useImperativeHandle(ref, () => ({
    focusItem(key) {
      gridState.selectionManager.setFocusedKey(`cell-${key}`);
      gridState.selectionManager.setFocused(true);
    }
  }));

  let defaultGetDropOperation = (target, items, allowedOperations) => {
    if (target.type === 'root') {
      return 'move';
    }

    if (target.key === '2' && target.dropPosition === 'on') {
      return 'cancel';
    }

    return target.dropPosition !== 'on' ? allowedOperations[0] : 'copy';
  };

  let dropState = useDroppableCollectionState({
    collection: gridState.collection,
    selectionManager: gridState.selectionManager,
    getDropOperation: props.getDropOperation || defaultGetDropOperation,
    onDropEnter: props.onDropEnter,
    onDropExit: props.onDropExit,
    onDrop: props.onDrop
  });

  let {collectionProps} = useDroppableCollection({
    keyboardDelegate,
    dropTargetDelegate: new ListDropTargetDelegate(gridState.collection, domRef),
    onDropActivate: props.onDropActivate,
    onDrop: props.onDrop
  }, dropState, domRef);

  let {gridProps} = useGrid({
    ...props,
    'aria-label': 'List',
    focusMode: 'cell'
  }, gridState, domRef);

  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let dropRef = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'root'}
  }, dropState, dropRef);
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    <div
      {...mergeProps(collectionProps, gridProps)}
      ref={domRef}
      className={classNames(dndStyles, 'droppable-collection', {'is-drop-target': isDropTarget})}
      style={props.style}
      data-droptarget={isDropTarget}
      role="grid">
      {!dropIndicatorProps['aria-hidden'] &&
        <div role="row">
          <div
            role="gridcell"
            aria-selected="false">
            <div {...visuallyHiddenProps} role="button" tabIndex={-1} {...dropIndicatorProps} ref={dropRef} />
          </div>
        </div>
      }
      {[...gridState.collection].map(item => (
        <React.Fragment key={item.key}>
          <InsertionIndicator
            key={item.key + '-before'}
            collectionRef={domRef}
            target={{type: 'item', key: item.key, dropPosition: 'before'}}
            dropState={dropState} />
          <CollectionItem
            key={item.key}
            item={item}
            state={gridState}
            dropState={dropState}
            onPaste={items => props.onDrop({target: {type: 'item', key: item.key, dropPosition: 'before'}, items})} />
          {state.collection.getKeyAfter(item.key) == null &&
            <InsertionIndicator
              key={item.key + '-after'}
              target={{type: 'item', key: item.key, dropPosition: 'after'}}
              collectionRef={domRef}
              dropState={dropState} />
          }
        </React.Fragment>
      ))}
    </div>
  );
});

function CollectionItem({item, state, dropState, onPaste}) {
  let rowRef = React.useRef<HTMLDivElement | null>(null);
  let cellRef = React.useRef<HTMLDivElement | null>(null);
  let cellNode = [...item.childNodes][0];

  let {rowProps} = useGridRow({node: item}, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, cellRef);

  let dropIndicatorRef = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'item', key: item.key, dropPosition: 'on'}
  }, dropState, dropIndicatorRef);
  let {visuallyHiddenProps} = useVisuallyHidden();

  let {clipboardProps} = useClipboard({
    onPaste
  });

  return (
    <div {...rowProps} ref={rowRef} style={{outline: 'none'}}>
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...mergeProps(gridCellProps, clipboardProps)}
          ref={cellRef}
          className={classNames(dndStyles, 'droppable', {
            'is-drop-target': dropState.isDropTarget({type: 'item', key: item.key, dropPosition: 'on'}),
            'is-selected': state.selectionManager.isSelected(item.key)
          })}>
          {item.rendered}
          {!dropIndicatorProps['aria-hidden'] &&
            <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={dropIndicatorRef} />
          }
        </div>
      </FocusRing>
    </div>
  );
}

function InsertionIndicator(props) {
  let ref = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator(props, props.dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
  if (!props.dropState.isDropTarget(props.target) && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']} style={{margin: '-5px 0'}}>
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
          outline: 'none'
        }}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
