# Progress

Bar

Progress bars show either determinate or indeterminate progress of an operation
over time.

## Vanilla 

CSS example

### Progress

Bar.tsx

```tsx
'use client';
import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import {Label} from './Form';
import './ProgressBar.css';

export interface ProgressBarProps extends AriaProgressBarProps {
  label?: string;
}

export function ProgressBar({ label, ...props }: ProgressBarProps) {
  return (
    (
      <AriaProgressBar {...props}>
        {({ percentage, valueText, isIndeterminate }) => (
          <>
            <Label>{label}</Label>
            <span className="value">{valueText}</span>
            <div className="track inset">
              <div className="fill" style={{ '--percent': (isIndeterminate ? 100 : percentage) + '%' } as any} />
            </div>
          </>
        )}
      </AriaProgressBar>
    )
  );
}

```

### Progress

Bar.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-ProgressBar {
  display: grid;
  grid-template-areas: "label value"
                       "bar bar";
  grid-template-columns: 1fr auto;
  width: 250px;
  color: var(--text-color);
  font: var(--font-size) system-ui;

  .value {
    grid-area: value;
  }

  .track {
    grid-area: bar;
    forced-color-adjust: none;
    height: calc(var(--spacing-2) + 2px);
    border-radius: 9999px;
    overflow: clip;
    will-change: transform;
  }

  .fill {
    background: linear-gradient(
      to right,
      oklch(from var(--tint) 58% c h) 0px,
      oklch(from var(--tint) 72% c h) 20px,
      oklch(from var(--tint) 58% c h) 40px
    );
    background-size: 40px 100%;
    height: calc(100% - 2px);
    width: calc(var(--percent) - 2px);
    margin: 1px 0 0 1px;
    border-radius: inherit;
    animation: progress-fill 1s infinite linear;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.3), /* top specular highlight */
      inset 0 2px 2px rgb(255 255 255 / 0.2), /* 3d effect */
      0 1px 0 lch(from var(--tint) 42% c h), /* bottom shadow */
      0 0 0 1px var(--tint-900); /* border */

    @media (prefers-color-scheme: dark) {
      box-shadow:
        0 -1px 0 rgb(255 255 255 / 0.6), /* top specular highlight */
        inset 0 2px 2px rgb(255 255 255 / 0.2), /* 3d effect */
        0 1px 0 lch(from var(--tint) 42% c h), /* bottom shadow */
        0 0 0 1px var(--tint-900); /* border */
    }

    @media (prefers-reduced-motion: reduce) {
      background: var(--highlight-background);
      animation: none;
    }

    @media (forced-colors: active) {
      background-image: none;
      background-color: Highlight;
      box-shadow: none;
    }
  }

  /* indeterminate */
  &:not([aria-valuenow]) {
    .fill {
      --fill-dark: oklch(from var(--tint) 58% c h);
      --fill-light: var(--tint-200);
      background-image: linear-gradient(
        45deg,
        var(--fill-dark) 0px 12px,
        var(--fill-light) 15px 25px,
        var(--fill-dark) 28px
      );
      animation-duration: 0.5s;

      @media (forced-colors: active) {
        --fill-dark: Highlight;
        --fill-light: HighlightText;
      }
    }
  }
}

@keyframes progress-fill {
  from {
    background-position-x: 0;
  }

  to {
    background-position-x: -40px;
  }
}
```

## Tailwind example

### Progress

Bar.tsx

```tsx
'use client';
import React from 'react';
import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import { Label } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface ProgressBarProps extends AriaProgressBarProps {
  label?: string;
}

export function ProgressBar({ label, ...props }: ProgressBarProps) {
  return (
    <AriaProgressBar {...props} className={composeTailwindRenderProps(props.className, 'flex flex-col gap-2 font-sans w-64 max-w-full')}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="flex justify-between gap-2">
            <Label>{label}</Label>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{valueText}</span>
          </div>
          <div className="max-w-full h-2 rounded-full bg-neutral-300 dark:bg-neutral-700 outline outline-1 -outline-offset-1 outline-transparent relative overflow-hidden">
            <div className={`absolute top-0 h-full rounded-full bg-blue-500 forced-colors:bg-[Highlight] ${isIndeterminate ? 'left-full animate-in duration-1000 slide-in-from-left-[20rem] repeat-infinite ease-out' : 'left-0'}`} style={{ width: (isIndeterminate ? 40 : percentage) + '%' }} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}

```

## Value

By default, the `value` prop is a percentage between 0 and 100. Use the `minValue`, and `maxValue` props to set a custom value scale.

```tsx
import {VanillaProgressBar} from '@react-spectrum/s2';

<VanillaProgressBar />
```

## Progress

Circle

Use SVG within a `<ProgressBar>` to build a circular progress indicator or spinner.

```tsx
import {VanillaProgressCircle} from '@react-spectrum/s2';

<VanillaProgressCircle />
```

## A

PI

```tsx
<ProgressBar>
  <Label />
</ProgressBar>
```

### Progress

Bar

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<ProgressBarRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ProgressBarRenderProps> | undefined` | 'react-aria-ProgressBar' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `formatOptions` | `Intl.NumberFormatOptions | undefined` | \{style: 'percent'} | The display format of the value label. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isIndeterminate` | `boolean | undefined` | — | Whether presentation is indeterminate when progress isn't known. |
| `lang` | `string | undefined` | — |  |
| `maxValue` | `number | undefined` | 100 | The largest value allowed for the input. |
| `minValue` | `number | undefined` | 0 | The smallest value allowed for the input. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ProgressBarRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `number | undefined` | 0 | The current value (controlled). |
| `valueLabel` | `React.ReactNode` | — | The content to display as the value's label (e.g. 1 of 4). |
