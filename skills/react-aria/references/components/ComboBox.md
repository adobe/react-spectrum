# Combo

Box

A combo box combines a text input with a listbox, allowing users to filter a list of options to items matching a query.

## Vanilla 

CSS example

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';

<ComboBox>
  <ComboBoxItem>Aardvark</ComboBoxItem>
  <ComboBoxItem>Cat</ComboBoxItem>
  <ComboBoxItem>Dog</ComboBoxItem>
  <ComboBoxItem>Kangaroo</ComboBoxItem>
  <ComboBoxItem>Panda</ComboBoxItem>
  <ComboBoxItem>Snake</ComboBoxItem>
</ComboBox>
```

### Combo

Box.tsx

```tsx
'use client';
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  Input,
  ListBoxItemProps,
  ListBoxProps,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, FieldButton, Description} from './Form';
import {DropdownItem, DropdownListBox} from './ListBox';
import {Popover} from './Popover';
import {ChevronDown} from 'lucide-react';

import './ComboBox.css';

export interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
  placeholder?: string;
}

export function ComboBox<T extends object>(
  { label, description, errorMessage, children, placeholder, ...props }: ComboBoxProps<T>
) {
  return (
    <AriaComboBox {...props}>
      <Label>{label}</Label>
      <div className="combobox-field">
        <Input className="react-aria-Input inset" placeholder={placeholder} />
        <FieldButton><ChevronDown /></FieldButton>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className="combobox-popover">
        <ComboBoxListBox>
          {children}
        </ComboBoxListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

```

### Combo

Box.css

```css
@import "./theme.css";
@import "./TextField.css";

.react-aria-ComboBox {
  color: var(--text-color);
  width: calc(var(--spacing) * 50);

  .combobox-field {
    display: flex;
    align-items: center;
    height: var(--spacing-8);
    width: 100%;
  }

  .react-aria-Input {
    width: 100%;
    padding: 0 calc(var(--spacing-3) + var(--spacing-6)) 0 var(--spacing-3);
  }
}

.combobox-popover[data-trigger=ComboBox] {
  width: var(--trigger-width);
  padding: 0;
}

```

## Tailwind example

```tsx
import {ComboBox, ComboBoxItem} from 'tailwind-starter/ComboBox';

<ComboBox>
  <ComboBoxItem>Aardvark</ComboBoxItem>
  <ComboBoxItem>Cat</ComboBoxItem>
  <ComboBoxItem>Dog</ComboBoxItem>
  <ComboBoxItem>Kangaroo</ComboBoxItem>
  <ComboBoxItem>Panda</ComboBoxItem>
  <ComboBoxItem>Snake</ComboBoxItem>
</ComboBox>
```

### Combo

Box.tsx

```tsx
'use client';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  ListBox,
  ListBoxItemProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Input, Label } from './Field';
import { DropdownItem, DropdownSection, DropdownSectionProps } from './ListBox';
import { Popover } from './Popover';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBox<T extends object>(
  { label, description, errorMessage, children, items, ...props }: ComboBoxProps<T>
) {
  return (
    <AriaComboBox {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans')}>
      <Label>{label}</Label>
      <FieldGroup>
        <Input className="ps-3 pe-1" />
        <FieldButton className="w-6 mr-1 outline-offset-0">
          <ChevronDown aria-hidden className="w-4 h-4" />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-(--trigger-width)">
        <ListBox items={items} className="outline-0 p-1 box-border max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]">
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function ComboBoxSection<T extends object>(props: DropdownSectionProps<T>) {
  return <DropdownSection {...props} />;
}

```

## Content

`ComboBox` reuses the `ListBox` component, following the [Collection Components API](collections.md?component=ComboBox). It supports ListBox features such as static and dynamic collections, sections, disabled items, links, text slots, asynchronous loading, etc. See the [ListBox docs](ListBox.md) for more details.

The following example shows a dynamic collection of items, grouped into sections.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {ListBoxSection, Collection, Header} from 'react-aria-components';

function Example() {
  /*- begin collapse -*/
  let options = [
    {name: 'Fruit', children: [
      {name: 'Apple'},
      {name: 'Banana'},
      {name: 'Orange'},
      {name: 'Honeydew'},
      {name: 'Grapes'},
      {name: 'Watermelon'},
      {name: 'Cantaloupe'},
      {name: 'Pear'}
    ]},
    {name: 'Vegetable', children: [
      {name: 'Cabbage'},
      {name: 'Broccoli'},
      {name: 'Carrots'},
      {name: 'Lettuce'},
      {name: 'Spinach'},
      {name: 'Bok Choy'},
      {name: 'Cauliflower'},
      {name: 'Potatoes'}
    ]}
  ];
  /*- end collapse -*/

  return (
    /*- begin highlight -*/
    <ComboBox
      label="Preferred fruit or vegetable"
      placeholder="Select an option"
      defaultItems={options}>
      {section => (
        <ListBoxSection id={section.name}>
          <Header>{section.name}</Header>
          <Collection items={section.children}>
            {item => <ComboBoxItem id={item.name}>{item.name}</ComboBoxItem>}
          </Collection>
        </ListBoxSection>
      )}
    </ComboBox>
    /*- end highlight -*/
  );
}
```

## Selection

Use the `defaultSelectedKey` or `selectedKey` prop to set the selected item. The selected key corresponds to the `id` prop of an item. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=ComboBox#single-selection) for more details.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {useState} from 'react';
import type {Key} from 'react-aria-components';

function Example() {
  let [animal, setAnimal] = useState<Key | null>("bison");

  return (
    <div>
      <ComboBox
        label="Favorite Animal"
        placeholder="Select an animal"
        /*- begin highlight -*/
        selectedKey={animal}
        onSelectionChange={setAnimal}>
        {/*- end highlight -*/}
        <ComboBoxItem id="koala">Koala</ComboBoxItem>
        <ComboBoxItem id="kangaroo">Kangaroo</ComboBoxItem>
        <ComboBoxItem id="platypus" isDisabled>Platypus</ComboBoxItem>
        <ComboBoxItem id="eagle">Bald Eagle</ComboBoxItem>
        <ComboBoxItem id="bison">Bison</ComboBoxItem>
        <ComboBoxItem id="skunk">Skunk</ComboBoxItem>
      </ComboBox>
      <p>Current selection: {animal}</p>
    </div>
  );
}
```

### Input value

Use the `inputValue` or `defaultInputValue` prop to set the value of the input field. By default, the value will be reverted to the selected item on blur. Set the `allowsCustomValue` prop to enable entering values that are not in the list.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {useState} from 'react';

function Example(props) {
  let [value, setValue] = useState('Kangaroo');

  return (
    <div>
      <ComboBox
        {...props}
        label="Favorite Animal"
        placeholder="Select an animal"
        /*- begin highlight -*/
        
        inputValue={value}
        onInputChange={setValue}>
        {/*- end highlight -*/}
        <ComboBoxItem id="koala">Koala</ComboBoxItem>
        <ComboBoxItem id="kangaroo">Kangaroo</ComboBoxItem>
        <ComboBoxItem id="platypus">Platypus</ComboBoxItem>
        <ComboBoxItem id="eagle">Bald Eagle</ComboBoxItem>
        <ComboBoxItem id="bison">Bison</ComboBoxItem>
        <ComboBoxItem id="skunk">Skunk</ComboBoxItem>
      </ComboBox>
      <p>Current input value: {value}</p>
    </div>
  );
}
```

### Fully controlled

Both `inputValue` and `selectedKey` can be controlled simultaneously. However, each interaction will only trigger either `onInputChange` or `onSelectionChange`, not both. When controlling both props, you must update both values accordingly.

```tsx
import type {Key} from 'react-aria-components';
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {useState} from 'react';

function ControlledComboBox() {
  /*- begin collapse -*/
  let options = [
    {id: 1, name: 'Aerospace'},
    {id: 2, name: 'Mechanical'},
    {id: 3, name: 'Civil'},
    {id: 4, name: 'Biomedical'},
    {id: 5, name: 'Nuclear'},
    {id: 6, name: 'Industrial'},
    {id: 7, name: 'Chemical'},
    {id: 8, name: 'Agricultural'},
    {id: 9, name: 'Electrical'}
  ];
  /*- end collapse -*/

  let [fieldState, setFieldState] = useState<{selectedKey: Key | null, inputValue: string}>({
    selectedKey: null,
    inputValue: ''
  });

  let onSelectionChange = (id: Key | null) => {
    // Update inputValue when selectedKey changes.
    setFieldState({
      inputValue: id == null ? '' : options.find(o => o.id === id)?.name ?? '',
      selectedKey: id
    });
  };

  let onInputChange = (value: string) => {
    // Reset selectedKey to null if the input is cleared.
    setFieldState(prevState => ({
      inputValue: value,
      selectedKey: value === '' ? null : prevState.selectedKey
    }));
  };

  return (
    <div>
      <ComboBox
        label="Engineering major"
        placeholder="Select a major"
        /*- begin highlight -*/
        defaultItems={options}
        selectedKey={fieldState.selectedKey}
        inputValue={fieldState.inputValue}
        onSelectionChange={onSelectionChange}
        onInputChange={onInputChange}>
        {/*- end highlight -*/}
        {item => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
      <pre style={{fontSize: 12}}>
        Current selected major id: {fieldState.selectedKey}{'\n'}
        Current input text: {fieldState.inputValue}
      </pre>
    </div>
  );
}
```

## Item actions

Use the `onAction` prop on a `<ListBoxItem>` to perform a custom action when the item is pressed. This example adds a "Create" action for the current input value.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {useState} from 'react';

function Example() {
  let [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      label="Favorite Animal"
      placeholder="Select an animal"
      allowsEmptyCollection
      inputValue={inputValue}
      onInputChange={setInputValue}>
      {/*- begin highlight -*/}
      {inputValue.length > 0 && (
        <ComboBoxItem onAction={() => alert('Creating ' + inputValue)}>
          {`Create "${inputValue}"`}
        </ComboBoxItem>
      )}
      {/*- end highlight -*/}
      <ComboBoxItem>Aardvark</ComboBoxItem>
      <ComboBoxItem>Cat</ComboBoxItem>
      <ComboBoxItem>Dog</ComboBoxItem>
      <ComboBoxItem>Kangaroo</ComboBoxItem>
      <ComboBoxItem>Panda</ComboBoxItem>
      <ComboBoxItem>Snake</ComboBoxItem>
    </ComboBox>
  );
}
```

## Forms

Use the `name` prop to submit the `id` of the selected item to the server. Set the `isRequired` prop to validate that the user selects a value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';;

<Form>
  <ComboBox
    label="Animal"
    placeholder="e.g. Cat"
    /*- begin highlight -*/
    name="animal"
    isRequired
    /*- end highlight -*/
    description="Please select an animal.">
    <ComboBoxItem id="aardvark">Aardvark</ComboBoxItem>
    <ComboBoxItem id="cat">Cat</ComboBoxItem>
    <ComboBoxItem id="dog">Dog</ComboBoxItem>
    <ComboBoxItem id="kangaroo">Kangaroo</ComboBoxItem>
    <ComboBoxItem id="panda">Panda</ComboBoxItem>
    <ComboBoxItem id="snake">Snake</ComboBoxItem>
  </ComboBox>
  <Button type="submit">Submit</Button>
</Form>
```

## Popover

Use the `menuTrigger` prop to control when the popover opens:

* `input` (default): popover opens when the user edits the input text.
* `focus`: popover opens when the user focuses the input.
* `manual`: popover only opens when the user presses the trigger button or uses the arrow keys.

Use `allowsEmptyCollection` to keep the popover open when there are no items available in the list.

```tsx
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';

<ComboBox>
  <ComboBoxItem id="red panda">Red Panda</ComboBoxItem>
  <ComboBoxItem id="cat">Cat</ComboBoxItem>
  <ComboBoxItem id="dog">Dog</ComboBoxItem>
  <ComboBoxItem id="aardvark">Aardvark</ComboBoxItem>
  <ComboBoxItem id="kangaroo">Kangaroo</ComboBoxItem>
  <ComboBoxItem id="snake">Snake</ComboBoxItem>
</ComboBox>
```

## A

PI

```tsx
<ComboBox>
  <Label />
  <Input />
  <Button />
  <Text slot="description" />
  <FieldError />
  <Popover>
    <ListBox />
  </Popover>
</ComboBox>
```

### Combo

Box

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsCustomValue` | `boolean | undefined` | — | Whether the ComboBox allows a non-item matching input value to be set. |
| `allowsEmptyCollection` | `boolean | undefined` | — | Whether the combo box allows the menu to be open when the collection is empty. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<ComboBoxRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ComboBoxRenderProps> | undefined` | 'react-aria-ComboBox' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultFilter` | `((textValue: string, inputValue: string) => boolean) | undefined` | — | The filter function used to determine if a option should be included in the combo box list. |
| `defaultInputValue` | `string | undefined` | — | The default value of the ComboBox input (uncontrolled). |
| `defaultItems` | `Iterable<T> | undefined` | — | The list of ComboBox items (uncontrolled). |
| `defaultSelectedKey` | `Key | undefined` | — | The initial selected key in the collection (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `formValue` | `"text" | "key" | undefined` | 'key' | Whether the text or key of the selected item is submitted as part of an HTML form. When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `inputValue` | `string | undefined` | — | The value of the ComboBox input (controlled). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isTriggerUpWhenOpen` | `boolean | undefined` | — | Whether the trigger is up when the overlay is open. |
| `items` | `Iterable<T> | undefined` | — | The list of ComboBox items (controlled). |
| `lang` | `string | undefined` | — |  |
| `menuTrigger` | `MenuTriggerAction | undefined` | 'input' | The interaction required to display the ComboBox menu. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<HTMLInputElement, Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<HTMLInputElement, Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInputChange` | `((value: string) => void) | undefined` | — | Handler that is called when the ComboBox input value changes. |
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
| `onOpenChange` | `((isOpen: boolean, menuTrigger?: MenuTriggerAction) => void) | undefined` | — | Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. |
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
| `onSelectionChange` | `((key: Key | null) => void) | undefined` | — | Handler that is called when the selection changes. |
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
| `selectedKey` | `Key | null | undefined` | — | The currently selected key in the collection (controlled). |
| `shouldFocusWrap` | `boolean | undefined` | — | Whether keyboard navigation is circular. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: ComboBoxRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: ComboBoxValidationValue) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
