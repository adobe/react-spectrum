# Disclosure

Group

A DisclosureGroup is a grouping of related disclosures, sometimes called an accordion.
It supports both single and multiple expanded items.

## Vanilla 

CSS example

```tsx
import {DisclosureGroup} from 'vanilla-starter/DisclosureGroup';
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'vanilla-starter/Disclosure';

<DisclosureGroup>
  <Disclosure>
    <DisclosureHeader>Personal Information</DisclosureHeader>
    <DisclosurePanel>Personal information form here.</DisclosurePanel>
  </Disclosure>
  <Disclosure>
    <DisclosureHeader>Billing Address</DisclosureHeader>
    <DisclosurePanel>Billing address form here.</DisclosurePanel>
  </Disclosure>
</DisclosureGroup>
```

### Disclosure

Group.tsx

```tsx
'use client';
import {DisclosureGroup as RACDisclosureGroup, DisclosureGroupProps} from 'react-aria-components';
import './DisclosureGroup.css';

export function DisclosureGroup(props: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} />;
}

```

### Disclosure

Group.css

```css
@import "./theme.css";

.react-aria-DisclosureGroup {
  width: 200px;
}

```

## Tailwind example

```tsx
import {DisclosureGroup} from 'tailwind-starter/DisclosureGroup';
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'tailwind-starter/Disclosure';

<DisclosureGroup>
  <Disclosure>
    <DisclosureHeader>Personal Information</DisclosureHeader>
    <DisclosurePanel>Personal information form here.</DisclosurePanel>
  </Disclosure>
  <Disclosure>
    <DisclosureHeader>Billing Address</DisclosureHeader>
    <DisclosurePanel>Billing address form here.</DisclosurePanel>
  </Disclosure>
</DisclosureGroup>
```

### Disclosure

Group.tsx

```tsx
'use client';
import React from "react";
import {
  DisclosureGroup as AriaDisclosureGroup,
  DisclosureGroupProps as AriaDisclosureGroupProps,
} from "react-aria-components";

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
  children: React.ReactNode
}

export function DisclosureGroup({ children, ...props }: DisclosureGroupProps) {
  return (
    <AriaDisclosureGroup {...props}>
      {children}
    </AriaDisclosureGroup>
  );
}

```

## Expanding

Use the `defaultExpandedKeys` or `expandedKeys` prop to set the expanded items, and `onExpandedChange` to handle user interactions. The expanded keys correspond to the `id` prop of each `<Disclosure>`.

```tsx
import type {Key} from 'react-aria-components';
import {DisclosureGroup} from 'vanilla-starter/DisclosureGroup';
import {Disclosure, DisclosureHeader, DisclosurePanel} from 'vanilla-starter/Disclosure';
import {useState} from 'react';

function Example() {
  let [expandedKeys, setExpandedKeys] = useState(new Set<Key>(['system']));

  return (
    <DisclosureGroup
      /*- begin highlight -*/
      expandedKeys={expandedKeys}
      onExpandedChange={setExpandedKeys}>
      {/*- end highlight -*/}
      <Disclosure id="settings">
        <DisclosureHeader>Settings</DisclosureHeader>
        <DisclosurePanel>Application settings content</DisclosurePanel>
      </Disclosure>
      <Disclosure id="preferences">
        <DisclosureHeader>Preferences</DisclosureHeader>
        <DisclosurePanel>User preferences content</DisclosurePanel>
      </Disclosure>
      <Disclosure id="advanced">
        <DisclosureHeader>Advanced</DisclosureHeader>
        <DisclosurePanel>Advanced configuration options</DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
```

## A

PI

```tsx
<DisclosureGroup>
  <Disclosure />
</DisclosureGroup>
```

### Disclosure

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsMultipleExpanded` | `boolean | undefined` | — | Whether multiple items can be expanded at the same time. |
| `children` | `ChildrenOrFunction<DisclosureGroupRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DisclosureGroupRenderProps> | undefined` | 'react-aria-DisclosureGroup' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultExpandedKeys` | `Iterable<Key> | undefined` | — | The initial expanded keys in the group (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `expandedKeys` | `Iterable<Key> | undefined` | — | The currently expanded keys in the group (controlled). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
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
| `onExpandedChange` | `((keys: Set<Key>) => any) | undefined` | — | Handler that is called when items are expanded or collapsed. |
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
| `style` | `(React.CSSProperties | ((values: DisclosureGroupRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
