# Checkbox

A checkbox allows a user to select multiple items from a list of individual items, or
to mark one individual item as selected.

## Vanilla 

CSS example

### Checkbox.tsx

```tsx
'use client';
import {Checkbox as AriaCheckbox, CheckboxProps} from 'react-aria-components';

import './Checkbox.css';

export function Checkbox(
  { children, ...props }: Omit<CheckboxProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  return (
    (
      <AriaCheckbox {...props}>
        {({ isIndeterminate }) => (
          <>
            <div className="indicator">
              <svg viewBox="0 0 18 18" aria-hidden="true" key={isIndeterminate ? 'indeterminate' : 'check'}>
                {isIndeterminate
                  ? <rect x={1} y={7.5} width={16} height={3} />
                  : <polyline points="2 9 7 14 16 4" />}
              </svg>
            </div>
            {children}
          </>
        )}
      </AriaCheckbox>
    )
  );
}

```

### Checkbox.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-Checkbox {
  --checkmark-color: var(--highlight-foreground);

  display: flex;
  /* This is needed so the HiddenInput is positioned correctly */
  position: relative;
  align-items: center;
  gap: var(--spacing-2);
  font: var(--font-size) system-ui;
  color: var(--text-color);
  forced-color-adjust: none;
  -webkit-tap-highlight-color: transparent;

  .indicator {
    width: calc(var(--spacing) * 4.5);
    height: calc(var(--spacing) * 4.5);
    box-sizing: border-box;
    border-radius: var(--radius-sm);
    transition: all 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  svg {
    width: calc(100% - var(--spacing-2));
    height: calc(100% - var(--spacing-2));
    fill: none;
    stroke: var(--checkmark-color);
    stroke-width: 3px;
    stroke-dasharray: 22px;
    stroke-dashoffset: 66;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 200ms;
  }

  &[data-selected],
  &[data-indeterminate] {
    svg {
      stroke-dashoffset: 44;
    }
  }

  &[data-indeterminate] {
    svg {
      stroke: none;
      fill: var(--checkmark-color);
    }
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
    --checkmark-color: var(--text-color-disabled);
  }
}

```

## Tailwind example

### Checkbox.tsx

```tsx
'use client';
import { Check, Minus } from 'lucide-react';
import React from 'react';
import { Checkbox as AriaCheckbox, CheckboxProps, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

const checkboxStyles = tv({
  base: 'flex gap-2 items-center group font-sans text-sm transition relative [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      false: 'text-neutral-800 dark:text-neutral-200',
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

const boxStyles = tv({
  extend: focusRing,
  base: 'w-4.5 h-4.5 box-border shrink-0 rounded-sm flex items-center justify-center border transition',
  variants: {
    isSelected: {
      false: 'bg-white dark:bg-neutral-900 border-(--color) [--color:var(--color-neutral-400)] dark:[--color:var(--color-neutral-400)] group-pressed:[--color:var(--color-neutral-500)] dark:group-pressed:[--color:var(--color-neutral-300)]',
      true: 'bg-(--color) border-(--color) [--color:var(--color-neutral-700)] group-pressed:[--color:var(--color-neutral-800)] dark:[--color:var(--color-neutral-300)] dark:group-pressed:[--color:var(--color-neutral-200)] forced-colors:[--color:Highlight]!'
    },
    isInvalid: {
      true: '[--color:var(--color-red-700)] dark:[--color:var(--color-red-600)] forced-colors:[--color:Mark]! group-pressed:[--color:var(--color-red-800)] dark:group-pressed:[--color:var(--color-red-700)]'
    },
    isDisabled: {
      true: '[--color:var(--color-neutral-200)] dark:[--color:var(--color-neutral-700)] forced-colors:[--color:GrayText]!'
    }
  }
});

const iconStyles = 'w-3.5 h-3.5 text-white group-disabled:text-neutral-400 dark:text-neutral-900 dark:group-disabled:text-neutral-600 forced-colors:text-[HighlightText]';

export function Checkbox(props: CheckboxProps) {
  return (
    <AriaCheckbox {...props} className={composeRenderProps(props.className, (className, renderProps) => checkboxStyles({...renderProps, className}))}>
      {composeRenderProps(props.children, (children, {isSelected, isIndeterminate, ...renderProps}) => (
        <>
          <div className={boxStyles({isSelected: isSelected || isIndeterminate, ...renderProps})}>
            {isIndeterminate
              ? <Minus aria-hidden className={iconStyles} />
              : isSelected
                ? <Check aria-hidden className={iconStyles} />
                : null
            }
          </div>
          {children}
        </>
      ))}
    </AriaCheckbox>
  );
}

```

## Selection

Use the `isSelected` or `defaultSelected` prop to set the selection state, and `onChange` to handle selection changes. The `isIndeterminate` prop overrides the selection state regardless of user interaction.

```tsx
import {Checkbox} from 'vanilla-starter/Checkbox';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelection] = useState(false);

  return (
    <>
      <Checkbox
        {...props}
        isSelected={selected}
        onChange={setSelection}
        
      >
        Subscribe
      </Checkbox>
      <p>{`You are ${props.isIndeterminate ? 'partially subscribed' : selected ? 'subscribed' : 'unsubscribed'}`}</p>
    </>
  );
}
```

## Forms

Use the `name` and `value` props to submit the checkbox to the server. Set the `isRequired` prop to validate the user selects the checkbox, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {Checkbox} from 'vanilla-starter/Checkbox';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <Checkbox
    name="terms"
    value="agree"
    isRequired>
    {/*- end highlight -*/}
    I agree to the terms
  </Checkbox>
  <Button type="submit" style={{marginTop: 8}}>Submit</Button>
</Form>
```

## A

PI

```tsx
<Checkbox>Label</Checkbox>
```

### Checkbox

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<CheckboxRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<CheckboxRenderProps> | undefined` | 'react-aria-Checkbox' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelected` | `boolean | undefined` | — | Whether the element should be selected (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isIndeterminate` | `boolean | undefined` | — | Indeterminism is presentational only. The indeterminate visual representation remains regardless of user interaction. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isSelected` | `boolean | undefined` | — | Whether the element should be selected (controlled). |
| `lang` | `string | undefined` | — |  |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((isSelected: boolean) => void) | undefined` | — | Handler that is called when the element's selection state changes. |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `onScroll` | `React.UIEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLLabelElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLLabelElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: CheckboxRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: boolean) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `string | undefined` | — | The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue). |
