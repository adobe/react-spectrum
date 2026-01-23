# Toggle

ButtonGroup

A toggle button group allows a user to toggle multiple options, with single or multiple selection.

## Vanilla 

CSS example

```tsx
import {ToggleButtonGroup} from 'vanilla-starter/ToggleButtonGroup';
import {ToggleButton} from 'vanilla-starter/ToggleButton';

<ToggleButtonGroup>
  <ToggleButton id="left">Bold</ToggleButton>
  <ToggleButton id="center">Italic</ToggleButton>
  <ToggleButton id="right">Underline</ToggleButton>
</ToggleButtonGroup>
```

### Toggle

ButtonGroup.tsx

```tsx
'use client';
import {ToggleButtonGroup as RACToggleButtonGroup, ToggleButtonGroupProps} from 'react-aria-components';
import './ToggleButtonGroup.css';

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return <RACToggleButtonGroup {...props} />;
}

```

### Toggle

ButtonGroup.css

```css
@import "./theme.css";

.react-aria-ToggleButtonGroup {
  display: flex;

  > .react-aria-ToggleButton {
    z-index: 1;

    > span {
      transition: scale 200ms;
    }

    &[data-pressed] {
      scale: 1;

      > span {
        scale: 0.9;
      }
    }

    &[data-disabled] {
      z-index: 0;
    }

    &[data-selected],
    &[data-focus-visible] {
      z-index: 2;
    }
  }
}

.react-aria-ToggleButtonGroup[data-orientation=horizontal] {
  flex-direction: row;

  > .react-aria-ToggleButton {
    margin-inline-start: -1px;
    border-radius: 0;

    &:first-child {
      border-radius: var(--radius) 0 0 var(--radius);
      margin-inline-start: 0;
    }

    &:last-child {
      border-radius: 0 var(--radius) var(--radius) 0;
    }
  }
}

.react-aria-ToggleButtonGroup[data-orientation=vertical] {
  flex-direction: column;
  width: fit-content;

  > .react-aria-ToggleButton {
    margin-block-start: -1px;
    border-radius: 0;

    &:first-child {
      border-radius: var(--radius) var(--radius) 0 0;
      margin-block-start: 0;
    }

    &:last-child {
      border-radius: 0 0 var(--radius) var(--radius);
    }
  }
}

```

## Tailwind example

```tsx
import {ToggleButtonGroup} from 'tailwind-starter/ToggleButtonGroup';
import {ToggleButton} from 'tailwind-starter/ToggleButton';

<ToggleButtonGroup>
  <ToggleButton id="left">Bold</ToggleButton>
  <ToggleButton id="center">Italic</ToggleButton>
  <ToggleButton id="right">Underline</ToggleButton>
</ToggleButtonGroup>
```

### Toggle

ButtonGroup.tsx

```tsx
'use client';
import React from 'react';
import { composeRenderProps, ToggleButtonGroup as RACToggleButtonGroup, ToggleButtonGroupProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

const styles = tv({
  base: 'flex gap-1',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col'
    }
  }
});

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) => styles({...renderProps, className}))} />
  );
}

```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` of each `<ToggleButton>`. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=ToggleButtonGroup) for more details.

```tsx
import type {Key} from 'react-aria-components';
import {useState} from 'react';
import {ToggleButtonGroup} from 'vanilla-starter/ToggleButtonGroup';
import {ToggleButton} from 'vanilla-starter/ToggleButton';
import {Bold, Italic, Underline, Strikethrough} from 'lucide-react';

function Example(props) {
  let [selected, setSelected] = useState(new Set<Key>(['bold']));

  return (
    <>
      <ToggleButtonGroup
        {...props}
        aria-label="Text style"
        /*- begin highlight -*/
        
        selectedKeys={selected}
        onSelectionChange={setSelected}>
        {/*- end highlight -*/}
        <ToggleButton id="bold" aria-label="Bold">
          <Bold size={18} />
        </ToggleButton>
        <ToggleButton id="italic" aria-label="Italic" isDisabled>
          <Italic size={18} />
        </ToggleButton>
        <ToggleButton id="underline" aria-label="Underline">
          <Underline size={18} />
        </ToggleButton>
        <ToggleButton id="strike" aria-label="Strikethrough">
          <Strikethrough size={18} />
        </ToggleButton>
      </ToggleButtonGroup>
      <p>Current selection: {[...selected].join(', ')}</p>
    </>
  );
}
```

### Animation

Render a [SelectionIndicator](selection.md#animated-selectionindicator) within each `ToggleButton` to animate selection changes.

```tsx
import {ToggleButtonGroup, ToggleButton, ToggleButtonProps, SelectionIndicator, composeRenderProps} from 'react-aria-components';
import 'vanilla-starter/SegmentedControl.css';

function SegmentedControlItem(props: ToggleButtonProps) {
  return (
    <ToggleButton {...props} className="segmented-control-item">
      {/*- begin highlight -*/}
      {composeRenderProps(props.children, (children) => (<>
        <SelectionIndicator className="react-aria-SelectionIndicator button-base" data-selected />
        <span>{children}</span>
      </>))}
      {/*- end highlight -*/}
    </ToggleButton>
  );
}

<ToggleButtonGroup
  className="segmented-control button-base"
  data-variant="secondary"
  aria-label="Time period"
  defaultSelectedKeys={['day']}
  disallowEmptySelection>
  <SegmentedControlItem id="day">Day</SegmentedControlItem>
  <SegmentedControlItem id="week">Week</SegmentedControlItem>
  <SegmentedControlItem id="month">Month</SegmentedControlItem>
  <SegmentedControlItem id="year">Year</SegmentedControlItem>
</ToggleButtonGroup>
```

## A

PI

```tsx
<ToggleButtonGroup>
  <ToggleButton>
    <SelectionIndicator />
  </ToggleButton>
</ToggleButtonGroup>
```

### Toggle

ButtonGroup

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<ToggleButtonGroupRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ToggleButtonGroupRenderProps> | undefined` | 'react-aria-ToggleButtonGroup' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelectedKeys` | `Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether all items are disabled. |
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
| `onSelectionChange` | `((keys: Set<Key>) => void) | undefined` | — | Handler that is called when the selection changes. |
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
| `orientation` | `Orientation | undefined` | 'horizontal' | The orientation of the the toggle button group. |
| `selectedKeys` | `Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `"single" | "multiple" | undefined` | 'single' | Whether single or multiple selection is enabled. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ToggleButtonGroupRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
