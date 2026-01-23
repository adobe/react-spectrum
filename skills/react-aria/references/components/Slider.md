# Slider

A slider allows a user to select one or more values within a range.

## Vanilla 

CSS example

### Slider.tsx

```tsx
'use client';
import {
  Slider as AriaSlider,
  SliderOutput,
  SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import {Label} from './Form';
import './Slider.css';

export interface SliderProps<T> extends AriaSliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

export function Slider<T extends number | number[]>(
  { label, thumbLabels, ...props }: SliderProps<T>
) {
  return (
    (
      <AriaSlider {...props}>
        {label && <Label>{label}</Label>}
        <SliderOutput>
          {({ state }) =>
            state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
        </SliderOutput>
        <SliderTrack>
          {({ state, isDisabled }) => (<>
            <div className="track inset" data-disabled={isDisabled || undefined}>
              {state.values.length === 1
                // Single thumb, render fill from the end
                ? <div className="fill" style={{'--size': state.getThumbPercent(0) * 100 + '%'} as any} />
                : state.values.length === 2
                  // Range slider, render fill between the thumbs
                  ? <div className="fill" style={{'--start': state.getThumbPercent(0) * 100 + '%', '--size': (state.getThumbPercent(1) - state.getThumbPercent(0)) * 100 + '%'} as any} />
                  : null}
            </div>
            {state.values.map((_, i) => (
              <SliderThumb key={i} index={i} aria-label={thumbLabels?.[i]} className="react-aria-SliderThumb indicator" />
            ))}
          </>)}
        </SliderTrack>
      </AriaSlider>
    )
  );
}

```

### Slider.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-Slider {
  display: grid;
  grid-template-areas: "label output"
                       "track track";
  grid-template-columns: 1fr auto;
  max-width: min(calc(100% - 12px), 300px);
  font: var(--font-size) system-ui;
  color: var(--text-color);

  .react-aria-Label {
    grid-area: label;
  }

  .react-aria-SliderOutput {
    grid-area: output;
    font-size: var(--font-size);
  }

  .react-aria-SliderTrack {
    grid-area: track;
    position: relative;

    .track {
      display: block;
      position: absolute;
      border-radius: 9999px;
    }

    .fill {
      position: absolute;
      margin: 1px 0 0 1px;
      border-radius: inherit;
      background: var(--tint-900);

      @media (forced-colors: active) {
        background: Highlight;
      }
    }
  }

  .react-aria-SliderThumb {
    width: calc(var(--spacing) * 5.5);
    height: calc(var(--spacing) * 5.5);
    border-radius: 50%;
    forced-color-adjust: none;
    --indicator-color: var(--tint);
    --indicator-drop-shadow: 0 1px 4px rgb(0 0 0 / 0.3);

    &[data-dragging] {
      background: var(--button-background-pressed);
    }
  }

  &[data-orientation=horizontal] {
    flex-direction: column;
    width: 100%;

    .react-aria-SliderTrack {
      height: var(--spacing-5);
      width: 100%;

      .track {
        height: var(--spacing-2);
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }

      .fill {
        inset-inline-start: var(--start, 0);
        width: var(--size);
        height: calc(100% - 2px);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.3), inset 0 2px 2px rgb(255 255 255 / 0.2), 0 1px 0 lch(from var(--tint) 42% c h), 0 0 0 1px var(--tint-900);
    
        @media (prefers-color-scheme: dark) {
          box-shadow: 0 -1px 0 rgb(255 255 255 / 0.6), inset 0 2px 2px rgb(255 255 255 / 0.2), 0 1px 0 lch(from var(--tint) 42% c h), 0 0 0 1px var(--tint-900);
        }

        @media (forced-colors: active) {
          box-shadow: none;
        }
      }
    }

    .react-aria-SliderThumb {
      top: 50%;
    }
  }

  &[data-orientation=vertical] {
    height: 150px;
    display: block;
    margin: var(--spacing-3) 0;

    .react-aria-Label,
    .react-aria-SliderOutput {
      display: none;
    }

    .react-aria-SliderTrack {
      width: var(--spacing-5);
      height: 100%;

      .track {
        width: var(--spacing-2);
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
      }

      .fill {
        inset-block-end: var(--start, 0);
        height: var(--size);
        width: calc(100% - 2px);
        box-shadow: inset 1px 0 0 rgb(255 255 255 / 0.3), inset 2px 0 2px rgb(255 255 255 / 0.2), 1px 0 0 lch(from var(--tint) 42% c h), 0 0 0 1px var(--tint-900);
    
        @media (prefers-color-scheme: dark) {
          box-shadow: -1px 0 0 rgb(255 255 255 / 0.6), inset 2px 0 2px rgb(255 255 255 / 0.2), 1px 0 0 lch(from var(--tint) 42% c h), 0 0 0 1px var(--tint-900);
        }

        @media (forced-colors: active) {
          box-shadow: none;
        }
      }
    }

    .react-aria-SliderThumb {
      left: 50%;
    }
  }

  &[data-disabled] {
    .react-aria-SliderTrack {
      .track {
        background: var(--field-background);
        --border-color: var(--border-color-disabled);
      }

      .fill {
        background: var(--border-color-disabled);
        box-shadow: none;
      }
    }
  }
}

