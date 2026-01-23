# Switch

A switch allows a user to turn a setting on or off.

## Vanilla 

CSS example

### Switch.tsx

```tsx
'use client';
import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';

import './Switch.css';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props}>
      {({isSelected, isDisabled}) => (<>
        <div className="track indicator">
          <div data-disabled={isDisabled || undefined} className={isSelected ? 'handle' : 'handle indicator'} />
        </div>
        {children}
      </>)}
    </AriaSwitch>
  );
}

```

### Switch.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-Switch {
  display: flex;
  /* This is needed so the HiddenInput is positioned correctly */
  position: relative;
  align-items: center;
  gap: var(--spacing-2);
  font: var(--font-size) system-ui;
  color: var(--text-color);
  forced-color-adjust: none;
  -webkit-tap-highlight-color: transparent;

  .track {
    --height: calc(var(--spacing) * 5.5);
    height: var(--height);
    width: calc(var(--spacing) * 9.5);
    border-radius: var(--height);
    transition: all 200ms;
    scale: 1;

    .handle {
      display: block;
      height: 100%;
      aspect-ratio: 1;
      border-radius: var(--height);
      transition: all 200ms;
      transform-origin: 0 50%;
      will-change: transform;
      --indicator-color: var(--tint);
    }
  }

  &[data-pressed] .handle {
    scale: 1.2 1;
    border-radius: var(--height) / calc(var(--height) * 1.2);
    background: var(--button-background-pressed);
  }

  &[data-selected] {
    --border-color: var(--highlight-background-pressed);
    .handle {
      transform: translateX(var(--spacing-4));
      transform-origin: var(--spacing-9) 50%;
      background: white;
      box-shadow: inset 0 0 0 1px var(--border-color), inset 0 -4px 4px oklch(from var(--tint) 85% c h / 0.3);

      @media (forced-colors: active) {
        background: HighlightText;
        box-shadow: inset 0 0 0 1px Highlight;
      }
    }
  }

  &[data-focus-visible] .track {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
    --border-color: var(--border-color-disabled);

    .track {
      box-shadow: 0 0 0 1px var(--border-color);
    }

    &[data-selected] .handle {
      background: var(--gray-200);
      box-shadow: none;
    }
  }
}

```

## Tailwind example

### Switch.tsx

```tsx
'use client';
import React from 'react';
import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

const track = tv({
  extend: focusRing,
  base: 'flex h-5 w-9 box-border px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner border border-transparent font-sans',
  variants: {
    isSelected: {
      false: 'bg-neutral-100 dark:bg-neutral-800 group-pressed:bg-neutral-200 dark:group-pressed:bg-neutral-700 border-neutral-400 dark:border-neutral-400',
      true: 'bg-neutral-700 dark:bg-neutral-300 forced-colors:bg-[Highlight]! group-pressed:bg-neutral-800 dark:group-pressed:bg-neutral-200',
    },
    isDisabled: {
      true: 'bg-neutral-100 dark:bg-neutral-800 group-selected:bg-neutral-300 dark:group-selected:bg-neutral-800 forced-colors:group-selected:bg-[GrayText]! border-neutral-300 dark:border-neutral-900 forced-colors:border-[GrayText]',
    }
  }
});

const handle = tv({
  base: 'h-4 w-4 transform rounded-full outline outline-1 -outline-offset-1 outline-transparent shadow-xs transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false: 'translate-x-0 bg-neutral-900 dark:bg-neutral-300',
      true: 'translate-x-[100%] bg-white dark:bg-neutral-900'
    },
    isDisabled: {
      true: 'forced-colors:outline-[GrayText]'
    }
  },
  compoundVariants: [
    {
      isSelected: false,
      isDisabled: true,
      class: 'bg-neutral-300 dark:bg-neutral-700'
    },
    {
      isSelected: true,
      isDisabled: true,
      class: 'bg-neutral-50 dark:bg-neutral-700'
    }
  ]
});

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className={composeTailwindRenderProps(props.className, 'group relative flex gap-2 items-center text-neutral-800 disabled:text-neutral-300 dark:text-neutral-200 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText] text-sm transition [-webkit-tap-highlight-color:transparent]')}>
      {(renderProps) => (
        <>
          <div className={track(renderProps)}>
            <span className={handle(renderProps)} />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  );
}

```

## Selection

Use the `isSelected` or `defaultSelected` prop to set the selection state, and `onChange` to handle selection changes.

```tsx
import {Switch} from 'vanilla-starter/Switch';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelection] = useState(false);

  return (
    <>
      <Switch
        {...props}
        isSelected={selected}
        onChange={setSelection}
      >
        Low power mode
      </Switch>
      <p>{selected ? 'Low' : 'High'} power mode active.</p>
    </>
  );
}
```

## Forms

Use the `name` and `value` props to submit the switch to the server. See the [Forms](forms.md) guide to learn more.

```tsx
import {Switch} from 'vanilla-starter/Switch';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';

<Form>
  {/*- begin highlight -*/}
  <Switch name="wifi">Wi-Fi</Switch>
  {/*- end highlight -*/}
  <Button type="submit" style={{marginTop: 8}}>Submit</Button>
</Form>
```

## A

PI

```tsx
<Switch>Label</Switch>
```

### Switch

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<SwitchRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SwitchRenderProps> | undefined` | 'react-aria-Switch' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelected` | `boolean | undefined` | — | Whether the Switch should be selected (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isSelected` | `boolean | undefined` | — | Whether the Switch should be selected (controlled). |
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
| `onChange` | `((isSelected: boolean) => void) | undefined` | — | Handler that is called when the Switch's selection state changes. |
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
| `style` | `(React.CSSProperties | ((values: SwitchRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `string | undefined` | — | The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue). |
