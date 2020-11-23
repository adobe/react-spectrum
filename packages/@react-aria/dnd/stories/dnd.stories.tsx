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
import {ActionButton} from '@react-spectrum/button';
import {chain, useId} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import dndStyles from './dnd.css';
import dropIndicatorStyles from '@adobe/spectrum-css-temp/components/dropindicator/vars.css';
import dropzoneStyles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
import {Flex} from '@react-spectrum/layout';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {mergeProps} from '@react-aria/utils';
import {PressResponder} from '@react-aria/interactions';
import {Provider, useProvider} from '@react-spectrum/provider';
import React from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {storiesOf} from '@storybook/react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useButton} from '@react-aria/button';
import {useDrag, useDraggableItem, useDrop, useDroppableCollection, useDroppableItem, useInsertionIndicator} from '..';
import {useDraggableCollectionState, useDroppableCollectionState} from '@react-stately/dnd';
import {useListBox, useOption} from '@react-aria/listbox';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';

storiesOf('Drag and Drop', module)
  .add(
    'Default',
    () => (
      <Flex direction="column" gap="size-200" alignItems="center">
        <Draggable />
        <Droppable />
        <input />
        <Droppable type="text/html" />
        <input />
        <Droppable />
      </Flex>
    )
  )
  .add(
    'Collection',
    () => (
      <Flex direction="row" gap="size-200" alignItems="center">
        <Draggable />
        <DroppableCollection>
          <Item key="1" textValue="One">
            <Folder size="S" />
            <span>One</span>
          </Item>
          <Item key="2">Two</Item>
          <Item key="3" textValue="Three">
            <Folder size="S" />
            <span>Three</span>
          </Item>
        </DroppableCollection>
      </Flex>
    )
  )
  .add(
    'In dialog',
    () => (
      <Flex direction="column" gap="size-200" alignItems="center">
        <Draggable />
        <DialogButton>
          <Dialog>
            <Heading>Dialog</Heading>
            <Content>
              <Flex direction="column" gap="size-200" alignItems="center">
                <Draggable />
                <Droppable />
                <Droppable />
              </Flex>
            </Content>
          </Dialog>
        </DialogButton>
        <Droppable />
      </Flex>
    )
  )
  .add(
    'Draggable collection',
    () => (
      <Flex direction="row" gap="size-200" alignItems="center">
        <DraggableCollectionExample />
        <DroppableCollectionExample />
      </Flex>
    )
  );

function Draggable() {
  let {dragProps, dragButtonProps, isDragging} = useDrag({
    getItems() {
      return [{
        type: 'text/plain',
        data: 'hello world'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    },
    onDragStart: action('onDragStart'),
    // onDragMove: action('onDragMove'),
    onDragEnd: action('onDragEnd')
  });

  let ref = React.useRef();
  let {buttonProps} = useButton({...dragButtonProps, elementType: 'div'}, ref);

  return (
    <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
      <div
        ref={ref}
        {...dragProps}
        {...buttonProps as React.HTMLAttributes<HTMLElement>}
        className={classNames(dndStyles, 'draggable', {'is-dragging': isDragging})}>
        <ShowMenu size="XS" />
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}

function Droppable({type}: any) {
  let ref = React.useRef();
  let onDrop = action('onDrop');
  let {dropProps, isDropTarget} = useDrop({
    ref,
    onDropEnter: action('onDropEnter'),
    // onDropMove: action('onDropMove'),
    onDropExit: action('onDropExit'),
    onDropActivate: action('onDropActivate'),
    onDrop: async e => {
      onDrop(e);
      let items = await Promise.all(e.items.map(async item => ({type: item.type, data: await item.getData()})));
      console.log(e, items);
    },
    getDropOperation(types, allowedOperations) {
      return !type || types.includes(type) ? allowedOperations[0] : 'cancel';
    }
  });

  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <div
      {...mergeProps(dropProps, buttonProps)}
      ref={ref}
      className={classNames(dropzoneStyles, 'spectrum-Dropzone', {'is-dragged': isDropTarget})}>
      Drop here
    </div>
  );
}

function DroppableCollection(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let onDrop = action('onDrop');
  let state = useListState({...props, selectionMode: 'multiple'});
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), ref);
  let getDropOperation = (target, types, allowedOperations) => {
    if (target.key === '2' && target.dropPosition === 'on') {
      return 'cancel';
    }

    return target.dropPosition !== 'on' ? allowedOperations[0] : 'copy';
  };

  let dropState = useDroppableCollectionState({});
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
          key,
          dropPosition: closestDir
        };
      }
    },
    getDropOperation
  }, dropState, ref);

  let {listBoxProps} = useListBox({
    ...props,
    'aria-label': 'List',
    keyboardDelegate
  }, state, ref);

  return (
    <div
      {...mergeProps(collectionProps, listBoxProps)}
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        outline: 'none'
      }}>
      {[...state.collection].map(item => (
        <>
          <InsertionIndicator
            key={item.key + '-before'}
            collection={state.collection}
            collectionRef={ref}
            target={{key: item.key, dropPosition: 'before'}}
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
              target={{key: item.key, dropPosition: 'after'}}
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

  let {dropProps} = useDroppableItem({
    target: {key: item.key, dropPosition: 'on'}
  }, dropState, ref);

  return (
    <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
      <div
        {...mergeProps(optionProps, dropProps)}
        ref={ref}
        className={classNames(dndStyles, 'droppable', {
          'is-drop-target': dropState.isDropTarget({key: item.key, dropPosition: 'on'}),
          'is-selected': state.selectionManager.isSelected(item.key)
        })}>
        {item.rendered}
      </div>
    </FocusRing>
  );
}

function InsertionIndicator(props) {
  let ref = React.useRef();
  let {insertionIndicatorProps} = useInsertionIndicator(props, props.dropState, ref);

  return (
    <div
      ref={ref}
      role="option"
      aria-selected="false"
      {...insertionIndicatorProps}
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
      }} />
  );
}

