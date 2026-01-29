# Select

A select displays a collapsible list of options and allows a user to select one of them.

## Vanilla 

CSS example

```tsx
import {Select, SelectItem} from 'vanilla-starter/Select';

<Select>
  <SelectItem>Aardvark</SelectItem>
  <SelectItem>Cat</SelectItem>
  <SelectItem>Dog</SelectItem>
  <SelectItem>Kangaroo</SelectItem>
  <SelectItem>Panda</SelectItem>
  <SelectItem>Snake</SelectItem>
</Select>
```

### Select.tsx

```tsx
'use client';
import {
  ListBoxItemProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  ValidationResult,
  ListBoxProps
} from 'react-aria-components';
import {Button} from './Button';
import {DropdownItem, DropdownListBox} from './ListBox';
import {ChevronDown} from 'lucide-react';
import {Popover} from './Popover';
import {Label, FieldError, Description} from './Form';
import './Select.css';

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<
    T
  >
) {
  return (
    (
      <AriaSelect {...props}>
        {label && <Label>{label}</Label>}
        <Button>
          <SelectValue />
          <ChevronDown />
        </Button>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow className="select-popover">
          <SelectListBox items={items}>
            {children}
          </SelectListBox>
        </Popover>
      </AriaSelect>
    )
  );
}

export function SelectListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

```

### Select.css

```css
@import "./theme.css";

.react-aria-Select {
  color: var(--text-color);
  position: relative;
  width: 200px;

  .react-aria-Button {
    --button-color: var(--gray);
    padding: 0 var(--spacing-2) 0 var(--spacing-3);
    width: 100%;
    min-width: 0;

    &[data-pressed] {
      scale: 1;
    }
  }

  .react-aria-SelectValue {
    flex: 1;
    text-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-placeholder] {
      color: var(--text-color-placeholder);
      font-weight: normal;
    }
  }

  .lucide-chevron-down {
    margin-inline-start: var(--spacing-2);
  }

  .react-aria-SelectValue {
    [slot=description] {
      display: none;
    }
  }
}

.select-popover[data-trigger=Select] {
  width: var(--trigger-width);
  padding: 0;
}

```

## Tailwind example

```tsx
import {Select, SelectItem} from 'tailwind-starter/Select';

<Select>
  <SelectItem>Aardvark</SelectItem>
  <SelectItem>Cat</SelectItem>
  <SelectItem>Dog</SelectItem>
  <SelectItem>Kangaroo</SelectItem>
  <SelectItem>Panda</SelectItem>
  <SelectItem>Snake</SelectItem>
</Select>
```

### Select.tsx

```tsx
'use client';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button,
  ListBox,
  ListBoxItemProps,
  SelectValue,
  ValidationResult
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field';
import { DropdownItem, DropdownSection, DropdownSectionProps } from './ListBox';
import { Popover } from './Popover';
import { composeTailwindRenderProps, focusRing } from './utils';

const styles = tv({
  extend: focusRing,
  base: 'flex items-center text-start gap-4 w-full font-sans border border-black/10 dark:border-white/10 cursor-default rounded-lg pl-3 pr-2 h-9 min-w-[180px] transition bg-neutral-50 dark:bg-neutral-700 [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      false: 'text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 pressed:bg-neutral-200 dark:hover:bg-neutral-600 dark:pressed:bg-neutral-500 group-invalid:outline group-invalid:outline-red-600 forced-colors:group-invalid:outline-[Mark]',
      true: 'border-transparent dark:border-transparent text-neutral-200 dark:text-neutral-600 forced-colors:text-[GrayText] bg-neutral-100 dark:bg-neutral-800'
    }
  }
});

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<T>
) {
  return (
    <AriaSelect {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 relative font-sans')}>
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm">
          {({selectedText, defaultChildren}) => selectedText || defaultChildren}
        </SelectValue>
        <ChevronDown aria-hidden className="w-4 h-4 text-neutral-600 dark:text-neutral-400 forced-colors:text-[ButtonText] group-disabled:text-neutral-200 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText]" />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-(--trigger-width)">
        <ListBox items={items} className="outline-hidden box-border p-1 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function SelectSection<T extends object>(props: DropdownSectionProps<T>) {
  return <DropdownSection {...props} />;
}

```

