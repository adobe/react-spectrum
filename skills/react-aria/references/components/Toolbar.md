# Toolbar

A toolbar is a container for a set of interactive controls, such as buttons, dropdown menus, or checkboxes,
with arrow key navigation.

## Vanilla 

CSS example

```tsx
import {Toolbar} from 'vanilla-starter/Toolbar';
import {ToggleButtonGroup} from 'vanilla-starter/ToggleButtonGroup';
import {ToggleButton} from 'vanilla-starter/ToggleButton';
import {Button} from 'vanilla-starter/Button';
import {Select, SelectItem} from 'vanilla-starter/Select';
import {Separator} from 'vanilla-starter/Separator';
import {Group} from 'react-aria-components';
import {Bold, Italic, Underline, ClipboardCopy, Scissors, ClipboardPaste} from 'lucide-react';

<Toolbar>
  <ToggleButtonGroup aria-label="Style">
    <ToggleButton id="bold" aria-label="Bold">
      <Bold size={16} />
    </ToggleButton>
    <ToggleButton id="italic" aria-label="Italic">
      <Italic size={16} />
    </ToggleButton>
    <ToggleButton id="underline" aria-label="Underline">
      <Underline size={16} />
    </ToggleButton>
  </ToggleButtonGroup>
  <Separator />
  <Group aria-label="Clipboard">
    <Button aria-label="Copy">
      <ClipboardCopy size={16} />
    </Button>
    <Button aria-label="Cut">
      <Scissors size={16} />
    </Button>
    <Button aria-label="Paste">
      <ClipboardPaste size={16} />
    </Button>
  </Group>
  <Separator />
  <Select aria-label="Font" defaultSelectedKey="helvetica">
    <SelectItem id="helvetica">Helvetica</SelectItem>
    <SelectItem id="times">Times</SelectItem>
    <SelectItem id="comic-sans">Comic Sans</SelectItem>
  </Select>
</Toolbar>
```

### Toolbar.tsx

```tsx
'use client';
import {Toolbar as RACToolbar, SeparatorContext, ToggleButtonGroupContext, ToolbarProps} from 'react-aria-components';
import './Toolbar.css';

export function Toolbar(props: ToolbarProps) {
  let {orientation = 'horizontal'} = props;
  return (
    <ToggleButtonGroupContext.Provider value={{orientation}}>
      <SeparatorContext.Provider value={{orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal'}}>
        <RACToolbar {...props} />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}

```

### Toolbar.css

```css
@import "./theme.css";

.react-aria-Toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-1);
  width: fit-content;

  &[data-orientation=horizontal] {
    flex-direction: row;
  }
  
  &[data-orientation=vertical] {
    flex-direction: column;
    align-items: start;
  }

  .react-aria-Group {
    display: contents;
  }

  .react-aria-Separator {
    &[aria-orientation=vertical] {
      height: auto;
      margin: 0px var(--spacing-1);
    }
  }
}

```

## Tailwind example

```tsx
import {Toolbar} from 'tailwind-starter/Toolbar';
import {ToggleButtonGroup} from 'tailwind-starter/ToggleButtonGroup';
import {ToggleButton} from 'tailwind-starter/ToggleButton';
import {Button} from 'tailwind-starter/Button';
import {Select, SelectItem} from 'tailwind-starter/Select';
import {Group} from 'react-aria-components';
import {Bold, Italic, Underline, ClipboardCopy, Scissors, ClipboardPaste} from 'lucide-react';

<Toolbar>
  <ToggleButtonGroup selectionMode="multiple" aria-label="Style">
    <ToggleButton aria-label="Bold">
      <Bold size={16} />
    </ToggleButton>
    <ToggleButton aria-label="Italic">
      <Italic size={16} />
    </ToggleButton>
    <ToggleButton aria-label="Underline">
      <Underline size={16} />
    </ToggleButton>
  </ToggleButtonGroup>
  <Group aria-label="Clipboard" className="flex gap-1" style={{flexDirection: 'inherit'}}>
    <Button aria-label="Copy" variant="secondary">
      <ClipboardCopy size={16} />
    </Button>
    <Button aria-label="Cut" variant="secondary">
      <Scissors size={16} />
    </Button>
    <Button aria-label="Paste" variant="secondary">
      <ClipboardPaste size={16} />
    </Button>
  </Group>
  <Select aria-label="Font" defaultSelectedKey="helvetica">
    <SelectItem id="helvetica">Helvetica</SelectItem>
    <SelectItem id="times">Times</SelectItem>
    <SelectItem id="comic-sans">Comic Sans</SelectItem>
  </Select>
</Toolbar>
```

### Toolbar.tsx

```tsx
'use client';
import React from 'react';
import { Toolbar as RACToolbar, ToggleButtonGroupContext, ToolbarProps, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

const styles = tv({
  base: 'flex flex-wrap gap-2',
  variants: {
    orientation: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col items-start'
    }
  }
})

export function Toolbar(props: ToolbarProps) {
  return (
    <ToggleButtonGroupContext.Provider value={{orientation: props.orientation}}>
      <RACToolbar
        {...props}
        className={composeRenderProps(
          props.className,
          (className, renderProps) => styles({...renderProps, className})
        )} />
    </ToggleButtonGroupContext.Provider>
  );
}

```

## A

PI

```tsx
<Toolbar>
  <Button />
  <ToggleButtonGroup>
    <ToggleButton />
  </ToggleButtonGroup>
  <Separator />
  <Group>
    <Button />
  </Group>
  <Select />
</Toolbar>
```

### Toolbar

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<ToolbarRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ToolbarRenderProps> | undefined` | 'react-aria-Toolbar' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
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
| `orientation` | `Orientation | undefined` | 'horizontal' | The orientation of the entire toolbar. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ToolbarRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
