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
import {chain} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import dropIndicatorStyles from '@adobe/spectrum-css-temp/components/dropindicator/vars.css';
import {DroppableCollectionDropEvent} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {Item} from '@react-stately/collections';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useDropIndicator, useDroppableCollection} from '..';
import {useDroppableCollectionState} from '@react-stately/dnd';
import {useListBox, useOption} from '@react-aria/listbox';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export function DroppableGridExample(props) {
  let id = React.useRef(props.items?.length || 3);
  let list = useListData({
    initialItems: props.items || [
      {id: '1', type: 'folder', text: 'One'},
      {id: '2', type: 'item', text: 'Two'},
      {id: '3', type: 'folder', text: 'Three'}
    ]
  });

  let onDrop = async (e: DroppableCollectionDropEvent) => {
    let data = JSON.parse(await e.items[0].getData() as string);
    if (e.target.type === 'root' || e.target.dropPosition !== 'on') {
      let items = data.map(item => ({
        id: String(++id.current),
        type: 'item',
        text: item
      }));

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
    <DroppableGrid items={list.items} onDrop={onDrop}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </DroppableGrid>
  );
}

function DroppableGrid(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let onDrop = action('onDrop');
  let state = useListState({...props, selectionMode: 'multiple'});
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), ref);

  let dropState = useDroppableCollectionState({
    collection: state.collection,
    getDropOperation(target, types, allowedOperations) {
      if (target.type === 'root') {
        return 'move';
      }

      if (target.key === '2' && target.dropPosition === 'on') {
        return 'cancel';
      }

      return target.dropPosition !== 'on' ? allowedOperations[0] : 'copy';
    }
  });

  let {collectionProps} = useDroppableCollection({
    keyboardDelegate,
    onDropEnter: chain(action('onDropEnter'), console.log),
    // onDropMove: action('onDropMove'),
    onDropExit: chain(action('onDropExit'), console.log),
    onDropActivate: chain(action('onDropActivate'), console.log),
    onDrop: async e => {
      onDrop(e);
      props.onDrop?.(e);
    },
    getDropTargetFromPoint(x, y) {
      let rect = ref.current.getBoundingClientRect();
      x += rect.x;
      y += rect.y;
      let closest = null;
      let closestDistance = Infinity;
      let closestDir = null;

      for (let child of ref.current.children) {
        if (!(child as HTMLElement).dataset.key) {
          continue;
        }

        let r = child.getBoundingClientRect();
        let points: [number, number, string][] = [
          [r.left, r.top, 'before'],
          [r.right, r.top, 'before'],
          [r.left, r.bottom, 'after'],
          [r.right, r.bottom, 'after']
        ];

        for (let [px, py, dir] of points) {
          let dx = px - x;
          let dy = py - y;
          let d = dx * dx + dy * dy;
          if (d < closestDistance) {
            closestDistance = d;
            closest = child;
            closestDir = dir;
          }
        }

        if (y >= r.top + 10 && y <= r.bottom - 10) {
          closestDir = 'on';
        }
      }

      let key = closest?.dataset.key;
      if (key) {
        return {
          type: 'item',
          key,
          dropPosition: closestDir
        };
      }
    }
  }, dropState, ref);

  let {listBoxProps} = useListBox({
    ...props,
    'aria-label': 'List',
    keyboardDelegate
  }, state, ref);

  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let dropRef = React.useRef();
  let {dropIndicatorProps} = useDropIndicator({
    collection: state.collection,
    target: {type: 'root'}
  }, dropState, dropRef);

  return (
    <div
      {...mergeProps(collectionProps, listBoxProps)}
      ref={ref}
      className={classNames(dndStyles, 'droppable-collection', {'is-drop-target': isDropTarget})}
      role="grid">
      <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
        <div
          role="gridcell"
          aria-selected="false">
          <div {...useVisuallyHidden().visuallyHiddenProps} role="button" tabIndex={-1} {...dropIndicatorProps} ref={dropRef} />
        </div>
      </div>
      {[...state.collection].map(item => (
        <>
          <InsertionIndicator
            key={item.key + '-before'}
            collection={state.collection}
            collectionRef={ref}
            target={{type: 'item', key: item.key, dropPosition: 'before'}}
            dropState={dropState} />
          <CollectionItem
            key={item.key}
            item={item}
            state={state}
            dropState={dropState} />
          {state.collection.getKeyAfter(item.key) == null &&
            <InsertionIndicator
              key={item.key + '-after'}
              collection={state.collection}
              target={{type: 'item', key: item.key, dropPosition: 'after'}}
              collectionRef={ref}
              dropState={dropState} />
          }
        </>
      ))}
    </div>
  );
}

function CollectionItem({item, state, dropState}) {
  let ref = React.useRef();
  let {optionProps} = useOption({
    key: item.key,
    isSelected: state.selectionManager.isSelected(item.key)
  }, state, ref);

  let buttonRef = React.useRef();
  let {dropIndicatorProps} = useDropIndicator({
    collection: state.collection,
    target: {type: 'item', key: item.key, dropPosition: 'on'}
  }, dropState, buttonRef);

  return (
    <div role="row" data-key={item.key} style={{margin: '4px 0'}}>
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...mergeProps(optionProps)}
          ref={ref}
          className={classNames(dndStyles, 'droppable', {
            'is-drop-target': dropState.isDropTarget({type: 'item', key: item.key, dropPosition: 'on'}),
            'is-selected': state.selectionManager.isSelected(item.key)
          })}
          role="gridcell">
          <div {...useVisuallyHidden().visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
          {item.rendered}
        </div>
      </FocusRing>
    </div>
  );
}

function InsertionIndicator(props) {
  let ref = React.useRef();
  let {dropIndicatorProps} = useDropIndicator(props, props.dropState, ref);

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false"
        className={props.dropState.isDropTarget(props.target)
        ? classNames(dropIndicatorStyles, 'spectrum-DropIndicator', 'spectrum-DropIndicator--horizontal')
        : null
      }
        style={{
          width: '100%',
          marginLeft: 0,
          height: 2,
          marginBottom: -2,
          outline: 'none'
        }}>
        <div {...useVisuallyHidden().visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
