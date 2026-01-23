# use

Drag

Handles drag interactions for an element, with support for traditional mouse and touch
based drag and drop, in addition to full parity for keyboard and screen reader users.

## Introduction

React Aria supports traditional mouse and touch based drag and drop, but also implements keyboard and screen reader friendly interactions. Users can press <Keyboard>Enter</Keyboard> on a draggable element to enter drag and drop mode. Then, they can press <Keyboard>Tab</Keyboard> to navigate between drop targets, and <Keyboard>Enter</Keyboard> to drop or <Keyboard>Escape</Keyboard> to cancel. Touch screen reader users can also drag by double tapping to activate drag and drop mode, swiping between drop targets, and double tapping again to drop.

See the [drag and drop guide](dnd.md) to learn more.

## Example

This example shows how to make a simple draggable element that provides data as plain text. In order to support keyboard and screen reader drag interactions, the element must be focusable and have an ARIA role (in this case, `button`). While it is being dragged, it is displayed with a dimmed appearance by applying an additional CSS class.

```tsx
import {useDrag} from 'react-aria';
import {DropTarget} from './DropTarget';
import './useDragExample.css';
import 'vanilla-starter/theme.css';

function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  return (
    <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}

<div>
  <Draggable />
  <DropTarget />
</div>
```

## Drag data

Data for a draggable element can be provided in multiple formats at once. This allows drop targets to choose data in a format that they understand. For example, you could serialize a complex object as JSON in a custom format for use within your own application, and also provide plain text and/or rich HTML fallbacks that can be used when a user drops data in an external application (e.g. an email message).
This can be done by returning multiple keys for an item from the `getItems` function. Types can either be a standard [mime type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) for interoperability with external applications, or a custom string for use within your own app.
In addition to providing items in multiple formats, you can also return multiple drag items from `getItems` to transfer multiple objects in a single drag operation.
This example drags two items, each of which contains representations as plain text, HTML, and a custom app-specific data format. Dropping on the drop targets in this page will use the custom data format to render formatted items. If you drop in an external application supporting rich text, the HTML representation will be used. Dropping in a text editor will use the plain text format.

```tsx
import {useDrag} from 'react-aria';
import {DropTarget} from './DropTarget';

function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world',
        'text/html': '<strong>hello world</strong>',
        'my-app-custom-type': JSON.stringify({
          message: 'hello world',
          style: 'bold'
        })
      }, {
        'text/plain': 'foo bar',
        'text/html': '<em>foo bar</em>',
        'my-app-custom-type': JSON.stringify({
          message: 'foo bar',
          style: 'italic'
        })
      }];
    }
  });
  return (
    <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}
<div>
  <Draggable />
  <DropTarget />
</div>
```

## Drag previews

By default, the drag preview shown under the user's pointer or finger is a copy of the original element that started the drag. A custom preview can be rendered using the `<DragPreview>` component. This accepts a function as a child which receives the dragged data that was returned by `getItems`, and returns a rendered preview for those items. The `DragPreview` is linked with `useDrag` via a ref, passed to the `preview` property. The `DragPreview` should be placed in the component hierarchy appropriately, so that it receives any React context or inherited styles that it needs to render correctly.
This example renders a custom drag preview which shows the text of the first drag item.

```tsx
import React from 'react';
import {useDrag} from 'react-aria';
import {DropTarget} from './DropTarget';
import {DragPreview} from 'react-aria';

function Draggable() {
  let preview = React.useRef(null);
  let {dragProps, isDragging} = useDrag({
    preview,
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });
  return (
    <>
      <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
        Drag me
      </div>
      {/*- begin highlight -*/}
      <DragPreview ref={preview}>
        {items => <div style={{background: 'green', color: 'white'}}>{items[0]['text/plain']}</div>}
      </DragPreview>
      {/*- end highlight -*/}
    </>
  );
}
<div>
  <Draggable />
  <DropTarget />
</div>
```

## Drop operations

A `DropOperation` is an indication of what will happen when dragged data is dropped on a particular drop target. These are:

* `move` – indicates that the dragged data will be moved from its source location to the target location.
* `copy` – indicates that the dragged data will be copied to the target destination.
* `link` – indicates that there will be a relationship established between the source and target locations.
* `cancel` – indicates that the drag and drop operation will be canceled, resulting in no changes made to the source or target.

Many operating systems display these in the form of a cursor change, e.g. a plus sign to indicate a copy operation. The user may also be able to use a modifier key to choose which drop operation to perform, such as <Keyboard>Option</Keyboard> or <Keyboard>Alt</Keyboard> to switch from move to copy.
The `onDragEnd` event allows the drag source to respond when a drag that it initiated ends, either because it was dropped or because it was canceled by the user. The `dropOperation` property of the event object indicates the operation that was performed. For example, when data is moved, the UI could be updated to reflect this change by removing the original dragged element.
This example removes the draggable element from the UI when a move operation is completed. Try holding the <Keyboard>Option</Keyboard> or <Keyboard>Alt</Keyboard> keys to change the operation to copy, and see how the behavior changes.

