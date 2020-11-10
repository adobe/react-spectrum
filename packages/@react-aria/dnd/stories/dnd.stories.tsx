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

storiesOf('Drag and Drop', module)
  .add(
    'Default',
    () => (
      <Flex direction="column" gap="size-200" alignItems="center">
        <Draggable />
        <Droppable />
      </Flex>
    )
  )
  .add(
    'Collection',
    () => (
      <Flex direction="column" gap="size-200" alignItems="center">
        <Draggable />
        <DroppableCollection />
      </Flex>
    )
  );

function Draggable() {
  let {dragProps} = useDrag({
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

  return (
    <div
      {...dragProps}
      style={{
        background: 'red',
        padding: 10
      }}>
      Drag me
    </div>
  );
}

function Droppable() {
  let onDrop = action('onDrop');
  let {dropProps, isDropTarget} = useDrop({
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
      return 'copy';
    }
  });

  return (
    <div
      {...dropProps}
      style={{
        background: isDropTarget ? 'blue' : 'gray',
        padding: 20
      }}>
      Drop here
    </div>
  );
}

function DroppableCollection() {
  let ref = React.useRef<HTMLElement>(null);
  let [target, setTarget] = React.useState(null);
  let onDrop = action('onDrop');
  let {collectionProps} = useDroppableCollection({
    onDropEnter: chain(action('onDropEnter'), console.log, e => setTarget(e.target)),
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
        next = targetElement.nextElementSibling as HTMLElement;
      }

      if (next) {
        let nextRect = next.getBoundingClientRect();
        y += targetRect.height + (nextRect.top - targetRect.bottom) / 2;
      }
    } else if (target.dropPosition === 'before') {
      let prev = targetElement.previousElementSibling as HTMLElement;
      while (prev && !prev.dataset.key) {
        prev = targetElement.previousElementSibling as HTMLElement;
      }

      if (prev) {
        let prevRect = prev.getBoundingClientRect();
        y -= (targetRect.top - prevRect.bottom) / 2;
      }
    }

    setTargetPosition(y);
  }, [target]);

  return (
    <div
      {...collectionProps}
      ref={ref}
      style={{
        border: '1px solid gray',
        display: 'flex',
        flexDirection: 'column',
        width: 100,
        position: 'relative'
      }}>
      <div data-key="1" style={{background: target?.key === '1' && target?.dropPosition === 'on' ? 'blue' : 'purple', padding: 10}}>One</div>
      <div data-key="2" style={{background: target?.key === '2' && target?.dropPosition === 'on' ? 'blue' : 'purple', marginTop: 50, padding: 10}}>Two</div>
      <div data-key="3" style={{background: target?.key === '3' && target?.dropPosition === 'on' ? 'blue' : 'purple', marginTop: 50, padding: 10}}>Three</div>
      {targetPosition != null &&
        <div style={{width: '100%', height: 2, background: 'blue', position: 'absolute', top: targetPosition - 1}} />
      }
    </div>
  );
}
