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
import {DroppableGridExample} from './DroppableGrid';
import {DroppableListBox, DroppableListBoxExample} from './DroppableListBox';
import dropzoneStyles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
import {Flex} from '@react-spectrum/layout';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import {PressResponder} from '@react-aria/interactions';
import {Provider, useProvider} from '@react-spectrum/provider';
import React from 'react';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {storiesOf} from '@storybook/react';
import {unwrapDOMRef} from '@react-spectrum/utils';
import {useButton} from '@react-aria/button';
import {useDrag, useDraggableItem, useDrop} from '..';
import {useDraggableCollectionState} from '@react-stately/dnd';
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
        <DroppableListBox>
          <Item key="1" textValue="One">
            <Folder size="S" />
            <span>One</span>
          </Item>
          <Item key="2">Two</Item>
          <Item key="3" textValue="Three">
            <Folder size="S" />
            <span>Three</span>
          </Item>
        </DroppableListBox>
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
        <DroppableListBoxExample />
      </Flex>
    )
  )
  .add(
    'Droppable grid',
    () => (
      <Flex direction="row" gap="size-200" alignItems="center">
        <DraggableCollectionExample />
        <DroppableGridExample />
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
