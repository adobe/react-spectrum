# Action

Button

ActionButtons allow users to perform an action.
They're used for similar, task-based options within a workflow, and are ideal for interfaces where buttons aren't meant to draw a lot of attention.

```tsx
import {ActionButton} from '@react-spectrum/s2';

<ActionButton />
```

## Events

Use the `onPress` prop to handle interactions via mouse, keyboard, and touch. The `onPressStart`, `onPressEnd`, and `onPressChange` events are also emitted as the user interacts with the button.

```tsx
import {ActionButton} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [count, setCount] = useState(0);

  return (
    /*- begin highlight -*/
    <ActionButton onPress={() => setCount(c => c + 1)}>
    {/*- end highlight -*/}
      {count} Edits
    </ActionButton>
  );
}
```

## Pending

Use the `isPending` prop to display a pending state. Pending buttons remain focusable, but are otherwise disabled. After a 1 second delay, an indeterminate spinner will be displayed in place of the button label and icon.

```tsx
import {ActionButton} from '@react-spectrum/s2';
import {useState} from 'react';

function PendingButton() {
  let [isPending, setPending] = useState(false);

  return (
    <ActionButton
      isPending={isPending}
      onPress={() => {
        setPending(true);
        setTimeout(() => {
          setPending(false);
        }, 5000);
      }}>
      Save
    </ActionButton>
  );
}
```

## A

PI

```tsx
<ActionButton>
  <Icon /> or <Avatar />
  <Text />
  <NotificationBadge />
</ActionButton>
```

### Action

Button

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time" | undefined` | — | Indicates whether this element represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-disabled` | `boolean | "true" | "false" | undefined` | — | Indicates whether the element is disabled to users of assistive technology. |
| `aria-expanded` | `boolean | "true" | "false" | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-haspopup` | `boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-pressed` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode` | — | The content to display in the ActionButton. |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the button with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#form). |
| `formAction` | `string | ((formData: FormData) => void | Promise<void>) | undefined` | — | The URL that processes the information submitted by the button. Overrides the action attribute of the button's form owner. |
| `formEncType` | `string | undefined` | — | Indicates how to encode the form data that is submitted. |
| `formMethod` | `string | undefined` | — | Indicates the HTTP method used to submit the form. |
| `formNoValidate` | `boolean | undefined` | — | Indicates that the form is not to be validated when it is submitted. |
| `formTarget` | `string | undefined` | — | Overrides the target attribute of the button's form owner. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the button is disabled. |
| `isPending` | `boolean | undefined` | — | Whether the button is in a pending state. This disables press and hover events while retaining focusability, and announces the pending state to screen readers. |
| `isQuiet` | `boolean | undefined` | — | Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). |
| `name` | `string | undefined` | — | Submitted as a pair with the button's value as part of the form data. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `preventFocusOnPress` | `boolean | undefined` | — | Whether to prevent focus from moving to the button when pressing it. Caution, this can make the button inaccessible and should only be used when alternative keyboard interaction is provided, such as ComboBox's MenuTrigger or a NumberField's increment/decrement control. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the ActionButton. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `staticColor` | `"black" | "white" | "auto" | undefined` | — | The static color style to apply. Useful when the ActionButton appears over a color background. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `type` | `"button" | "submit" | "reset" | undefined` | 'button' | The behavior of the button when used in an HTML form. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `string | undefined` | — | The value associated with the button's name when it's submitted with the form data. |