```tsx
"use client"
import React from 'react';
import {useDrag} from 'react-aria';
import {DropTarget} from './DropTarget';

function Draggable() {
  let [moved, setMoved] = React.useState(false);
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    /*- begin highlight -*/
    onDragEnd(e) {
      if (e.dropOperation === 'move') {
        setMoved(true);
      }
    }
    /*- end highlight -*/
  });
  if (moved) {
    return null;
  }
  // ...
  return (
    <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}
<div>
  <Draggable />
  <DropTarget />
</div>
```

The drag source can also control which drop operations are allowed for the data. For example, if moving data is not allowed, and only copying is supported, the `getAllowedDropOperations` function could be implemented to indicate this. When you drag the element below, the cursor now shows the copy affordance by default, and pressing a modifier to switch drop operations results in the drop being canceled.

```tsx
import {useDrag} from 'react-aria';
import {DropTarget} from './DropTarget';

function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    /*- begin highlight -*/
    getAllowedDropOperations() {
      return ['copy'];
    }
    /*- end highlight -*/
  });
  // ...
  return (
    <div {...dragProps} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}
<div>
  <Draggable />
  <DropTarget />
</div>
```

## Drag button

In cases where a draggable element has other interactions that conflict with accessible drag and drop (e.g. <Keyboard>Enter</Keyboard> key), or if the element is not focusable, an explicit drag affordance can be added. This acts as a button that keyboard and screen reader users can use to activate drag and drop.
When the `hasDragButton` option is enabled, the keyboard interactions are moved from the returned `dragProps` to the `dragButtonProps` so that they can be applied to a separate element, while the mouse and touch dragging interactions remain in `dragProps`.

```tsx
import React from 'react';
import {useDrag} from 'react-aria';
import {useButton} from '@react-aria/button';
import {DropTarget} from './DropTarget';

function Draggable() {
  let {dragProps, dragButtonProps, isDragging} = useDrag({
    /*- begin highlight -*/
    hasDragButton: true,
    /*- end highlight -*/
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });
  /*- begin highlight -*/
  let ref = React.useRef(null);
  let {buttonProps} = useButton({...dragButtonProps, elementType: 'div'}, ref);
  /*- end highlight -*/
  return (
    <div {...dragProps} className={`draggable ${isDragging ? 'dragging' : ''}`} style={{display: 'inline-flex', alignItems: 'center', gap: 5}}>
      {/*- begin highlight -*/}
      <span {...buttonProps} aria-label="Drag" ref={ref} style={{fontSize: 18}}>≡</span>
      {/*- end highlight -*/}
      <span>Some text</span>
      <button onClick={() => alert('action')}>Action</button>
    </div>
  );
}

<div>
  <Draggable />
  <DropTarget />
</div>
```

## Disabling dragging

If you need to temporarily disable dragging, you can pass the `isDisabled` option to `useDrag`. This will prevent dragging an element until it is re-enabled.

```tsx
import {useDrag} from 'react-aria';
function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    /*- begin highlight -*/
    isDisabled: true
    /*- end highlight -*/
  });
  return (
    <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}
<Draggable />
```

## A

PI

<FunctionAPI
  function={docs.exports.useDrag}
  links={docs.links}
/>

### Drag

Options

### Properties

| Name | Type | Description |
|------|------|-------------|
| `onDragStart` | `((e: DragStartEvent) => void) | undefined` | Handler that is called when a drag operation is started. |
| `onDragMove` | `((e: DragMoveEvent) => void) | undefined` | Handler that is called when the drag is moved. |
| `onDragEnd` | `((e: DragEndEvent) => void) | undefined` | Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. |
| `preview` | `RefObject<DragPreviewRenderer | null> | undefined` | The ref of the element that will be rendered as the drag preview while dragging. |
| `getAllowedDropOperations` | `(() => DropOperation[]) | undefined` | Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. |
| `hasDragButton` | `boolean | undefined` | Whether the item has an explicit focusable drag affordance to initiate accessible drag and drop mode. If true, the dragProps will omit these event handlers, and they will be applied to dragButtonProps instead. |
| `isDisabled` | `boolean | undefined` | Whether the drag operation is disabled. If true, the element will not be draggable. |

### Methods

#### `get

Items(): DragItem[]`

A function that returns the items being dragged.

### Drag

Result

| Name | Type | Description |
|------|------|-------------|
| `dragProps` \* | `HTMLAttributes<HTMLElement>` | Props for the draggable element. |
| `dragButtonProps` \* | `AriaButtonProps<"button">` | Props for the explicit drag button affordance, if any. |
| `isDragging` \* | `boolean` | Whether the element is currently being dragged. |

## Related 

Types

### Drop

Operation