```

## Tailwind example

### Slider.tsx

```tsx
'use client';
import React from 'react';
import {
  Slider as AriaSlider,
  SliderProps as AriaSliderProps,
  SliderOutput,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Label } from './Field';
import { composeTailwindRenderProps, focusRing } from './utils';

const trackStyles = tv({
  base: 'rounded-full',
  variants: {
    orientation: {
      horizontal: 'w-full h-[6px]',
      vertical: 'h-full w-[6px] ml-[50%] -translate-x-[50%]'
    },
    isDisabled: {
      false: 'bg-neutral-300 dark:bg-neutral-700 forced-colors:bg-[ButtonBorder]',
      true: 'bg-neutral-200 dark:bg-neutral-800 forced-colors:bg-[ButtonBorder]'
    }
  }
});

const fillStyles = tv({
  base: 'absolute rounded-full',
  variants: {
    orientation: {
      horizontal: 'w-(--size) h-[6px] start-(--start,0)',
      vertical: 'h-(--size) w-[6px] bottom-(--start,0) ml-[50%] -translate-x-[50%]'
    },
    isDisabled: {
      false: 'bg-blue-500 forced-colors:bg-[Highlight]',
      true: 'bg-neutral-300 dark:bg-neutral-600 forced-colors:bg-[GrayText]'
    }
  }
});

const thumbStyles = tv({
  extend: focusRing,
  base: 'w-4.5 h-4.5 group-orientation-horizontal:mt-5 group-orientation-vertical:ml-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-700 dark:border-neutral-300',
  variants: {
    isDragging: {
      true: 'bg-neutral-700 dark:bg-neutral-300 forced-colors:bg-[ButtonBorder]'
    },
    isDisabled: {
      true: 'border-neutral-300 dark:border-neutral-700 forced-colors:border-[GrayText]'
    }
  }
});

export interface SliderProps<T> extends AriaSliderProps<T> {
  label?: string;
  thumbLabels?: string[];
}