function DialogButton({children}) {
  let [isOpen, setOpen] = React.useState(false);
  let ref = React.useRef();
  let {dropProps, isDropTarget} = useDrop({
    ref: unwrapDOMRef(ref),
    onDropActivate() {
      setOpen(true);
    }
  });

  return (
    <DialogTrigger isDismissable isOpen={isOpen} onOpenChange={setOpen}>
      <PressResponder {...dropProps} isPressed={isDropTarget}>
        <ActionButton ref={ref}>Open dialog</ActionButton>
      </PressResponder>
      {children}
    </DialogTrigger>
  );
}

function DraggableCollectionExample() {
  let list = useListData({
    initialItems: [
      {id: 'foo', text: 'Foo'},
      {id: 'bar', text: 'Bar'},
      {id: 'baz', text: 'Baz'}
    ]
  });

  let onDragEnd = (e) => {
    if (e.dropOperation === 'move') {
      list.remove(...e.keys);
    }
  };

  return (
    <DraggableCollection items={list.items} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} onDragEnd={onDragEnd}>
      {item => <Item>{item.text}</Item>}
    </DraggableCollection>
  );
}

function DroppableCollectionExample() {
  let id = React.useRef(3);
  let list = useListData({
    initialItems: [
      {id: '1', type: 'folder', text: 'One'},
      {id: '2', type: 'item', text: 'Two'},
      {id: '3', type: 'folder', text: 'Three'}
    ]
  });

  let onDrop = async (e) => {
    let data = JSON.parse(await e.items[0].getData());
    if (e.target.dropPosition !== 'on') {
      let items = data.map(item => ({
        id: String(++id.current),
        type: 'item',
        text: item
      }));

      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...items);
      } else {
        list.insertAfter(e.target.key, ...items);
      }
    }
  };

  return (
    <DroppableCollection items={list.items} onDrop={onDrop}>
      {item => (
        <Item textValue={item.text}>
          {item.type === 'folder' && <Folder size="S" />}
          <span>{item.text}</span>
        </Item>
      )}
    </DroppableCollection>
  );
}

function DraggableCollection(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let state = useListState({...props, selectionMode: 'multiple'});
  let provider = useProvider();
  let dragState = useDraggableCollectionState({
    selectionManager: state.selectionManager,
    getItems(keys) {
      return [{
        type: 'application/json',
        data: JSON.stringify([...keys].map(key => state.collection.getItem(key)?.textValue))
      }];
    },
    renderPreview(selectedKeys, draggedKey) {
      let item = state.collection.getItem(draggedKey);
      return (
        <Provider {...provider}>
          <div className={classNames(dndStyles, 'draggable', 'is-drag-preview', {'is-dragging-multiple': selectedKeys.size > 1})}>
            <div className={classNames(dndStyles, 'drag-handle')}>
              <ShowMenu size="XS" />
            </div>
            <span>{item.rendered}</span>
            {selectedKeys.size > 1 &&
              <div className={classNames(dndStyles, 'badge')}>{selectedKeys.size}</div>
            }
          </div>
        </Provider>
      );
    },
    onDragStart: action('onDragStart'),
    onDragEnd: chain(action('onDragEnd'), props.onDragEnd)
  });

  let {listBoxProps} = useListBox({
    ...props,
    'aria-label': 'Draggable list'
  }, state, ref);

  return (
    <div
      ref={ref}
      {...listBoxProps}
      role="grid"
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
      {[...state.collection].map(item => (
        <DraggableCollectionItem
          key={item.key}
          item={item}
          state={state}
          dragState={dragState} />
      ))}
    </div>
  );
}

function DraggableCollectionItem({item, state, dragState}) {
  let ref = React.useRef();
  let isSelected = state.selectionManager.isSelected(item.key);
  let {optionProps} = useOption({
    key: item.key,
    isSelected,
    shouldSelectOnPressUp: true
  }, state, ref);

  let {dragProps, dragButtonProps} = useDraggableItem({key: item.key}, dragState);

  let buttonRef = React.useRef();
  let {buttonProps} = useButton({
    ...dragButtonProps,
    elementType: 'div',
    onPressStart() {
      if (!isSelected) {
        state.selectionManager.select(item.key);
      }
    }
  }, buttonRef);
  let id = useId();

  return (
    <div role="row">
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...mergeProps(optionProps, dragProps)}
          role="gridcell"
          aria-labelledby={id}
          ref={ref}
          className={classNames(dndStyles, 'draggable', {
            'is-dragging': dragState.isDragging(item.key),
            'is-selected': isSelected
          })}>
          <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
            <div
              {...buttonProps as React.HTMLAttributes<HTMLElement>}
              ref={buttonRef}
              aria-label="drag"
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
