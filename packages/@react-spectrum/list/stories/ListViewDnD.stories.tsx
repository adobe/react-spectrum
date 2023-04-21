import {action} from '@storybook/addon-actions';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {DragBetweenListsExample, DragBetweenListsRootOnlyExample, DragExample, DragIntoItemExample, ReorderExample} from './ListViewDnDExamples';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {expect} from '@storybook/jest';
import {fireEvent, userEvent, waitFor, within} from '@storybook/testing-library';
import {Flex} from '@react-spectrum/layout';
import {ListView} from '../';
import React from 'react';

export default {
  title: 'ListView/Drag and Drop',
  component: ListView,
  args: {
    isQuiet: false,
    density: 'regular',
    selectionMode: 'multiple',
    selectionStyle: 'checkbox',
    overflowMode: 'truncate',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionStyle: {
      control: {
        type: 'radio',
        options: ['checkbox', 'highlight']
      }
    },
    isQuiet: {
      control: {type: 'boolean'}
    },
    density: {
      control: {
        type: 'select',
        options: ['compact', 'regular', 'spacious']
      }
    },
    overflowMode: {
      control: {
        type: 'radio',
        options: ['truncate', 'wrap']
      }
    },
    disabledBehavior: {
      control: {
        type: 'radio',
        options: ['selection', 'all']
      }
    }
  }
} as ComponentMeta<typeof ListView>;

export type ListViewStory = ComponentStoryObj<typeof ListView>;
let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');

export const DragOut: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input />
      <Droppable />
      <DragExample
        dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}}
        listViewProps={args} />
    </Flex>
  ),
  name: 'Drag out of list'
};

// TODO: code based off https://testing-library.com/docs/example-drag/, try moving it into more central
// place. Attempted to move into our test-utils but it would error with a complaint about renderOverride
// when using it in this story
function isElement(obj) {
  if (typeof obj !== 'object') {
    return false;
  }
  let prototypeStr, prototype;
  do {
    prototype = Object.getPrototypeOf(obj);
    // to work in iframe
    prototypeStr = Object.prototype.toString.call(prototype);
    // '[object Document]' is used to detect document
    if (
      prototypeStr === '[object Element]' ||
      prototypeStr === '[object Document]'
    ) {
      return true;
    }
    obj = prototype;
    // null is the terminal of object
  } while (prototype !== null);
  return false;
}

function getElementClientCenter(element) {
  const {left, top, width, height} = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2
  };
}

const getCoords = target =>
  isElement(target) ? getElementClientCenter(target) : target;

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

interface DragOptions {
  dropTarget?: Element,
  delta?: {x: number, y: number},
  steps?: number,
  duration?: number
}

async function drag(element: Element, options: DragOptions) {
  let {dropTarget, delta, steps = 20, duration = 2000} = options;
  const from = getElementClientCenter(element);
  const to = delta
    ? {
      x: from.x + delta.x,
      y: from.y + delta.y
    }
    : getCoords(dropTarget);

  const step = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps
  };

  const current = {
    clientX: from.x,
    clientY: from.y
  };

  let dataTransfer = new DataTransfer();
  Object.defineProperty(dataTransfer, 'effectAllowed', {
    value: 'none',
    writable: true
  });
  fireEvent.pointerEnter(element, current);
  fireEvent.pointerOver(element, current);
  fireEvent.pointerMove(element, current);
  fireEvent.pointerDown(element, current);
  // NOTE: important to include bubbles and view here, otherwise the drag won't properly fire
  fireEvent(element, new DragEvent('dragstart', {dataTransfer, bubbles: true, view: window, ...current}));

  for (let i = 0; i < steps; i++) {
    current.clientX += step.x;
    current.clientY += step.y;
    await sleep(duration / steps);
    fireEvent.pointerMove(element, current);
    fireEvent(element, new DragEvent('drag', {dataTransfer, bubbles: true, view: window, ...current}));
    fireEvent(element, new DragEvent('dragover', {dataTransfer, bubbles: true, view: window, ...current}));
  }
  fireEvent.pointerUp(element, current);
  fireEvent(element, new DragEvent('drop', {dataTransfer, bubbles: true, view: window, ...current}));
  fireEvent(element, new DragEvent('dragend', {dataTransfer, bubbles: true, view: window, ...current}));
}

export const DragWithin: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <ReorderExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within list (Reorder}'
};

DragWithin.play = async ({canvasElement}) => {
  let canvas = within(canvasElement);
  await waitFor(() => {
    expect(canvas.getByText('Item Two')).toBeInTheDocument();
  });
  let targetRow = await canvas.getAllByRole('row')[1];
  expect(targetRow).toHaveAttribute('aria-rowindex', '2');
  let cell = within(targetRow).getByRole('gridcell');
  await waitFor(() => {
    expect(within(targetRow).getByRole('checkbox')).toBeInTheDocument();
    userEvent.click(within(targetRow).getByRole('checkbox'));
  });

  userEvent.click(within(targetRow).getByRole('checkbox'));
  await drag(cell, {delta: {x: 0, y: 130}});
  // TODO: figure out why the row information is out of date here
  // let rows = await within(canvasElement).getAllByRole('row');
  // expect(rows[1]).toHaveAttribute('aria-rowindex', '5');
  // expect(rows[1]).toHaveTextContent('Item Two');
};

export const DragWithinScroll: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" height={100}>
      <ReorderExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within list scrolling (Reorder)'
};

export const DragIntoFolder: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragIntoItemExample getAllowedDropOperationsAction={getAllowedDropOperationsAction} listViewProps={args} />
    </Flex>
  ),
  name: 'Drag into folder'
};

export const DragBetween: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenListsExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} />
    </Flex>
  ),
  name: 'Drag between lists'
};

export const DragBetweenRootOnly: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenListsRootOnlyExample listViewProps={args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} />
    </Flex>
  ),
  name: 'Drag between lists (Root only)',
  parameters: {
    description: {
      data: 'Folders are non-draggable.'
    }
  }
};

export const DraggableOnAction: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input />
      <Droppable />
      <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    </Flex>
  ),
  name: 'draggable rows, onAction',
  parameters: {
    description: {
      data: 'Folders are non-draggable.'
    }
  }
};

export const DraggableCopyLink: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input />
      <Droppable />
      <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd'), getAllowedDropOperations: () => { getAllowedDropOperationsAction(); return ['copy', 'link', 'cancel'];}}} />
    </Flex>
  ),
  name: 'draggable rows, allow copy and link',
  parameters: {
    description: {
      data: 'Allows copy, link, and cancel operations. Copy should be the default operation, and link should be the operation when the CTRL key is held while dragging.'
    }
  }
};