export function Slider<T extends number | number[]>(
  { label, thumbLabels, ...props }: SliderProps<T>
) {
  return (
    <AriaSlider {...props} className={composeTailwindRenderProps(props.className, 'font-sans orientation-horizontal:grid orientation-vertical:flex grid-cols-[1fr_auto] flex-col items-center gap-2 orientation-horizontal:w-64 orientation-horizontal:max-w-[calc(100%-10px)]')}>
      <Label>{label}</Label>
      <SliderOutput className="text-sm text-neutral-500 dark:text-neutral-400 orientation-vertical:hidden">
        {({ state }) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
      </SliderOutput>
      <SliderTrack className="group col-span-2 orientation-horizontal:h-5 orientation-vertical:w-5 orientation-vertical:h-38 flex items-center">
        {({ state, ...renderProps }) => <>
          <div className={trackStyles(renderProps)} />
          {state.values.length === 1
            // Single thumb, render fill from the end
            ? <div
                className={fillStyles(renderProps)}
                style={{'--size': state.getThumbPercent(0) * 100 + '%'} as any} />
            : state.values.length === 2
              // Range slider, render fill between the thumbs
              ? <div
                  className={fillStyles(renderProps)}
                  style={{'--start': state.getThumbPercent(0) * 100 + '%', '--size': (state.getThumbPercent(1) - state.getThumbPercent(0)) * 100 + '%'} as any} />
              : null}
          {state.values.map((_, i) => <SliderThumb key={i} index={i} aria-label={thumbLabels?.[i]} className={thumbStyles} />)}
        </>}
      </SliderTrack>
    </AriaSlider>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the slider's value. The `onChange` event is called as the user drags, and `onChangeEnd` is called when the thumb is released.

```tsx
import {Slider} from 'vanilla-starter/Slider';
import {useState} from 'react';

function Example() {
  let [currentValue, setCurrentValue] = useState(25);
  let [finalValue, setFinalValue] = useState(currentValue);

  return (
    <>
      <Slider
        label="Cookies to buy"
        /*- begin highlight -*/
        value={currentValue}
        onChange={setCurrentValue}
        onChangeEnd={setFinalValue} />
        {/*- end highlight -*/}
      <pre style={{fontSize: 12}}>
        onChange value: {currentValue}{'\n'}
        onChangeEnd value: {finalValue}
      </pre>
    </>
  );
}
```

### Multi-thumb

Set the `value` or `defaultValue` to an array of numbers to render multiple thumbs. Each thumb should have an `aria-label` to describe it for assistive technologies (provided via `thumbLabels` here).

```tsx
import {Slider} from 'vanilla-starter/Slider';

<Slider
  label="Range"
  defaultValue={[30, 60]}
  thumbLabels={['start', 'end']} />
```

### Value scale

By default, slider values are percentages between 0 and 100. Use the `minValue`, `maxValue`, and `step` props to set the allowed values. Steps are calculated starting from the minimum. For example, if `minValue={2}`, and `step={3}`, the valid step values would be 2, 5, 8, 11, etc.

```tsx
import {VanillaSlider} from '@react-spectrum/s2';

<VanillaSlider />
```

## Examples

<ExampleList
  tag="slider"
  pages={props.pages}
/>

## A

PI

```tsx
<Slider>
  <Label />
  <SliderOutput />
  <SliderTrack>
    <SliderThumb />
    <SliderThumb>
      <Label />
    </SliderThumb>
  </SliderTrack>
</Slider>
```

### Slider

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<SliderRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SliderRenderProps> | undefined` | 'react-aria-Slider' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultValue` | `T | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `formatOptions` | `Intl.NumberFormatOptions | undefined` | — | The display format of the value label. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the whole Slider is disabled. |
| `lang` | `string | undefined` | — |  |
| `maxValue` | `number | undefined` | 100 | The slider's maximum value. |
| `minValue` | `number | undefined` | 0 | The slider's minimum value. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onChange` | `((value: T) => void) | undefined` | — | Handler that is called when the value changes. |
| `onChangeEnd` | `((value: T) => void) | undefined` | — | Fired when the slider stops moving, due to being let go. |
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
| `orientation` | `Orientation | undefined` | 'horizontal' | The orientation of the Slider. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `step` | `number | undefined` | 1 | The slider's step value. |
| `style` | `(React.CSSProperties | ((values: SliderRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The current value (controlled). |

### Slider

Output

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<SliderRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SliderRenderProps> | undefined` | 'react-aria-SliderOutput' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLOutputElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLOutputElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: SliderRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Slider

Track

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<SliderTrackRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SliderTrackRenderProps> | undefined` | 'react-aria-SliderTrack' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
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
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
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
| `style` | `(React.CSSProperties | ((values: SliderTrackRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Slider

Thumb

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<SliderThumbRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SliderThumbRenderProps> | undefined` | 'react-aria-SliderThumb' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `index` | `number | undefined` | 0 | Index of the thumb within the slider. |
| `inert` | `boolean | undefined` | — |  |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the Thumb is disabled. |
| `isInvalid` | `boolean | undefined` | — |  |
| `isRequired` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
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
| `orientation` | `Orientation | undefined` | 'horizontal' | The orientation of the Slider. |
| `style` | `(React.CSSProperties | ((values: SliderThumbRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
