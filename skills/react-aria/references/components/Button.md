# Button

A button allows a user to perform an action, with mouse, touch, and keyboard interactions.

## Vanilla 

CSS example

### Button.tsx

```tsx
'use client';
import {Button as RACButton, ButtonProps as RACButtonProps, composeRenderProps} from 'react-aria-components';
import {ProgressCircle} from './ProgressCircle';
import './Button.css';

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet'
}

export function Button(props: ButtonProps) {
  return (
    <RACButton {...props} className="react-aria-Button button-base" data-variant={props.variant || 'primary'}>
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {!isPending && children}
          {isPending && (
            <ProgressCircle aria-label="Saving..." isIndeterminate />
          )}
        </>
      ))}
    </RACButton>
  );
}

```

### Button.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-Button {
  border: none;
  border-radius: var(--radius);
  appearance: none;
  font: var(--font-size) system-ui;
  font-weight: 500;
  margin: 0;
  height: var(--spacing-8);
  padding: 0 var(--spacing-3);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  -webkit-tap-highlight-color: transparent;

  > svg {
    width: calc(var(--spacing) * 4.5);
    height: calc(var(--spacing) * 4.5);
  }

  &:has(> svg:only-child) {
    width: var(--spacing-8);
    flex-shrink: 0;
    padding: 0;
    border-radius: 9999px;
  }

  &[data-pressed] {
    scale: 0.95;
  }

  .react-aria-ProgressBar {
    @media (prefers-color-scheme: dark) {
      --highlight-background: var(--gray-1600);
    }
  }

  kbd {
    font: var(--font-size-sm) system-ui;
    background: var(--highlight-hover);
    border: 0.5px solid var(--tint-500);
    padding: 0 var(--spacing-1);
    border-radius: var(--radius-sm);
    margin-inline-start: var(--spacing-3);
  }
}

```

## Tailwind example

### Button.tsx

```tsx
'use client';
import React from 'react';
import { composeRenderProps, Button as RACButton, ButtonProps as RACButtonProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

export interface ButtonProps extends RACButtonProps {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary' | 'destructive' | 'quiet'
}

let button = tv({
  extend: focusRing,
  base: 'relative inline-flex items-center justify-center gap-2 border border-transparent dark:border-white/10 h-9 box-border px-3.5 py-0 [&:has(>svg:only-child)]:px-0 [&:has(>svg:only-child)]:h-8 [&:has(>svg:only-child)]:w-8 font-sans text-sm text-center transition rounded-lg cursor-default [-webkit-tap-highlight-color:transparent]',
  variants: {
    variant: {
      primary: 'bg-blue-600 hover:bg-blue-700 pressed:bg-blue-800 text-white',
      secondary: 'border-black/10 bg-neutral-50 hover:bg-neutral-100 pressed:bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:pressed:bg-neutral-500 dark:text-neutral-100',
      destructive: 'bg-red-700 hover:bg-red-800 pressed:bg-red-900 text-white',
      quiet: 'border-0 bg-transparent hover:bg-neutral-200 pressed:bg-neutral-300 text-neutral-800 dark:hover:bg-neutral-700 dark:pressed:bg-neutral-600 dark:text-neutral-100'
    },
    isDisabled: {
      true: 'border-transparent dark:border-transparent bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    },
    isPending: {
      true: 'text-transparent'
    }
  },
  defaultVariants: {
    variant: 'primary'
  },
  compoundVariants: [
    {
      variant: 'quiet',
      isDisabled: true,
      class: 'bg-transparent dark:bg-transparent'
    }
  ]
});

export function Button(props: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => button({...renderProps, variant: props.variant, className})
      )}
    >
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {children}
          {isPending && (
            <span aria-hidden className="flex absolute inset-0 justify-center items-center">
              <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" stroke={props.variant === 'secondary' || props.variant === 'quiet' ? 'light-dark(black, white)' : 'white'}>
                <circle cx="12" cy="12" r="10" strokeWidth="4" fill="none" className="opacity-25" />
                <circle cx="12" cy="12" r="10" strokeWidth="4" strokeLinecap="round" fill="none" pathLength="100" strokeDasharray="60 140" strokeDashoffset="0" />
              </svg>
            </span>
          )}
        </>
      ))}
    </RACButton>
  );
}

```

## Events

Use the `onPress` prop to handle interactions via mouse, keyboard, and touch. This is similar to `onClick`, but normalized for consistency across browsers, devices, and interaction methods. Read our [blog post](blog/building-a-button-part-1.md) to learn more.

The `onPressStart`, `onPressEnd`, and `onPressChange` events are also emitted as the user interacts with the button. Each of these handlers receives a `PressEvent`, which provides information about the target and interaction method. See [usePress](usePress.md) for more details.

```tsx
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

