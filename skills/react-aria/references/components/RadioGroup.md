# Radio

Group

A radio group allows a user to select a single item from a list of mutually exclusive options.

## Vanilla 

CSS example

```tsx
import {RadioGroup, Radio} from 'vanilla-starter/RadioGroup';

<RadioGroup>
  <Radio value="cat">Cat</Radio>
  <Radio value="dog">Dog</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

### Radio

Group.tsx

```tsx
'use client';
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  ValidationResult,
  RadioProps,
  Radio as AriaRadio,
  composeRenderProps
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';
import './RadioGroup.css';
import './utilities.css';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(
  {
    label,
    description,
    errorMessage,
    children,
    ...props
  }: RadioGroupProps
) {
  return (
    <AriaRadioGroup {...props}>
      <Label>{label}</Label>
      <div className="radio-items">
        {children}
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export function Radio(props: RadioProps) {
  return (
    <AriaRadio {...props}>
      {composeRenderProps(props.children, (children) => (
        <>
          <div className="indicator" />
          {children}
        </>
      ))}
    </AriaRadio>
  )
}

```

### Radio

Group.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-RadioGroup {
  display: flex;
  flex-direction: column;
  color: var(--text-color);

  .radio-items {
    display: flex;
    gap: var(--spacing-3);
  }

  &[data-orientation=vertical] .radio-items {
    flex-direction: column;
  }

  &[data-orientation=horizontal] .radio-items {
    flex-direction: row;
  }
}

.react-aria-Radio {
  display: flex;
  /* This is needed so the HiddenInput is positioned correctly */
  position: relative;
  align-items: center;
  gap: var(--spacing-2);
  font: var(--font-size) system-ui;
  color: var(--text-color);
  forced-color-adjust: none;
  -webkit-tap-highlight-color: transparent;
  --dot-color: white;
  @media (forced-colors: active) {
    --dot-color: HighlightText;
  }

  .indicator {
    position: relative;
    width: calc(var(--spacing) * 4.5);
    height: calc(var(--spacing) * 4.5);
    box-sizing: border-box;
    border-radius: 50%;
    transition: all 200ms;

    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      border-radius: inherit;
      background: transparent;
      transition: scale 200ms;
      scale: 0;
    }
  }

  &[data-selected] {
    .indicator::after {
      background: var(--dot-color);
      scale: 0.37;
    }
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
    --dot-color: var(--text-color-disabled);
  }
}

```

## Tailwind example

```tsx
import {RadioGroup, Radio} from 'tailwind-starter/RadioGroup';

<RadioGroup>
  <Radio value="cat">Cat</Radio>
  <Radio value="dog">Dog</Radio>
  <Radio value="dragon">Dragon</Radio>
</RadioGroup>
```

### Radio

Group.tsx

```tsx
'use client';
import React, { ReactNode } from 'react';
import { composeRenderProps, Radio as RACRadio, RadioGroup as RACRadioGroup, RadioGroupProps as RACRadioGroupProps, RadioProps, ValidationResult } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: string,
  children?: ReactNode,
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <RACRadioGroup {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-2 font-sans')}>
      <Label>{props.label}</Label>
      <div className="flex group-orientation-vertical:flex-col gap-2 group-orientation-horizontal:gap-4">
        {props.children}
      </div>
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

const styles = tv({
  extend: focusRing,
  base: 'w-4.5 h-4.5 box-border rounded-full border bg-white dark:bg-neutral-900 transition-all',
  variants: {
    isSelected: {
      false: 'border-neutral-400 dark:border-neutral-400 group-pressed:border-neutral-500 dark:group-pressed:border-neutral-300',
      true: 'border-[calc(var(--spacing)*1.5)] border-neutral-700 dark:border-neutral-300 forced-colors:border-[Highlight]! group-pressed:border-neutral-800 dark:group-pressed:border-neutral-200'
    },
    isInvalid: {
      true: 'border-red-700 dark:border-red-600 group-pressed:border-red-800 dark:group-pressed:border-red-700 forced-colors:border-[Mark]!'
    },
    isDisabled: {
      true: 'border-neutral-200 dark:border-neutral-700 forced-colors:border-[GrayText]!'
    }
  }
});

export function Radio(props: RadioProps) {
  return (
    <RACRadio {...props} className={composeTailwindRenderProps(props.className, 'flex relative gap-2 items-center group text-neutral-800 disabled:text-neutral-300 dark:text-neutral-200 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText] text-sm transition [-webkit-tap-highlight-color:transparent]')}>
      {composeRenderProps(props.children, (children, renderProps) => <>
        <div className={styles(renderProps)} />
        {children}
      </>)}
    </RACRadio>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the selected item, and `onChange` to handle selection changes.

```tsx
import {RadioGroup, Radio} from 'vanilla-starter/RadioGroup';
import {useState} from 'react';

function Example() {
  let [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <RadioGroup
        label="Favorite sport"
        /*- begin highlight -*/
        value={selected}
        onChange={setSelected}>
        {/*- end highlight -*/}
        <Radio value="soccer">Soccer</Radio>
        <Radio value="baseball">Baseball</Radio>
        <Radio value="basketball">Basketball</Radio>
      </RadioGroup>
      <p>Current selection: {selected || 'None'}</p>
    </>
  );
}
```

## Forms

Use the `name` prop to submit the selected radio to the server. Set the `isRequired` prop to validate that the user selects an option, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {RadioGroup, Radio} from 'vanilla-starter/RadioGroup';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <RadioGroup
    label="Favorite pet"
    /*- begin highlight -*/
    name="pet"
    isRequired>
    {/*- end highlight -*/}
    <Radio value="dog">Dog</Radio>
    <Radio value="cat">Cat</Radio>
    <Radio value="dragon">Dragon</Radio>
  </RadioGroup>
  <Button type="submit" style={{marginTop: 8}}>Submit</Button>
</Form>
```

## A

PI

```tsx
<RadioGroup>
  <Label />
  <Radio>
    <SelectionIndicator />
  </Radio>
  <Text slot="description" />
  <FieldError />
</RadioGroup>
```

### Radio

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ChildrenOrFunction<RadioGroupRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<RadioGroupRenderProps> | undefined` | 'react-aria-RadioGroup' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultValue` | `string | null | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
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
| `onChange` | `((value: string) => void) | undefined` | — | Handler that is called when the value changes. |
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
| `orientation` | `Orientation | undefined` | 'vertical' | The axis the Radio Button(s) should align with. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: RadioGroupRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: string) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `string | null | undefined` | — | The current value (controlled). |

### Radio

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode` | — | The label for the element. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inputRef` | `RefObject<HTMLInputElement | null> | undefined` | — | A ref for the HTML input element. |
| `isDisabled` | `boolean | undefined` | — | Whether the radio button is disabled or not. Shows that a selection exists, but is not available in that circumstance. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `string` | — | The value of the radio button, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value). |
