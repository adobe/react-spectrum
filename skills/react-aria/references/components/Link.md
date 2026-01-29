# Link

A link allows a user to navigate to another page or resource within a web page
or application.

## Vanilla 

CSS example

### Link.tsx

```tsx
'use client';
import {Link as RACLink, LinkProps} from 'react-aria-components';
import './Link.css';

export function Link(props: LinkProps) {
  return <RACLink {...props} />;
}

```

### Link.css

```css
@import "./theme.css";

.react-aria-Link {
  color: var(--link-color);
  font-size: var(--font-size);
  transition-property: color, text-decoration-thickness;
  transition-duration: 200ms;
  text-decoration: underline;
  cursor: pointer;
  outline: none;
  position: relative;
  border-radius: var(--radius-sm);
  -webkit-tap-highlight-color: transparent;

  &[data-hovered] {
    text-decoration-thickness: 1.5px;
  }

  &[data-pressed] {
    color: var(--link-color-pressed);
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
  }

  &[data-disabled] {
    cursor: default;
    color: var(--text-color-disabled);
  }
}

```

## Tailwind example

### Link.tsx

```tsx
'use client';
import React from 'react';
import { Link as AriaLink, LinkProps as AriaLinkProps, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

interface LinkProps extends AriaLinkProps {
  variant?: 'primary' | 'secondary'
}

const styles = tv({
  extend: focusRing,
  base: 'underline disabled:no-underline disabled:cursor-default forced-colors:disabled:text-[GrayText] transition rounded-xs [-webkit-tap-highlight-color:transparent]',
  variants: {
    variant: {
      primary: 'text-blue-600 dark:text-blue-500 underline decoration-blue-600/60 hover:decoration-blue-600 dark:decoration-blue-500/60 dark:hover:decoration-blue-500',
      secondary: 'text-neutral-700 dark:text-neutral-300 underline decoration-neutral-700/50 hover:decoration-neutral-700 dark:decoration-neutral-300/70 dark:hover:decoration-neutral-300'
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
});

export function Link(props: LinkProps) {
  return <AriaLink {...props} className={composeRenderProps(props.className, (className, renderProps) =>  styles({...renderProps, className, variant: props.variant}))} />;
}

```

## Events

Links with an `href` will be handled by the browser, or via a [client side router](./frameworks.md). Links without an `href` will be rendered as a `<span role="link">` instead of an `<a>`. Use the `onPress` event to handle user interaction.

```tsx
import {Link} from 'vanilla-starter/Link';

<Link onPress={() => alert('Pressed link')}>Link</Link>
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<LinkRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<LinkRenderProps> | undefined` | 'react-aria-Link' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the link is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `onScroll` | `React.UIEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLAnchorElement> | undefined` | — |  |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: LinkRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `translate` | `"yes" | "no" | undefined` | — |  |
