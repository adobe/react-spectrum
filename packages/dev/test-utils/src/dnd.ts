import {act, fireEvent} from '@testing-library/react';
// eslint-disable-next-line monorepo/no-internal-import
import {DataTransfer, DragEvent} from '@react-aria/dnd/test/mocks';

type DragPointerType = 'mouse' | 'touch' | 'pointer';

type Delta = {x: number, y: number}

function getElementCenter(element: Element) {
  let {left, top, width, height} = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2
  };
}

async function performDragAndDrop(source: Element, target: Element, delta: Delta, type: DragPointerType = 'mouse', steps = 1, duration = 0) {
  let from = getElementCenter(source);
  let to = {x: 0, y: 0};

  if (delta && target) {
    let targetCenter = getElementCenter(target);
    to = {x: targetCenter.x + delta.x, y: targetCenter.y + delta.y};
  } else if (target) {
    to = getElementCenter(target);
  } else if (delta) {
    to = {x: from.x + delta.x, y: from.y + delta.y};
  }

  let step = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps
  };

  let current = {
    clientX: from.x,
    clientY: from.y
  };

  if (type === 'mouse') {
    fireEvent.mouseEnter(source, current);
    fireEvent.mouseOver(source, current);
    fireEvent.mouseMove(source, current);
    fireEvent.mouseDown(source, current);
  } else if (type === 'pointer') {
    fireEvent.pointerEnter(source, current);
    fireEvent.pointerOver(source, current);
    fireEvent.pointerMove(source, current);
    fireEvent.pointerDown(source, current);
  } else if (type === 'touch') {
    fireEvent.touchStart(source, current);
    fireEvent.touchMove(source, current);
  }

  let dataTransfer = new DataTransfer();
  fireEvent(source, new DragEvent('dragstart', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  await act(async () => Promise.resolve());

  for (let i = 0; i < steps; i++) {
    current.clientX += step.x;
    current.clientY += step.y;

    if (duration !== 0 && steps > 1) {
      await new Promise(resolve => {
        setTimeout(resolve, duration / steps);
      });
    }

    if (type === 'mouse') {
      fireEvent.mouseMove(source, current);
    } else if (type === 'pointer') {
      fireEvent.pointerMove(source, current);
    } else if (type === 'touch') {
      fireEvent.touchMove(source, current);
    }

    fireEvent(source, new DragEvent('drag', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
    fireEvent(target, new DragEvent('dragover', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  }


  if (type === 'mouse') {
    fireEvent.mouseUp(source, current);
  } else if (type === 'pointer') {
    fireEvent.pointerUp(source, current);
  } else if (type === 'touch') {
    fireEvent.touchEnd(source, current);
  }

  fireEvent(source, new DragEvent('dragend', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  fireEvent(target, new DragEvent('drop', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  return dataTransfer;
}

/**
 * Drag an element onto another element, or by a specific delta.
 * @example
 * let dataTransfer = await drag(source).to(target).with('mouse');
 * let dataTransfer = await drag(source).by({x: 100, y: 100}).with('touch');
 */
export function drag(source: Element) {
  return {
    /** Drag an element onto the center of another element. */
    to: (target: Element) => ({
      with: async (type: DragPointerType) => {
        return await performDragAndDrop(source, target, {x: 0, y: 0}, type);
      }
    }),
    /** Drag an element by a specific delta. */
    by: ({x, y}: Delta) => ({
      with: async (type: DragPointerType) => {
        return await performDragAndDrop(source, null, {x, y}, type);
      }
    }),
    /** Drag an element just above another element. */
    above: (target: Element) => ({
      with: async (type: DragPointerType) => {
        let delta = {x: 0, y: -target.getBoundingClientRect().height / 2 - 1};
        return await performDragAndDrop(source, target, delta, type);
      }
    }),
    /** Drag an element just below another element. */
    below: (target: Element) => ({
      with: async (type: DragPointerType) => {
        let delta = {x: 0, y: target.getBoundingClientRect().height / 2 + 1};
        return await performDragAndDrop(source, target, delta, type);
      }
    }),
    /** Drag an element just to the left of another element. */
    before: (target: Element) => ({
      with: async (type: DragPointerType) => {
        let delta = {x: 0, y: -target.getBoundingClientRect().height / 2 - 1};
        return await performDragAndDrop(source, target, delta, type);
      }
    }),
    /** Drag an element just to the right of another element. */
    after: (target: Element) => ({
      with: async (type: DragPointerType) => {
        let delta = {x: 0, y: target.getBoundingClientRect().height / 2 + 1};
        return await performDragAndDrop(source, target, delta, type);
      }
    })
  };
}
