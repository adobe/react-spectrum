# Number

Field

A number field allows a user to enter a number, and increment or decrement the value using stepper buttons.

## Vanilla 

CSS example

### Number

Field.tsx

```tsx
'use client';
import {
  Group,
  Input,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ValidationResult
} from 'react-aria-components';
import {Button} from './Button';
import {Plus, Minus} from 'lucide-react';
import {Label, FieldError, Description} from './Form';
import './NumberField.css';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function NumberField(
  { label, description, errorMessage, ...props }: NumberFieldProps
) {
  return (
    (
      <AriaNumberField {...props}>
        <Label>{label}</Label>
        <Group>
          <Input className="react-aria-Input inset" />
          <Button slot="decrement" variant="secondary"><Minus /></Button>
          <Button slot="increment" variant="secondary"><Plus /></Button>
        </Group>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
      </AriaNumberField>
    )
  );
}

```

### Number

Field.css

```css
@import "./theme.css";
@import "./TextField.css";

.react-aria-NumberField {
  color: var(--text-color);

  .react-aria-Group {
    display: flex;
    width: fit-content;
    border-radius: var(--radius);
    position: relative;
    box-shadow: 0 1px 0 var(--gray-50);

    &[data-invalid]::after {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: 2;
      pointer-events: none;
      border-radius: inherit;
      outline: 1px solid var(--invalid-color);
    }

    &[data-focus-within]::after {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: 2;
      pointer-events: none;
      border-radius: inherit;
      outline: 2px solid var(--focus-ring-color);
    }
  }

  .react-aria-Button {
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: -1px;

    &[slot=decrement] {
      border-radius: 0;
    }

    &[slot=increment] {
      border-radius: var(--radius);
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
  }

  .react-aria-Input {
    z-index: 1;
    outline: none;
    width: 5.25rem;
    flex: 1;
    border-start-end-radius: 0;
    border-end-end-radius: 0;

    &[data-invalid] {
      border-color: var(--border-color);
    }
  }

  [slot=description] {
    font-size: 12px;
  }
}

```

## Tailwind example

### Number

Field.tsx

```tsx
'use client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import {
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  Button,
  ButtonProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Input, Label, fieldBorderStyles } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function NumberField(
  { label, description, errorMessage, placeholder, ...props }: NumberFieldProps
) {
  return (
    <AriaNumberField {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans')}>
      <Label>{label}</Label>
      <FieldGroup>
        {renderProps => (<>
          <Input className="w-20" placeholder={placeholder} />
          <div className={fieldBorderStyles({...renderProps, class: 'flex flex-col border-s h-full'})}>
            <StepperButton slot="increment">
              <ChevronUp aria-hidden className="w-4 h-4" />
            </StepperButton>
            <div className={fieldBorderStyles({...renderProps, class: 'border-b'})} />
            <StepperButton slot="decrement">
              <ChevronDown aria-hidden className="w-4 h-4" />
            </StepperButton>
          </div>
        </>)}
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}

function StepperButton(props: ButtonProps) {
  return <Button {...props} className="flex border-0 py-0 px-0.5 flex-1 box-border cursor-default text-neutral-500 bg-transparent pressed:bg-neutral-100 group-disabled:text-neutral-200 dark:text-neutral-400 dark:pressed:bg-neutral-800 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText] [-webkit-tap-highlight-color:transparent]" />
}

```

## Value

Use the `value` or `defaultValue` prop to set the number value. The `onChange` event is called when the user finishes editing the value (e.g. on blur, incrementing, or decrementing).

```tsx
import {NumberField} from 'vanilla-starter/NumberField';
import {useState} from 'react';

function Example() {
  let [value, setValue] = useState(25);
  return (
    <div>
      <NumberField
        label="Cookies to buy"
        value={value}
        onChange={setValue}
      />
      <p>Current value: {value}</p>
    </div>
  );
}
```

### Format options

Use the `formatOptions` prop to control how the value is formatted (according to the user's locale). This is compatible with the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) API.

```tsx
import {VanillaNumberField} from '@react-spectrum/s2';

<VanillaNumberField />
```

### Value scale

Use the `minValue`, `maxValue`, and `step` props to set the allowed values. Steps are calculated starting from the minimum. For example, if `minValue={2}`, and `step={3}`, the valid step values would be 2, 5, 8, 11, etc.

```tsx
import {VanillaNumberField} from '@react-spectrum/s2';

<VanillaNumberField />
```

### Numbering system

By default, `NumberField` displays the value using the numbering system for the user's locale. Use `<I18nProvider>` to override the numbering system by setting the [Unicode numbering system locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/numberingSystem#adding_a_numbering_system_via_the_locale_string). The Latin, Arabic, Devanagari, Bengali, and Han positional decimal numbering systems are currently supported.

```tsx
import {I18nProvider} from 'react-aria-components';
import {NumberField} from 'vanilla-starter/NumberField';

<I18nProvider>
  <NumberField label="Value" defaultValue={1024} />
</I18nProvider>
```

## Forms

Use the `name` prop to submit the raw number value (not a formatted string) to the server. Set the `isRequired` prop to validate that the user enters a value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {NumberField} from 'vanilla-starter/NumberField';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <NumberField label="Width" name="width" isRequired />
  <Button type="submit">Submit</Button>
</Form>
```

## A

PI

```tsx
<NumberField>
  <Label />
  <Group>
    <Input />
    <Button slot="increment" />
    <Button slot="decrement" />
  </Group>
  <Text slot="description" />
  <FieldError />
</NumberField>
```

### Number

Field

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<NumberFieldRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<NumberFieldRenderProps> | undefined` | 'react-aria-NumberField' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `decrementAriaLabel` | `string | undefined` | — | A custom aria-label for the decrement button. If not provided, the localized string "Decrement" is used. |
| `defaultValue` | `number | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `formatOptions` | `Intl.NumberFormatOptions | undefined` | — | Formatting options for the value displayed in the number field. This also affects what characters are allowed to be typed by the user. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `incrementAriaLabel` | `string | undefined` | — | A custom aria-label for the increment button. If not provided, the localized string "Increment" is used. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isWheelDisabled` | `boolean | undefined` | — | Enables or disables changing the value with scroll. |
| `lang` | `string | undefined` | — |  |
| `maxValue` | `number | undefined` | — | The largest value allowed for the input. |
| `minValue` | `number | undefined` | — | The smallest value allowed for the input. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInput` | `React.FormEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the input value is about to be modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event). |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: number) => void) | undefined` | — | Handler that is called when the value changes. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a text composition system completes or cancels the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event). |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a text composition system starts a new text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event). |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when a new character is received in the current text composition session. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event). |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user copies text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy). |
| `onCut` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user cuts text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut). |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the input value is modified. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event). |
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
| `onPaste` | `React.ClipboardEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when the user pastes text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste). |
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
| `onSelect` | `React.ReactEventHandler<HTMLInputElement> | undefined` | — | Handler that is called when text in the input is selected. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/select_event). |
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
| `step` | `number | undefined` | — | The amount that the input value changes with each increment or decrement "tick". |
| `style` | `(React.CSSProperties | ((values: NumberFieldRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: number) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `number | undefined` | — | The current value (controlled). |
