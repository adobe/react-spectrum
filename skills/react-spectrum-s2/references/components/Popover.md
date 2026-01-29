# Popover

A popover is an overlay element positioned relative to a trigger.

```tsx
import {Popover, DialogTrigger, ActionButton, Form, TextField, Switch, Button} from '@react-spectrum/s2';
import Feedback from '@react-spectrum/s2/icons/Feedback';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function Example(props) {
  return (
    <DialogTrigger>
      <ActionButton aria-label="Feedback">
        <Feedback />
      </ActionButton>
      {/*- begin focus -*/}
      <Popover {...props}>
        <div className={style({padding: 12})}>
          <p className={style({font: 'body', marginTop: 0})}>How are we doing? Share your feedback here.</p>
          <Form>
            <TextField label="Subject" placeholder="Enter a summary" />
            <TextField label="Description" isRequired placeholder="Enter your feedback" />
            <Switch>Adobe can contact me for further questions concerning this feedback</Switch>
            <Button styles={style({marginStart: 'auto'})}>Submit</Button>
          </Form>
        </div>
      </Popover>
      {/*- end focus -*/}
    </DialogTrigger>
  );
}
```

## Custom anchor

To position a popover relative to a different element than its trigger, use the `triggerRef` and `isOpen` props instead of `<DialogTrigger>`. `onOpenChange` will be called when the user closes the popover.

```tsx
import {Popover, Button} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState, useRef} from 'react';

function Example() {
  let [isOpen, setOpen] = useState(false);
  let triggerRef = useRef(null);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 64, alignItems: 'center'})}>
      <Button onPress={() => setOpen(!isOpen)}>
        Open popover
      </Button>
      <div
        ref={triggerRef}
        className={style({
          padding: 8,
          backgroundColor: 'gray-100',
          borderRadius: 'default',
          font: 'ui'
        })}>
        Popover appears here
      </div>
      <Popover
        /*- begin highlight -*/
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setOpen}>
        {/*- end highlight -*/}
        <div className={style({font: 'ui'})}>
          Popover with custom trigger reference
        </div>
      </Popover>
    </div>
  );
}

<Example />
```

## A

PI

```tsx
<DialogTrigger>
  <Button />
  <Popover>
    {/* ... */}
  </Popover>
</DialogTrigger>
```

### Dialog

Trigger

### Popover

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `arrowRef` | `RefObject<Element | null> | undefined` | — | A ref for the popover arrow element. |
| `boundaryElement` | `Element | undefined` | document.body | Element that that serves as the positioning boundary. |
| `children` | `ChildrenOrFunction<PopoverRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `containerPadding` | `number | undefined` | 12 | The placement padding that should be applied between the element and its surrounding container. |
| `crossOffset` | `number | undefined` | 0 | The additional offset applied along the cross axis between the element and its anchor element. |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `hideArrow` | `boolean | undefined` | false | Whether a popover's arrow should be hidden. |
| `isEntering` | `boolean | undefined` | — | Whether the popover is currently performing an entry animation. |
| `isExiting` | `boolean | undefined` | — | Whether the popover is currently performing an exit animation. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `maxHeight` | `number | undefined` | — | The maxHeight specified for the overlay element. By default, it will take all space up to the current viewport height. |
| `offset` | `number | undefined` | 8 | The additional offset applied along the main axis between the element and its anchor element. |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `placement` | `Placement | undefined` | 'bottom' | The placement of the element with respect to its anchor element. |
| `scrollRef` | `RefObject<Element | null> | undefined` | overlayRef | A ref for the scrollable region within the overlay. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `size` | `"S" | "M" | "L" | undefined` | — | The size of the Popover. If not specified, the popover fits its contents. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StyleString | undefined` | — | The styles of the popover. |
| `trigger` | `string | undefined` | — | The name of the component that triggered the popover. This is reflected on the element as the `data-trigger` attribute, and can be used to provide specific styles for the popover depending on which element triggered it. |
| `triggerRef` | `RefObject<Element | null> | undefined` | — | The ref for the element which the popover positions itself with respect to. When used within a trigger component such as DialogTrigger, MenuTrigger, Select, etc., this is set automatically. It is only required when used standalone. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSTABLE_portalContainer` | `Element | undefined` | document.body | The container element in which the overlay portal will be placed. This may have unknown behavior depending on where it is portalled to. |
