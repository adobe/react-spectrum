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
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {useDrag, useDrop, useDroppableCollection} from '..';
import {ListKeyboardDelegate} from '@react-aria/selection';
import {Item} from '@react-stately/collections';
import {useListState} from '@react-stately/list';
import {useButton} from '@react-aria/button';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {ActionButton} from '@react-spectrum/button';
import {Heading} from '@react-spectrum/text';
import {Content} from '@react-spectrum/view';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';
import {mergeProps} from '@react-aria/utils';
import {PressResponder, usePress} from '@react-aria/interactions';
import {unwrapDOMRef} from '@react-spectrum/utils';

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
      <Flex direction="column" gap="size-200" alignItems="center">
        <Draggable />
        <DroppableCollection>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
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
  );

function Draggable() {
  let {dragProps, dragButtonProps} = useDrag({
    getItems() {
      return [{
        type: 'text/plain',
        data: 'hello world'
      }];
    },
    renderPreview() {
      return <div />;
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
    <div
      ref={ref}
      {...dragProps}
      {...buttonProps}
      style={{
        background: 'red',
        padding: 10
      }}>
      Drag me
    </div>
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
      return !type || types.includes(type) ? 'copy' : 'cancel';
    }
  });

  return (
    <div
      {...dropProps}
      ref={ref}
      tabIndex={-1}
      style={{
        background: isDropTarget ? 'blue' : 'gray',
        padding: 20
      }}>
      Drop here
    </div>
  );
}

function DroppableCollection(props) {
  let ref = React.useRef<HTMLElement>(null);
  let betweenRef = React.useRef<HTMLElement>(null);
  let [target, setTarget] = React.useState(null);
  let onDrop = action('onDrop');
  let state = useListState({...props, selectionMode: 'multiple'});
  let keyboardDelegate = new ListKeyboardDelegate(state.collection, new Set(), ref);
  let {collectionProps} = useDroppableCollection({
    ref,
    keyboardDelegate,
    onDropEnter: chain(action('onDropEnter'), console.log, e => {
      setTarget(e.target);

      // Wait a frame before moving focus.
      requestAnimationFrame(() => {
        if (e.target.dropPosition === 'on') {
          state.selectionManager.setFocusedKey(e.target.key);
        } else {
          state.selectionManager.setFocusedKey(null);
          betweenRef.current.focus();
        }
      });
    }),
    // onDropMove: action('onDropMove'),
    onDropExit: chain(action('onDropExit'), console.log, e => setTarget(null)),
    onDropActivate: chain(action('onDropActivate'), console.log),
    onDrop: async e => {
      onDrop(e);
      let items = await Promise.all(e.items.map(async item => ({type: item.type, data: await item.getData()})));
      console.log(e, items);
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
      }

      let element = document.elementFromPoint(x, y);

      let key = closest?.dataset.key;
      if (key) {
        return {
          key,
          dropPosition: closest === element ? 'on' : closestDir
        };
      }
    },
    getDropOperation(target, types, allowedOperations) {
      return target.dropPosition !== 'on' ? 'copy' : 'move';
    }
  });

  let [targetPosition, setTargetPosition] = React.useState(null);
  React.useEffect(() => {
    if (!target || target.dropPosition === 'on') {
      setTargetPosition(null);
      return;
    }

    let targetElement = ref.current.querySelector(`[data-key="${target.key}"]`);
    if (!targetElement) {return;}
    let targetRect = targetElement.getBoundingClientRect();
    let rect = ref.current.getBoundingClientRect();
    let y = targetRect.y - rect.y;
    if (target.dropPosition === 'after') {
      let next = targetElement.nextElementSibling as HTMLElement;
      while (next && !next.dataset.key) {
        next = next.nextElementSibling as HTMLElement;
      }

      if (next) {
        let nextRect = next.getBoundingClientRect();
        y += targetRect.height + (nextRect.top - targetRect.bottom) / 2;
      } else {
        y += targetRect.height;
      }
    } else if (target.dropPosition === 'before') {
      let prev = targetElement.previousElementSibling as HTMLElement;
      while (prev && !prev.dataset.key) {
        prev = prev.previousElementSibling as HTMLElement;
      }

      if (prev) {
        let prevRect = prev.getBoundingClientRect();
        y -= (targetRect.top - prevRect.bottom) / 2;
      }
    }

    setTargetPosition(y);
  }, [target]);

  let {collectionProps: selectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate,
    ref
  });

  return (
    <div
      {...mergeProps(collectionProps, selectionProps)}
      ref={ref}
      style={{
        border: '1px solid gray',
        display: 'flex',
        flexDirection: 'column',
        width: 100,
        position: 'relative'
      }}>
      {[...state.collection].map(item =>
        (<CollectionItem
          key={item.key}
          item={item}
          isDropTarget={target?.key === item.key && target?.dropPosition === 'on'}
          selectionManager={state.selectionManager} />)
      )}
      {targetPosition != null &&
        <div ref={betweenRef} tabIndex={-1} style={{width: '100%', height: 2, background: 'blue', position: 'absolute', top: targetPosition - 1}} />
      }
    </div>
  );
}

function CollectionItem({item, isDropTarget, selectionManager}) {
  let ref = React.useRef();
  let {itemProps} = useSelectableItem({
    selectionManager,
    key: item.key,
    ref
  });

  let {pressProps} = usePress(itemProps);

  return (
    <div
      {...pressProps}
      ref={ref}
      style={{
        background: isDropTarget ? 'blue' : selectionManager.isSelected(item.key) ? 'green' : 'purple',
        padding: 10,
        margin: '5px 0'
      }}>
      {item.rendered}
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
