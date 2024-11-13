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
import {DroppableCollectionState, useDroppableCollectionState} from '@react-stately/dnd';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {Item} from '@react-stately/collections';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {ListLayout} from '@react-stately/layout';
import {ListState, useListState} from '@react-stately/list';
import React, {useMemo} from 'react';
import {useDropIndicator, useDroppableCollection, useDroppableItem} from '..';
import {useListBox, useOption} from '@react-aria/listbox';
import {useListData} from '@react-stately/data';
import {useVisuallyHidden} from '@react-aria/visually-hidden';
import {Virtualizer} from '@react-aria/virtualizer';

interface ItemValue {
  id: string,
  type: string,
  text: string
}

export function VirtualizedListBoxExample(props) {
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
        if (item.kind === 'text') {
          let type: string | undefined;
          if (props.accept && item.types.has(props.accept)) {
            type = props.accept;
          } else if (item.types.has('folder')) {
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
    <VirtualizedListBox items={list.items} onDrop={onDrop} accept={props.accept} ref={ref}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </VirtualizedListBox>
  );
}

const Context = React.createContext<{state: ListState<object>, dropState: DroppableCollectionState} | null>(null);
const acceptedTypes = ['item', 'folder'];

export const VirtualizedListBox = React.forwardRef(function (props: any, ref) {
  let domRef = React.useRef<HTMLDivElement>(null);
  let onDrop = async (e) => {
    action('onDrop')(e);
    props.onDrop?.(e);
  };
  let state = useListState({...props, selectionMode: 'multiple'});

  React.useImperativeHandle(ref, () => ({
    focusItem(key) {
      state.selectionManager.setFocusedKey(key);
      state.selectionManager.setFocused(true);
    }
  }));

  let dropState = useDroppableCollectionState({
    collection: state.collection,
    selectionManager: state.selectionManager,
    getDropOperation(target, types, allowedOperations) {
      if (props.accept) {
        // Don't accept if types includes both items and folders.
        let rejected = acceptedTypes.filter(type => type !== props.accept);
        if (!types.has(props.accept) || rejected.some(type => types.has(type))) {
          return 'cancel';
        }
      } else if (!acceptedTypes.some(type => types.has(type))) {
        return 'cancel';
      }

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

  let layout = React.useMemo(() =>
    new ListLayout<unknown>({
      estimatedRowHeight: 32
    })
  , []);

  let {collectionProps} = useDroppableCollection({
    keyboardDelegate: new ListKeyboardDelegate({
      collection: state.collection,
      ref: domRef,
      layoutDelegate: layout
    }),
    dropTargetDelegate: layout,
    onDropActivate: chain(action('onDropActivate'), console.log),
    onDrop
  }, dropState, domRef);

  let {listBoxProps} = useListBox({
    ...props,
    'aria-label': 'List',
    layoutDelegate: layout,
    isVirtualized: true
  }, state, domRef);
  let isDropTarget = dropState.isDropTarget({type: 'root'});
  let focusedKey = dropState.target?.type === 'item' ? dropState.target.key : state.selectionManager.focusedKey;
  let persistedKeys = useMemo(() => focusedKey != null ? new Set([focusedKey]) : null, [focusedKey]);

  return (
    <Context.Provider value={{state, dropState}}>
      <Virtualizer
        {...mergeProps(collectionProps, listBoxProps)}
        ref={domRef}
        className={classNames(dndStyles, 'droppable-collection', 'is-virtualized', {'is-drop-target': isDropTarget})}
        scrollDirection="vertical"
        layout={layout}
        collection={state.collection}
        persistedKeys={persistedKeys}>
        {(type, item) => (
          <>
            {state.collection.getKeyBefore(item.key) == null &&
              <RootDropIndicator />
            }
            <InsertionIndicator
              key={item.key + '-before'}
              target={{type: 'item', key: item.key, dropPosition: 'before'}} />
            <CollectionItem
              key={item.key}
              item={item} />
            {state.collection.getKeyAfter(item.key) == null &&
              <InsertionIndicator
                key={item.key + '-after'}
                target={{type: 'item', key: item.key, dropPosition: 'after'}} />
            }
          </>
        )}
      </Virtualizer>
    </Context.Provider>
  );
});

function CollectionItem({item}) {
  let {state, dropState} = React.useContext(Context)!;
  let ref = React.useRef(null);
  let {optionProps} = useOption({
    key: item.key,
    isSelected: state.selectionManager.isSelected(item.key),
    isVirtualized: true
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
          'is-drop-target': dropState!.isDropTarget({type: 'item', key: item.key, dropPosition: 'on'}),
          'is-selected': state!.selectionManager.isSelected(item.key)
        })}
        style={{margin: '4px 12px'}}>
        {item.rendered}
      </div>
    </FocusRing>
  );
}

function InsertionIndicator(props) {
  let {dropState} = React.useContext(Context)!;
  let ref = React.useRef(null);
  let {dropIndicatorProps} = useDropIndicator(props, dropState, ref);

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
  if (!dropState.isDropTarget(props.target) && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      role="option"
      aria-selected="false"
      {...dropIndicatorProps}
      ref={ref}
      className={dropState.isDropTarget(props.target)
        ? classNames(dropIndicatorStyles, 'spectrum-DropIndicator', 'spectrum-DropIndicator--horizontal')
        : undefined
      }
      style={{
        width: 'calc(100% - 24px)',
        margin: '0 12px 0 12px',
        height: 2,
        marginBottom: -2,
        outline: 'none'
      }} />
  );
}

function RootDropIndicator() {
  let {dropState} = React.useContext(Context)!;
  let dropRef = React.useRef(null);
  let {dropIndicatorProps} = useDropIndicator({
    target: {type: 'root'}
  }, dropState, dropRef);

  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      role="option"
      aria-selected="false"
      {...visuallyHiddenProps}
      {...dropIndicatorProps}
      ref={dropRef} />
  );
}