## Content

`Select` reuses the `ListBox` component, following the [Collection Components API](collections.md?component=Select). It supports ListBox features such as static and dynamic collections, sections, disabled items, links, text slots, asynchronous loading, etc. See the [ListBox docs](ListBox.md) for more details.

The following example shows a dynamic collection of items, grouped into sections.

```tsx
import {Select, SelectItem} from 'vanilla-starter/Select';
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
    <Select label="Preferred fruit or vegetable" items={options}>
      {section => (
        <ListBoxSection id={section.name}>
          <Header>{section.name}</Header>
          <Collection items={section.children}>
            {item => <SelectItem id={item.name}>{item.name}</SelectItem>}
          </Collection>
        </ListBoxSection>
      )}
    </Select>
  );
}
```

### Autocomplete

`Select` can include additional components as siblings of the `ListBox`. This example uses an [Autocomplete](Autocomplete.md) with a [SearchField](SearchField.md) to let the user filter the items.

```tsx
import {Select, Label, SelectValue, Autocomplete, useFilter} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';
import {SelectListBox, SelectItem} from 'vanilla-starter/Select';
import {Popover} from 'vanilla-starter/Popover';
import {SearchField} from 'vanilla-starter/SearchField';
import {ChevronDown} from 'lucide-react';

function Example() {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <Select>
      <Label>Category</Label>
      <Button>
        <SelectValue />
        <ChevronDown size={18} />
      </Button>
      <Popover hideArrow className="select-popover" style={{display: 'flex', flexDirection: 'column'}}>
        {/*- begin highlight -*/}
        <Autocomplete filter={contains}>
          <SearchField aria-label="Search tags" placeholder="Search tags" autoFocus style={{margin: 4}} />
          <SelectListBox>
            {/*- end highlight -*/}
            <SelectItem>News</SelectItem>
            <SelectItem>Travel</SelectItem>
            <SelectItem>Shopping</SelectItem>
            <SelectItem>Business</SelectItem>
            <SelectItem>Entertainment</SelectItem>
            <SelectItem>Food</SelectItem>
            <SelectItem>Technology</SelectItem>
            <SelectItem>Health</SelectItem>
            <SelectItem>Science</SelectItem>
          </SelectListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
}
```

### Tag

Group

Use the `SelectValue` render prop function to display the selected items as a [TagGroup](TagGroup.md).

