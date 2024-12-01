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
import {ActionGroup} from '@react-spectrum/actiongroup';
import {chain, mergeProps, useId} from '@react-aria/utils';
import {classNames, unwrapDOMRef} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import dndStyles from './dnd.css';
import {DraggableListBox} from './DraggableListBox';
import {DragPreview} from '../src/DragPreview';
import {DroppableGridExample} from './DroppableGrid';
import {DroppableListBox, DroppableListBoxExample} from './DroppableListBox';
import dropzoneStyles from '@adobe/spectrum-css-temp/components/dnd/vars.css';
import {Flex} from '@react-spectrum/layout';
import {FocusRing} from '@react-aria/focus';
import Folder from '@spectrum-icons/workflow/Folder';
import {GridCollection, useGridState} from '@react-stately/grid';
import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import Paste from '@spectrum-icons/workflow/Paste';
import {PressResponder} from '@react-aria/interactions';
import React, {useRef} from 'react';
import {ReorderableGridExample} from './Reorderable';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {useButton} from '@react-aria/button';
import {useClipboard, useDrag, useDraggableCollection, useDraggableItem, useDrop} from '..';
import {useDraggableCollectionState} from '@react-stately/dnd';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListData} from '@react-stately/data';
import {useListState} from '@react-stately/list';
import {VirtualizedListBoxExample} from './VirtualizedListBox';

interface ItemValue {
  id: string,
  type: string,
  text: string
}
let manyItems: Array<ItemValue> = [];
for (let i = 0; i < 20; i++) {
  manyItems.push({id: '' + i, type: 'item', text: 'Item ' + i});
}

export default {
  title: 'Drag and Drop',
  excludeStories: ['Droppable']
};

export const Default = () => (
  <Flex direction="column" gap="size-200" alignItems="center">
    <Draggable />
    <Droppable />
    <input aria-label="test input 1" />
    <Droppable type="text/html" />
    <input aria-label="test input 2" />
    <Droppable />
  </Flex>
);

export const NestedDropRegions = {
  render: () => (
    <Flex direction="column" gap="size-200" alignItems="center">
      <Draggable />
      <Droppable actionId="Parent">
        <Droppable actionId="Child" />
      </Droppable>
    </Flex>
  ),
  name: 'nested drop regions',
  parameters: {
    a11y: {
      config: {
        rules: [{id: 'nested-interactive', enabled: false}]
      }
    }
  }
};

export const DraggableListbox = {
  render: () => (
    <Flex direction="column" gap="size-200" alignItems="center">
      <DraggableListBox selectionMode="multiple" selectionBehavior="replace">
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </DraggableListBox>
      <Droppable />
    </Flex>
  ),
  name: 'Draggable listbox'
};

export const DraggableListboxOnAction = {
  render: () => (
    <Flex direction="column" gap="size-200" alignItems="center">
      <DraggableListBox
        selectionMode="multiple"
        selectionBehavior="replace"
        onAction={action('onAction')}>
        <Item>Foo</Item>
        <Item key="bar">Bar</Item>
        <Item>Baz</Item>
      </DraggableListBox>
      <Droppable />
    </Flex>
  ),
  name: 'Draggable listbox, onAction'
};

export const DroppableListbox = {
  render: () => (
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
  ),
  name: 'Droppable listbox'
};

export const InDialog = {
  render: () => (
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
  ),
  name: 'In dialog'
};

export const DraggableGridDroppableListbox = {
  render: () => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample />
      <DroppableListBoxExample />
    </Flex>
  ),
  name: 'Draggable grid, droppable listbox'
};

export const DroppableGrid = {
  render: () => (
    <Flex direction="column" alignItems="start">
      <ActionGroup
        onAction={(action) => {
          switch (action) {
            case 'copy':
            case 'cut': {
              let selected = document.querySelector(
                '[aria-label="Draggable list"] [aria-selected="true"] [role="gridcell"]'
              ) as HTMLElement;
              selected?.focus();
              document.execCommand(action);
              break;
            }
            case 'paste': {
              // This only works in Safari...
              let selected = document.querySelector(
                '[aria-label="List"] [aria-selected="true"] [role="gridcell"]'
              ) as HTMLElement;
              selected?.focus();
              document.execCommand('paste');
              break;
            }
          }
        }}>
        <Item key="copy" aria-label="Copy">
          <Copy />
        </Item>
        <Item key="cut" aria-label="Cut">
          <Cut />
        </Item>
        <Item key="paste" aria-label="Paste">
          <Paste />
        </Item>
      </ActionGroup>
      <Flex direction="row" gap="size-200" alignItems="center" wrap>
        <DraggableCollectionExample />
        <DroppableGridExample
          onDropEnter={action('onDropEnter')}
          onDropExit={action('onDropExit')}
          onDrop={action('onDrop')} />
      </Flex>
    </Flex>
  ),
  name: 'Droppable grid'
};

export const DroppableGridWithManyItems = {
  render: () => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample />
      <DroppableGridExample items={manyItems} />
    </Flex>
  ),
  name: 'Droppable grid with many items'
};

export const VirtualizedListbox = {
  render: () => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample />
      <VirtualizedListBoxExample items={manyItems} />
    </Flex>
  ),
  name: 'Virtualized listbox'
};

export const MultipleCollectionDropTargets = {
  render: () => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample />
      <VirtualizedListBoxExample
        items={manyItems.map((item) => ({...item, type: 'folder'}))}
        accept="folder" />
      <VirtualizedListBoxExample items={manyItems} accept="item" />
    </Flex>
  ),
  name: 'Multiple collection drop targets'
};

export const Reorderable = () => <ReorderableGridExample />;

