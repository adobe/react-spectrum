# Breadcrumbs

Breadcrumbs display a hierarchy of links to the current page or resource in an application.

## Vanilla 

CSS example

```tsx
import {Breadcrumbs, Breadcrumb} from 'vanilla-starter/Breadcrumbs';

<Breadcrumbs>
  <Breadcrumb href="#">Home</Breadcrumb>
  <Breadcrumb href="#">React Aria</Breadcrumb>
  <Breadcrumb>Breadcrumbs</Breadcrumb>
</Breadcrumbs>
```

### Breadcrumbs.tsx

```tsx
'use client';
import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps, Breadcrumb as RACBreadcrumb, BreadcrumbProps, LinkProps, Link} from 'react-aria-components';
import {ChevronRight} from 'lucide-react';
import './Breadcrumbs.css';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <RACBreadcrumb {...props}>
      {({isCurrent}) => (<>
        <Link {...props} />
        {!isCurrent && <ChevronRight size={14} />}
      </>)}
    </RACBreadcrumb>
  );
}

```

### Breadcrumbs.css

```css
@import "./theme.css";

.react-aria-Breadcrumbs {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  color: var(--text-color);

  .react-aria-Breadcrumb {
    display: flex;
    align-items: center;
  }

  .react-aria-Link {
    font: var(--font-size) system-ui;
    color: var(--link-color-secondary);
    outline: none;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &[data-hovered],
    &[data-focus-visible] {
      text-decoration: underline;
    }

    &[data-current] {
      color: var(--text-color);
      font-weight: 600;
    }

    &[data-focus-visible] {
      border-radius: var(--radius-sm);
      outline: 2px solid var(--focus-ring-color);
    }

    &[data-disabled] {
      cursor: default;

      &:not([data-current]) {
        color: var(--text-color-disabled);
      }
    }
  }
}

```

## Tailwind example

```tsx
import {Breadcrumbs, Breadcrumb} from 'tailwind-starter/Breadcrumbs';

<Breadcrumbs>
  <Breadcrumb href="#">Home</Breadcrumb>
  <Breadcrumb href="#">React Aria</Breadcrumb>
  <Breadcrumb>Breadcrumbs</Breadcrumb>
</Breadcrumbs>
```

### Breadcrumbs.tsx

```tsx
'use client';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { Breadcrumb as AriaBreadcrumb, Breadcrumbs as AriaBreadcrumbs, BreadcrumbProps, BreadcrumbsProps, LinkProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { Link } from './Link';
import { composeTailwindRenderProps } from './utils';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={twMerge('flex gap-1', props.className)} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <AriaBreadcrumb {...props} className={composeTailwindRenderProps(props.className, 'flex items-center gap-1')}>
      {({isCurrent}) => (<>
       <Link variant="secondary" {...props} />
        {!isCurrent && <ChevronRight className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />}
      </>)}
    </AriaBreadcrumb>
  );
}

```

## Content

`Breadcrumbs` follows the [Collection Components API](collections.md?component=Breadcrumbs), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children. The `onAction` event is called when a user presses a breadcrumb.

```tsx
import type {Key} from 'react-aria-components';
import {Breadcrumbs, Breadcrumb} from 'vanilla-starter/Breadcrumbs';
import {useState} from 'react';

function Example() {
  let [breadcrumbs, setBreadcrumbs] = useState([
    {id: 1, label: 'Home'},
    {id: 2, label: 'Trendy'},
    {id: 3, label: 'March 2022 Assets'}
  ]);

  let navigate = (id: Key) => {
    let i = breadcrumbs.findIndex(item => item.id === id);
    setBreadcrumbs(breadcrumbs.slice(0, i + 1));
  };

  return (
    /*- begin highlight -*/
    <Breadcrumbs items={breadcrumbs} onAction={navigate}>
      {item => <Breadcrumb>{item.label}</Breadcrumb>}
    </Breadcrumbs>
    /*- end highlight -*/
  );
}
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>When breadcrumbs are used as a main navigation element for a page, they can be placed in a [navigation landmark](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html). Landmarks help assistive technology users quickly find major sections of a page. Place breadcrumbs inside a `<nav>` element with an `aria-label` to create a navigation landmark.</Content>
</InlineAlert>

## A

PI

```tsx
<Breadcrumbs>
  <Breadcrumb>
    <Link />
  </Breadcrumb>
</Breadcrumbs>
```

### Breadcrumbs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode | ((item: T) => React.ReactNode)` | — | The contents of the collection. |
| `className` | `string | undefined` | 'react-aria-Breadcrumbs' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the breadcrumbs are disabled. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a breadcrumb is clicked. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLOListElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLOListElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLOListElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLOListElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLOListElement> | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Breadcrumb

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<BreadcrumbRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<BreadcrumbRenderProps> | undefined` | 'react-aria-Breadcrumb' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is pressed. |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLLIElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLLIElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLLIElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLLIElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLLIElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: BreadcrumbRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
