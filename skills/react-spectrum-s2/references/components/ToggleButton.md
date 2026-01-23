# Toggle

Button

ToggleButtons allow users to toggle a selection on or off, for example
switching between two states or modes.

```tsx
import {ToggleButton} from '@react-spectrum/s2';

<ToggleButton />
```

## Selection

Use the `isSelected` or `defaultSelected` prop to set the selection state, and `onChange` to handle selection changes.

```tsx
import {ToggleButton} from '@react-spectrum/s2';
import {useState} from 'react';
import Star from '@react-spectrum/s2/icons/Star';

function Example(props) {
  let [selected, setSelection] = useState(false);

  return (
    <>
      <ToggleButton
        {...props}
        aria-label="Star"
        /*- begin highlight -*/
        isSelected={selected}
        onChange={setSelection}>
        {/*- end highlight -*/}
        <Star />
      </ToggleButton>
      <p>{selected ? 'Starred' : 'Not starred'}</p>
    </>
  );
}
```

## A

PI

```tsx
<ToggleButton>
  <Icon /> or <Avatar />
  <Text />
</ToggleButton>
```

### Toggle

Button

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-disabled` | `boolean | "false" | "true" | undefined` | — | Indicates whether the element is disabled to users of assistive technology. |
| `aria-expanded` | `boolean | "false" | "true" | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-haspopup` | `boolean | "grid" | "dialog" | "menu" | "false" | "true" | "listbox" | "tree" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-pressed` | `boolean | "false" | "true" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode` | — | The content to display in the button. |
| `defaultSelected` | `boolean | undefined` | — | Whether the element should be selected (uncontrolled). |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `id` | `Key | undefined` | — | When used in a ToggleButtonGroup, an identifier for the item in `selectedKeys`. When used standalone, a DOM id. |
| `isDisabled` | `boolean | undefined` | — | Whether the button is disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). |
| `isQuiet` | `boolean | undefined` | — | Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). |
| `isSelected` | `boolean | undefined` | — | Whether the element should be selected (controlled). |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((isSelected: boolean) => void) | undefined` | — | Handler that is called when the element's selection state changes. |
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
| `staticColor` | `"white" | "black" | "auto" | undefined` | — | The static color style to apply. Useful when the ActionButton appears over a color background. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