export const DraggableDisabled = {
  render: () => <Draggable isDisabled />,
  name: 'Draggable isDisabled'
};

export function Draggable({isDisabled = false}) {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    },
    onDragStart: action('onDragStart'),
    // onDragMove: action('onDragMove'),
    onDragEnd: action('onDragEnd'),
    isDisabled
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
      <div
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}
        className={classNames(dndStyles, 'draggable', {'is-dragging': isDragging})}>
        <ShowMenu size="XS" />
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}

export function Droppable({type, children, actionId = ''}: any) {
  let ref = React.useRef(null);
  let {dropProps, isDropTarget} = useDrop({
    ref,
    onDropEnter: action(`onDropEnter${actionId}`),
    // onDropMove: action('onDropMove'),
    onDropExit: action(`onDropExit${actionId}`),
    onDropActivate: action(`onDropActivate${actionId}`),
    onDrop: action(`onDrop${actionId}`),
    getDropOperation(types, allowedOperations) {
      return !type || types.has(type) ? allowedOperations[0] : 'cancel';
    }
  });

  let {clipboardProps} = useClipboard({
    onPaste: action(`onPaste${actionId}`)
  });

  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing focusRingClass={classNames(dropzoneStyles, 'focus-ring')}>
      <div
        {...mergeProps(dropProps, buttonProps, clipboardProps)}
        ref={ref}
        className={classNames(dropzoneStyles, 'spectrum-Dropzone', {'is-dragged': isDropTarget})}>
        Drop here
        {children}
      </div>
    </FocusRing>
  );
}

function DialogButton({children}) {
  let [isOpen, setOpen] = React.useState(false);
  let ref = React.useRef(null);
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

function DraggableCollectionExample(props) {
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

  let onCut = keys => {
    list.remove(...keys);
  };

  return (
    <DraggableCollection items={list.items} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} onDragEnd={onDragEnd} onCut={onCut} isDisabled={props.isDisabled}>
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
  let {isDisabled} = props;
  let ref = React.useRef<HTMLDivElement>(null);
  let state = useListState<ItemValue>(props);
  let gridState = useGridState({
    ...props,
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
    isDisabled,
    collection: gridState.collection,
    selectionManager: gridState.selectionManager,
    getItems(keys) {
      return [...keys].map(key => {
        let item = gridState.collection.getItem(key)!;

        // TODO why doesn't this work like DraggableCollection example?
        return {
          // @ts-ignore
          [item.value.type]: item.textValue,
          'text/plain': item.textValue
        };
      }).filter(item => item != null);
    },
    preview,
    onDragStart: action('onDragStart'),
    onDragEnd: chain(action('onDragEnd'), props.onDragEnd)
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
          dragState={dragState}
          onCut={props.onCut} />
      ))}
      <DragPreview ref={preview}>
        {() => {
          let selectedKeys = dragState.draggingKeys;
          let draggedKey = [...selectedKeys][0];
          let item = state.collection.getItem(draggedKey);
          return (
            <div className={classNames(dndStyles, 'draggable', 'is-drag-preview', {'is-dragging-multiple': selectedKeys.size > 1})}>
              <div className={classNames(dndStyles, 'drag-handle')}>
                <ShowMenu size="XS" />
              </div>
              {item && <span>{item.rendered}</span>}
              {selectedKeys.size > 1 &&
                <div className={classNames(dndStyles, 'badge')}>{selectedKeys.size}</div>
              }
            </div>
          );
        }}
      </DragPreview>
    </div>
  );
}

function DraggableCollectionItem({item, state, dragState, onCut}) {
  let rowRef = React.useRef(null);
  let cellRef = React.useRef(null);
  let cellNode = [...item.childNodes][0];
  let isSelected = state.selectionManager.isSelected(item.key);

  let {rowProps} = useGridRow({
    node: item,
    shouldSelectOnPressUp: true
  }, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, cellRef);

  let {dragProps, dragButtonProps} = useDraggableItem({key: item.key, hasDragButton: true}, dragState);

  let {clipboardProps} = useClipboard({
    getItems: () => dragState.getItems(item.key),
    onCut: () => onCut(dragState.getKeysForDrag(item.key))
  });

  let buttonRef = React.useRef(null);
  let {buttonProps} = useButton({
    ...dragButtonProps,
    elementType: 'div'
  }, buttonRef);
  let id = useId();

  return (
    <div {...mergeProps(rowProps, dragProps)} ref={rowRef} aria-labelledby={id}>
      <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
        <div
          {...mergeProps(gridCellProps, clipboardProps)}
          aria-labelledby={id}
          ref={cellRef}
          className={classNames(dndStyles, 'draggable', {
            'is-dragging': dragState.isDragging(item.key),
            'is-selected': isSelected
          })}>
          <FocusRing focusRingClass={classNames(dndStyles, 'focus-ring')}>
            <div
              {...buttonProps as React.HTMLAttributes<HTMLElement>}
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

export const DraggableEnabledDisabledControl = {
  render: (args) => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample {...args} />
      <DroppableListBoxExample />
    </Flex>
  ),
  name: 'Draggable Enable/Disable control',
  argTypes: {
    isDisabled: {
      control: 'boolean',
      defaultValue: true
    }
  }
};

export const DroppableEnabledDisabledControl = {
  render: (args) => (
    <Flex direction="row" gap="size-200" alignItems="center" wrap>
      <DraggableCollectionExample />
      <DroppableListBoxExample {...args} />
    </Flex>
  ),
  name: 'Droppable Enable/Disable control',
  argTypes: {
    isDisabled: {
      control: 'boolean',
      defaultValue: true
    }
  }
};
