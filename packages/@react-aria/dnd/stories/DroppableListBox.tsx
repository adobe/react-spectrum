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
import {chain, mergeProps} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import dndStyles from './dnd.css';
import dropIndicatorStyles from '@adobe/spectrum-css-temp/components/dropindicator/vars.css';
import {DroppableCollectionDropEvent} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {Item} from '@react-stately/collections';
import {ListDropTargetDelegate} from '@react-aria/dnd';
import {ListKeyboardDelegate} from '@react-aria/selection';
import React from 'react';
import {useDropIndicator, useDroppableCollection, useDroppableItem} from '..';
import {useDroppableCollectionState} from '@react-stately/dnd';
import {useListBox, useOption} from '@react-aria/listbox';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface ItemValue {
  id: string,
  type: string,
  text: string
}

export function DroppableListBoxExample(props) {
  let id = React.useRef(props.items?.length || 3);
  let list = useListData({
    initialItems: props.items || [
      {id: '1', type: 'folder', text: 'One'},
      {id: '2', type: 'item', text: 'Two'},
      {id: '3', type: 'folder', text: 'Three'}
    ]
  });

  let ref = React.useRef(null);

  let onDrop = async (e: DroppableCollectionDropEvent) => {
    if (e.target.type === 'root' || e.target.dropPosition !== 'on') {
      let items: Array<ItemValue> = [];
      for (let item of e.items) {
        let type: string | undefined;
        if (item.kind === 'text') {
          if (item.types.has('folder')) {
            type = 'folder';
          } else if (item.types.has('item')) {
            type = 'item';
          }

          if (!type) {
            continue;
          }

          items.push({
            id: String(++id.current),
            type,
            text: await item.getText(type)
          });
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
    <DroppableListBox items={list.items} onDrop={onDrop} ref={ref} isDisabled={props.isDisabled}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </DroppableListBox>
  );
}

export const DroppableListBox = React.forwardRef(function (props: any, ref) {
  let domRef = React.useRef<HTMLDivElement>(null);
  let onDrop = async (e) => {
    action('onDrop')(e);
    props.onDrop?.(e);
  };
  let state = useListState({...props, selectionMode: 'multiple'});
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), domRef);

  React.useImperativeHandle(ref, () => ({
    focusItem(key) {
      state.selectionManager.setFocusedKey(key);
      state.selectionManager.setFocused(true);
    }
  }));

  let dropState = useDroppableCollectionState({
    isDisabled: props.isDisabled,
    collection: state.collection,
    selectionManager: state.selectionManager,
    getDropOperation: (target, _, allowedOperations) => {
      if (target.type === 'root') {
        return 'move';
      }

      if (target.key === '2' && target.dropPosition === 'on') {
        return 'cancel';
      }

      return target.dropPosition !== 'on' ? allowedOperations[0] : 'copy';
    },
    onDrop
  });

  let {collectionProps} = useDroppableCollection({
    keyboardDelegate,
    dropTargetDelegate: new ListDropTargetDelegate(state.collection, domRef),
    onDropActivate: chain(action('onDropActivate'), console.log),
    onDrop
  }, dropState, domRef);

  let {listBoxProps} = useListBox({
    ...props,
    'aria-label': 'List',
    keyboardDelegate
  }, state, domRef);

  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let dropRef = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'root'}
  }, dropState, dropRef);
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    <div
      {...mergeProps(collectionProps, listBoxProps)}
      ref={domRef}
      className={classNames(dndStyles, 'droppable-collection', {'is-drop-target': isDropTarget})}>
      {!dropIndicatorProps['aria-hidden'] &&
        <div
          role="option"
          aria-selected="false"
          {...visuallyHiddenProps}
          {...dropIndicatorProps}
          ref={dropRef} />
      }
      {[...state.collection].map(item => (
        <>
          <InsertionIndicator
            key={item.key + '-before'}
            collectionRef={domRef}
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
              target={{type: 'item', key: item.key, dropPosition: 'after'}}
              collectionRef={domRef}
              dropState={dropState} />
          }
        </>
      ))}
    </div>
  );
});

function CollectionItem({item, state, dropState}) {
  let ref = React.useRef<HTMLDivElement | null>(null);
  let {optionProps} = useOption({
    key: item.key,
    isSelected: state.selectionManager.isSelected(item.key)
  }, state, ref);

  let {dropProps} = useDroppableItem({
    target: {type: 'item', key: item.key, dropPosition: 'on'}
  }, dropState, ref);

  return (
    <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
      <div
        {...mergeProps(optionProps, dropProps)}
        ref={ref}
        className={classNames(dndStyles, 'droppable', {
          'is-drop-target': dropState.isDropTarget({type: 'item', key: item.key, dropPosition: 'on'}),
          'is-selected': state.selectionManager.isSelected(item.key)
        })}>
        {item.rendered}
      </div>
    </FocusRing>
  );
}

function InsertionIndicator(props) {
  let ref = React.useRef<HTMLDivElement | null>(null);
  let {dropIndicatorProps} = useDropIndicator(props, props.dropState, ref);

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
  if (!props.dropState.isDropTarget(props.target) && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      role="option"
      aria-selected="false"
      {...dropIndicatorProps}
      ref={ref}
      className={props.dropState.isDropTarget(props.target)
        ? classNames(dropIndicatorStyles, 'spectrum-DropIndicator', 'spectrum-DropIndicator--horizontal')
        : undefined
      }
      style={{
        width: '100%',
        margin: '-5px 0',
        height: 2,
        outline: 'none'
      }} />
  );
}