function Example() {
  let [pointerType, setPointerType] = useState('');

  return (
    <>
      <Button
        /*- begin highlight -*/
        onPressStart={e => setPointerType(e.pointerType)}
        onPressEnd={() => setPointerType('')}>
        {/*- end highlight -*/}
        Press me
      </Button>
      <p>{pointerType ? `You are pressing the button with a ${pointerType}!` : 'Ready to be pressed.'}</p>
    </>
  );
}
```

## Pending

Use the `isPending` prop to display a pending state. Pending buttons remain focusable, but are otherwise disabled. Pending state changes are announced to assistive technologies.

```tsx
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

function PendingButton() {
  let [isPending, setPending] = useState(false);

  return (
    <Button
      isPending={isPending}
      onPress={() => {
        setPending(true);
        setTimeout(() => {
          setPending(false);
        }, 5000);
      }}>
      Save
    </Button>
  );
}
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content><p style={{marginTop: 0}}>The `ProgressBar` must be in the accessibility tree as soon as the button becomes pending, even if it is not visible. To delay showing a spinner until a minimum amount of time passes, use `opacity: 0`. Do not use `visibility: hidden` or `display: none` as these remove the element from the accessibility tree.</p>
  <p style={{marginBottom: 0}}>To reserve space for the button's label while pending, either set it to `visibility: hidden` with a descriptive ProgressBar `aria-label` (e.g. "Saving"), or set it to `opacity: 0` to combine the button's label with the `aria-label` of the ProgressBar (e.g. "Save, pending").</p></Content>
</InlineAlert>

## Link buttons

The `Button` component always represents a button semantically. To create a link that visually looks like a button, use the [Link](Link.md) component instead. You can reuse the same styles you apply to the `Button` component on the `Link`.

```tsx
import {Link} from 'react-aria-components';

<Link className="react-aria-Button button-base" href="https://adobe.com/" target="_blank">
  Adobe
</Link>
```

## Examples

<ExampleList
  tag="button"
  pages={props.pages}
/>

## A

PI

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
| `children` | `ChildrenOrFunction<ButtonRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ButtonRenderProps> | undefined` | 'react-aria-Button' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the button with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#form). |
| `formAction` | `string | ((formData: FormData) => void | Promise<void>) | undefined` | — | The URL that processes the information submitted by the button. Overrides the action attribute of the button's form owner. |
| `formEncType` | `string | undefined` | — | Indicates how to encode the form data that is submitted. |
| `formMethod` | `string | undefined` | — | Indicates the HTTP method used to submit the form. |
| `formNoValidate` | `boolean | undefined` | — | Indicates that the form is not to be validated when it is submitted. |
| `formTarget` | `string | undefined` | — | Overrides the target attribute of the button's form owner. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the button is disabled. |
| `isPending` | `boolean | undefined` | — | Whether the button is in a pending state. This disables press and hover events while retaining focusability, and announces the pending state to screen readers. |
| `lang` | `string | undefined` | — |  |
| `name` | `string | undefined` | — | Submitted as a pair with the button's value as part of the form data. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `onScroll` | `React.UIEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLButtonElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLButtonElement> | undefined` | — |  |
| `preventFocusOnPress` | `boolean | undefined` | — | Whether to prevent focus from moving to the button when pressing it. Caution, this can make the button inaccessible and should only be used when alternative keyboard interaction is provided, such as ComboBox's MenuTrigger or a NumberField's increment/decrement control. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ButtonRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `type` | `"button" | "submit" | "reset" | undefined` | 'button' | The behavior of the button when used in an HTML form. |
| `value` | `string | undefined` | — | The value associated with the button's name when it's submitted with the form data. |

## Related 

Types

### Press

Event

### Properties

| Name | Type | Description |
|------|------|-------------|
| `type` \* | `"pressstart" | "pressend" | "pressup" | "press"` | The type of press event being fired. |
| `pointerType` \* | `PointerType` | The pointer type that triggered the press event. |
| `target` \* | `Element` | The target element of the press event. |
| `shiftKey` \* | `boolean` | Whether the shift keyboard modifier was held during the press event. |
| `ctrlKey` \* | `boolean` | Whether the ctrl keyboard modifier was held during the press event. |
| `metaKey` \* | `boolean` | Whether the meta keyboard modifier was held during the press event. |
| `altKey` \* | `boolean` | Whether the alt keyboard modifier was held during the press event. |
| `x` \* | `number` | X position relative to the target. |
| `y` \* | `number` | Y position relative to the target. |
| `key` | `string | undefined` | The key that triggered the press event, if it was triggered by a keyboard interaction. This is useful for differentiating between Space and Enter key presses. |

### Methods

#### `continue

Propagation(): void`

By default, press events stop propagation to parent elements. In cases where a handler decides not to handle a specific event, it can call `continuePropagation()` to allow a parent to handle it.