```tsx
import {Autocomplete, Select, SelectValue, Group, useFilter} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';
import {SelectListBox, SelectItem} from 'vanilla-starter/Select';
import {Label} from 'vanilla-starter/Form';
import {Popover} from 'vanilla-starter/Popover';
import {Plus} from 'lucide-react';
import {SearchField} from 'vanilla-starter/SearchField';
import {Tag, TagGroup} from 'vanilla-starter/TagGroup';
import {useRef} from 'react';
import './MultiSelect.css';

/*- begin collapse -*/
const states = [
  {id: 'AL', name: 'Alabama'},
  {id: 'AK', name: 'Alaska'},
  {id: 'AZ', name: 'Arizona'},
  {id: 'AR', name: 'Arkansas'},
  {id: 'CA', name: 'California'},
  {id: 'CO', name: 'Colorado'},
  {id: 'CT', name: 'Connecticut'},
  {id: 'DE', name: 'Delaware'},
  {id: 'DC', name: 'District of Columbia'},
  {id: 'FL', name: 'Florida'},
  {id: 'GA', name: 'Georgia'},
  {id: 'HI', name: 'Hawaii'},
  {id: 'ID', name: 'Idaho'},
  {id: 'IL', name: 'Illinois'},
  {id: 'IN', name: 'Indiana'},
  {id: 'IA', name: 'Iowa'},
  {id: 'KS', name: 'Kansas'},
  {id: 'KY', name: 'Kentucky'},
  {id: 'LA', name: 'Louisiana'},
  {id: 'ME', name: 'Maine'},
  {id: 'MD', name: 'Maryland'},
  {id: 'MA', name: 'Massachusetts'},
  {id: 'MI', name: 'Michigan'},
  {id: 'MN', name: 'Minnesota'},
  {id: 'MS', name: 'Mississippi'},
  {id: 'MO', name: 'Missouri'},
  {id: 'MT', name: 'Montana'},
  {id: 'NE', name: 'Nebraska'},
  {id: 'NV', name: 'Nevada'},
  {id: 'NH', name: 'New Hampshire'},
  {id: 'NJ', name: 'New Jersey'},
  {id: 'NM', name: 'New Mexico'},
  {id: 'NY', name: 'New York'},
  {id: 'NC', name: 'North Carolina'},
  {id: 'ND', name: 'North Dakota'},
  {id: 'OH', name: 'Ohio'},
  {id: 'OK', name: 'Oklahoma'},
  {id: 'OR', name: 'Oregon'},
  {id: 'PA', name: 'Pennsylvania'},
  {id: 'RI', name: 'Rhode Island'},
  {id: 'SC', name: 'South Carolina'},
  {id: 'SD', name: 'South Dakota'},
  {id: 'TN', name: 'Tennessee'},
  {id: 'TX', name: 'Texas'},
  {id: 'UT', name: 'Utah'},
  {id: 'VT', name: 'Vermont'},
  {id: 'VA', name: 'Virginia'},
  {id: 'WA', name: 'Washington'},
  {id: 'WV', name: 'West Virginia'},
  {id: 'WI', name: 'Wisconsin'},
  {id: 'WY', name: 'Wyoming'}
];
/*- end collapse -*/

function SelectWithTagGroup() {
  let triggerRef = useRef<HTMLDivElement | null>(null);
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <Select selectionMode="multiple" className="multi-select">
      <Label>States</Label>
      <Group aria-label="States" ref={triggerRef}>
        {/*- begin highlight -*/}
        <SelectValue<typeof states[0]> style={{flex: 1}}>
          {({selectedItems, state}) => (
            <TagGroup
              aria-label="Selected states"
              items={selectedItems.filter(item => item != null)}
              renderEmptyState={() => 'No selected items'}
              onRemove={(keys) => {
                // Remove keys from Select state.
                if (Array.isArray(state.value)) {
                  state.setValue(state.value.filter(k => !keys.has(k)));
                }
              }}>
              {item => <Tag>{item.name}</Tag>}
            </TagGroup>
          )}
        </SelectValue>
        {/*- end highlight -*/}
        <Button variant="primary"><Plus /></Button>
      </Group>
      <Popover
        // Position popover relative to the wrapping div instead of the Button
        triggerRef={triggerRef}
        hideArrow
        className="select-popover"
        style={{display: 'flex', flexDirection: 'column', width: 250, padding: 4}}>
        <Autocomplete filter={contains}>
          <SearchField aria-label="Search states" placeholder="Search states" autoFocus style={{marginBottom: 4}} />
          <SelectListBox items={states}>
            {state => <SelectItem>{state.name}</SelectItem>}
          </SelectListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
}
```

## Value

Use the `defaultValue` or `value` prop to set the selected item. The value corresponds to the `id` prop of an item. When `selectionMode="multiple"`, `value` and `onChange` accept an array. Items can be disabled with the `isDisabled` prop.

```tsx
import {Select, SelectItem} from 'vanilla-starter/Select';
import {useState} from 'react';

function Example(props) {
  let [animal, setAnimal] = useState("bison");

  return (
    <>
      <Select
        {...props}
        label="Pick an animal"
        
        value={animal}
        onChange={setAnimal}
      >
        <SelectItem id="koala">Koala</SelectItem>
        <SelectItem id="kangaroo">Kangaroo</SelectItem>
        <SelectItem id="platypus" isDisabled>Platypus</SelectItem>
        <SelectItem id="eagle">Bald Eagle</SelectItem>
        <SelectItem id="bison">Bison</SelectItem>
        <SelectItem id="skunk">Skunk</SelectItem>
      </Select>
      <pre style={{fontSize: 12}}>Current selection: {JSON.stringify(animal)}</pre>
    </>
  );
}
```

## Forms

Use the `name` prop to submit the `id` of the selected item to the server. Set the `isRequired` prop to validate that the user selects an option, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {Select, SelectItem} from 'vanilla-starter/Select';
import {Button} from 'vanilla-starter/Button';
import {Form} from 'vanilla-starter/Form';

<Form>
  <Select
    label="Animal"
    /*- begin highlight -*/
    name="animal"
    isRequired
    /*- end highlight -*/
    description="Please select an animal.">
    <SelectItem id="aardvark">Aardvark</SelectItem>
    <SelectItem id="cat">Cat</SelectItem>
    <SelectItem id="dog">Dog</SelectItem>
    <SelectItem id="kangaroo">Kangaroo</SelectItem>
    <SelectItem id="panda">Panda</SelectItem>
    <SelectItem id="snake">Snake</SelectItem>
  </Select>
  <Button type="submit">Submit</Button>
</Form>
```

## A

PI

```tsx
<Select>
  <Label />
  <Button>
    <SelectValue />
  </Button>
  <Text slot="description" />
  <FieldError />
  <Popover>
    <ListBox />
  </Popover>
</Select>
```

### Select

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsEmptyCollection` | `boolean | undefined` | — | Whether the select should be allowed to be open when the collection is empty. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoComplete` | `string | undefined` | — | Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete). |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ChildrenOrFunction<SelectRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SelectRenderProps> | undefined` | 'react-aria-Select' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultOpen` | `boolean | undefined` | — | Sets the default open state of the menu. |
| `defaultSelectedKey` | `Key | undefined` | — | The initial selected key in the collection (uncontrolled). |
| `defaultValue` | `ValueType<M> | undefined` | — | The default value (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isOpen` | `boolean | undefined` | — | Sets the open state of the menu. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `isTriggerUpWhenOpen` | `boolean | undefined` | — | Whether the trigger is up when the overlay is open. |
| `lang` | `string | undefined` | — |  |
| `name` | `string | undefined` | — | The name of the input, used when submitting an HTML form. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: ChangeValueType<M>) => void) | undefined` | — | Handler that is called when the value changes. |
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
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Method that is called when the open state of the menu changes. |
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
| `placeholder` | `string | undefined` | 'Select an item' (localized) | Temporary text that occupies the select when it is empty. |
| `selectedKey` | `Key | null | undefined` | — | The currently selected key in the collection (controlled). |
| `selectionMode` | `M | undefined` | 'single' | Whether single or multiple selection is enabled. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: SelectRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `validate` | `((value: ValidationType<M>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `ValueType<M> | undefined` | — | The current value (controlled). |

### Select

Value

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `about` | `string | undefined` | — |  |
| `accessKey` | `string | undefined` | — |  |
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "true" | "false") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "inline" | "list" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| `aria-braillelabel` | `string | undefined` | — | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| `aria-brailleroledescription` | `string | undefined` | — | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` | `(boolean | "true" | "false") | undefined` | — |  |
| `aria-checked` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` | `number | undefined` | — | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` | `number | undefined` | — | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` | `number | undefined` | — | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time" | undefined` | — | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-description` | `string | undefined` | — | Defines a string value that describes or annotates the current element. |
| `aria-details` | `string | undefined` | — | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"link" | "copy" | "move" | "none" | "execute" | "popup" | undefined` | — | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` | `string | undefined` | — | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `(boolean | "true" | "false") | undefined` | — | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` | `boolean | "true" | "false" | "grammar" | "spelling" | undefined` | — | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` | `string | undefined` | — | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-level` | `number | undefined` | — | Defines the hierarchical level of an element within a structure. |
| `aria-live` | `"off" | "assertive" | "polite" | undefined` | — | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` | `(boolean | "true" | "false") | undefined` | — | Indicates whether an element is modal when displayed. |
| `aria-multiline` | `(boolean | "true" | "false") | undefined` | — | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` | `(boolean | "true" | "false") | undefined` | — | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` | `"horizontal" | "vertical" | undefined` | — | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` | `string | undefined` | — | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` | `string | undefined` | — | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` | `number | undefined` | — | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` | `"text" | "all" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` | `(boolean | "true" | "false") | undefined` | — | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` | `string | undefined` | — | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` | `number | undefined` | — | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` | `number | undefined` | — | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` | `number | undefined` | — | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` | `(boolean | "true" | "false") | undefined` | — | Indicates the current "selected" state of various widgets. |
| `aria-setsize` | `number | undefined` | — | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` | `"none" | "ascending" | "descending" | "other" | undefined` | — | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` | `number | undefined` | — | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` | `number | undefined` | — | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` | `number | undefined` | — | Defines the current value for a range widget. |
| `aria-valuetext` | `string | undefined` | — | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` | `"off" | "on" | "none" | "sentences" | "words" | "characters" | (string & {}) | undefined` | — |  |
| `autoCorrect` | `string | undefined` | — |  |
| `autoFocus` | `boolean | undefined` | — |  |
| `autoSave` | `string | undefined` | — |  |
| `children` | `ChildrenOrFunction<SelectValueRenderProps<T>>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SelectValueRenderProps<T>> | undefined` | 'react-aria-SelectValue' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `color` | `string | undefined` | — |  |
| `content` | `string | undefined` | — |  |
| `contentEditable` | `(boolean | "true" | "false") | "inherit" | "plaintext-only" | undefined` | — |  |
| `contextMenu` | `string | undefined` | — |  |
| `dangerouslySetInnerHTML` | `{ __html: string | TrustedHTML; } | undefined` | — |  |
| `datatype` | `string | undefined` | — |  |
| `defaultChecked` | `boolean | undefined` | — |  |
| `defaultValue` | `string | number | readonly string[] | undefined` | — |  |
| `dir` | `string | undefined` | — |  |
| `draggable` | `(boolean | "true" | "false") | undefined` | — |  |
| `enterKeyHint` | `"search" | "enter" | "done" | "go" | "next" | "previous" | "send" | undefined` | — |  |
| `exportparts` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `inlist` | `any` | — |  |
| `inputMode` | `"text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` | `string | undefined` | — | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` | `string | undefined` | — |  |
| `itemProp` | `string | undefined` | — |  |
| `itemRef` | `string | undefined` | — |  |
| `itemScope` | `boolean | undefined` | — |  |
| `itemType` | `string | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `nonce` | `string | undefined` | — |  |
| `onAbort` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<HTMLElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onChange` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onPaste` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onProgress` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onVolumeChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `part` | `string | undefined` | — |  |
| `popover` | `"" | "manual" | "auto" | undefined` | — |  |
| `popoverTarget` | `string | undefined` | — |  |
| `popoverTargetAction` | `"toggle" | "show" | "hide" | undefined` | — |  |
| `prefix` | `string | undefined` | — |  |
| `property` | `string | undefined` | — |  |
| `radioGroup` | `string | undefined` | — |  |
| `rel` | `string | undefined` | — |  |
| `resource` | `string | undefined` | — |  |
| `results` | `number | undefined` | — |  |
| `rev` | `string | undefined` | — |  |
| `role` | `React.AriaRole | undefined` | — |  |
| `security` | `string | undefined` | — |  |
| `slot` | `string | undefined` | — |  |
| `spellCheck` | `(boolean | "true" | "false") | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: SelectValueRenderProps<T> & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `suppressContentEditableWarning` | `boolean | undefined` | — |  |
| `suppressHydrationWarning` | `boolean | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |
| `title` | `string | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `typeof` | `string | undefined` | — |  |
| `unselectable` | `"off" | "on" | undefined` | — |  |
| `vocab` | `string | undefined` | — |  |
