# Picker

Pickers allow users to choose a single option from a collapsible list of options when space is limited.

```tsx
import {Picker, PickerItem} from '@react-spectrum/s2';

<Picker>
  <PickerItem>Chocolate</PickerItem>
  <PickerItem>Mint</PickerItem>
  <PickerItem>Strawberry</PickerItem>
  <PickerItem>Vanilla</PickerItem>
  <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
</Picker>
```

## Content

`Picker` follows the [Collection Components API](collections.md?component=Picker), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {Picker, PickerItem} from '@react-spectrum/s2';

function Example() {
  let options = [
    { id: 1, name: 'Aardvark' },
    { id: 2, name: 'Cat' },
    { id: 3, name: 'Dog' },
    { id: 4, name: 'Kangaroo' },
    { id: 5, name: 'Koala' },
    { id: 6, name: 'Penguin' },
    { id: 7, name: 'Snake' },
    { id: 8, name: 'Turtle' },
    { id: 9, name: 'Wombat' }
  ];

  return (
    /*- begin highlight -*/
    <Picker label="Animals" items={options}>
      {(item) => <PickerItem>{item.name}</PickerItem>}
    </Picker>
    /*- end highlight -*/
  );
}
```

### Slots

`PickerItem` supports icons, avatars, and `label` and `description` text slots.

```tsx
import {Avatar, Picker, PickerItem, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Comment from '@react-spectrum/s2/icons/Comment';
import Edit from '@react-spectrum/s2/icons/Edit';
import UserSettings from '@react-spectrum/s2/icons/UserSettings';

const users = Array.from({length: 5}, (_, i) => ({
  id: `user${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  avatar: 'https://i.imgur.com/kJOwAdv.png'
}));

<div className={style({display: 'flex', gap: 12, flexWrap: 'wrap'})}>
  <Picker label="Permissions" defaultValue="read">
    <PickerItem id="read" textValue="Read">
      {/*- begin highlight -*/}
      <Comment />
      <Text slot="label">Read</Text>
      <Text slot="description">Comment only</Text>
      {/*- end highlight -*/}
    </PickerItem>
    <PickerItem id="write" textValue="Write">
      <Edit />
      <Text slot="label">Write</Text>
      <Text slot="description">Read and write only</Text>
    </PickerItem>
    <PickerItem id="admin" textValue="Admin">
      <UserSettings />
      <Text slot="label">Admin</Text>
      <Text slot="description">Full access</Text>
    </PickerItem>
  </Picker>
  <Picker label="Share" items={users} defaultValue="user1">
    {(item) => (
      <PickerItem id={item.id} textValue={item.name}>
        {/*- begin highlight -*/}
        <Avatar slot="avatar" src={item.avatar} />
        {/*- end highlight -*/}
        <Text slot="label">{item.name}</Text>
        <Text slot="description">{item.email}</Text>
      </PickerItem>
    )}
  </Picker>
</div>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Interactive elements (e.g. buttons) within picker items are not allowed. This will break keyboard and screen reader navigation. Only add textual or decorative graphics (e.g. icons) as children.</Content>
</InlineAlert>

### Sections

Use the `<PickerSection>` component to group options. A `<Header>` element, with a `<Heading>` and optional `description` slot can be included to label a section. Sections without a header must have an `aria-label`.

```tsx
import {Picker, PickerSection, PickerItem, Header, Heading, Text} from '@react-spectrum/s2';

<Picker label="Ice cream flavor">
  {/*- begin highlight -*/}
  <PickerSection>
    <Header>
      <Heading>Neopolitan flavors</Heading>
      <Text slot="description">These flavors are common</Text>
    </Header>
    {/*- end highlight -*/}
    <PickerItem>Chocolate</PickerItem>
    <PickerItem>Strawberry</PickerItem>
    <PickerItem>Vanilla</PickerItem>
  </PickerSection>
  <PickerSection>
    <Header>
      <Heading>Others</Heading>
      <Text slot="description">These flavors are uncommon</Text>
    </Header>
    <PickerItem>Matcha</PickerItem>
    <PickerItem>Ube</PickerItem>
    <PickerItem>Prickly pear</PickerItem>
  </PickerSection>
</Picker>
```

### Asynchronous loading

Use the `loadingState` and `onLoadMore` props to enable async loading and infinite scrolling.

```tsx
import {Picker, PickerItem, useAsyncList} from '@react-spectrum/s2';

interface Character {
  name: string
}

function AsyncLoadingExample() {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      let res = await fetch(
        cursor || `https://pokeapi.co/api/v2/pokemon`,
        { signal }
      );
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Picker
      aria-label="Pokemon"
      items={list.items}
      /*- begin highlight -*/
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}>
      {/*- end highlight -*/}
      {(item) => <PickerItem id={item.name}>{item.name}</PickerItem>}
    </Picker>
  );
}
```

### Links

Use the `href` prop on a `<PickerItem>` to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework. Link items in a `Picker` are not selectable.

```tsx
import {Picker, PickerItem} from '@react-spectrum/s2';

<Picker label="Project">
  <PickerItem href="https://example.com/" target="_blank">Create new…</PickerItem>
  <PickerItem>Proposal</PickerItem>
  <PickerItem>Budget</PickerItem>
  <PickerItem>Onboarding</PickerItem>
</Picker>
```

## Value

Use the `defaultValue` or `value` prop to set the selected item. The value corresponds to the `id` prop of an item. When `selectionMode="multiple"`, `value` and `onChange` accept an array. Items can be disabled with the `isDisabled` prop.

```tsx
import {Picker, PickerItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example(props) {
  let [animal, setAnimal] = useState("bison");

  return (
    <div>
      <Picker
        {...props}
        label="Pick an animal"
        
        value={animal}
        onChange={setAnimal}
      >
        <PickerItem id="koala">Koala</PickerItem>
        <PickerItem id="kangaroo">Kangaroo</PickerItem>
        <PickerItem id="platypus" isDisabled>Platypus</PickerItem>
        <PickerItem id="eagle">Bald Eagle</PickerItem>
        <PickerItem id="bison">Bison</PickerItem>
        <PickerItem id="skunk">Skunk</PickerItem>
      </Picker>
      <pre className={style({font: 'body'})}>Current selection: {JSON.stringify(animal)}</pre>
    </div>
  );
}
```

## Forms

Use the `name` prop to submit the `id` of the selected item to the server. Set the `isRequired` prop to validate that the user selects an option, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {Picker, PickerItem, Form, Button} from '@react-spectrum/s2';

function Example(props) {
  return (
    <Form>
      <Picker
        {...props}
        label="Animal"
        /*- begin highlight -*/
        name="animal"
        
        /*- end highlight -*/
        description="Please select an animal.">
        <PickerItem id="aardvark">Aardvark</PickerItem>
        <PickerItem id="cat">Cat</PickerItem>
        <PickerItem id="dog">Dog</PickerItem>
        <PickerItem id="kangaroo">Kangaroo</PickerItem>
        <PickerItem id="panda">Panda</PickerItem>
        <PickerItem id="snake">Snake</PickerItem>
      </Picker>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## Popover options

The open state of the Picker can be controlled via the `defaultOpen` and `isOpen` props. The `align`, `direction`, `shouldFlip` and `menuWidth` props control the behavior of the popover.

```tsx
import {Picker, PickerItem} from '@react-spectrum/s2';
import {useState} from 'react';

function Example(props) {
  let [open, setOpen] = useState(false);

  return (
    <div>
      <p>Select is {open ? 'open' : 'closed'}</p>
      <Picker
        {...props}
        label="Choose frequency"
        /*- begin highlight -*/
        
        isOpen={open}
        onOpenChange={setOpen}>
        {/*- end highlight -*/}
        <PickerItem id="rarely">Rarely</PickerItem>
        <PickerItem id="sometimes">Sometimes</PickerItem>
        <PickerItem id="always">Always</PickerItem>
      </Picker>
    </div>
  );
}
```

## A

PI

```tsx
<Picker>
  <PickerItem>
    <Icon /> or <Avatar />
    <Text slot="label" />
    <Text slot="description" />
  </PickerItem>
  <PickerSection>
    <Header>
      <Heading />
      <Text slot="description" />
    </Header>
    <PickerItem />
  </PickerSection>
</Picker>
```

### Picker

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "end" | undefined` | 'start' | Alignment of the menu relative to the input target. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoComplete` | `string | undefined` | — | Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete). |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `contextualHelp` | `React.ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultOpen` | `boolean | undefined` | — | Sets the default open state of the menu. |
| `defaultSelectedKey` | `Key | undefined` | — | The initial selected key in the collection (uncontrolled). |
| `defaultValue` | `ValueType<M> | undefined` | — | The default value (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `description` | `React.ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `direction` | `"top" | "bottom" | undefined` | 'bottom' | Direction the menu will render relative to the Picker. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `errorMessage` | `React.ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `excludeFromTabOrder` | `boolean | undefined` | — | Whether to exclude the element from the sequential tab order. If true, the element will not be focusable via the keyboard by tabbing. This should be avoided except in rare scenarios where an alternative means of accessing the element or its functionality via the keyboard is available. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isOpen` | `boolean | undefined` | — | Sets the open state of the menu. |
| `isQuiet` | `boolean | undefined` | — | Whether the picker should be displayed with a quiet style. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `label` | `React.ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `loadingState` | `LoadingState | undefined` | — | The current loading state of the Picker. |
| `menuWidth` | `number | undefined` | — | Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. |
| `name` | `string | undefined` | — | The name of the input, used when submitting an HTML form. |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onChange` | `((value: ChangeValueType<M>) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Method that is called when the open state of the menu changes. |
| `onSelectionChange` | `((key: Key | null) => void) | undefined` | — | Handler that is called when the selection changes. |
| `placeholder` | `string | undefined` | 'Select an item' (localized) | Temporary text that occupies the select when it is empty. |
| `selectedKey` | `Key | null | undefined` | — | The currently selected key in the collection (controlled). |
| `selectionMode` | `M | undefined` | 'single' | Whether single or multiple selection is enabled. |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Picker. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: ValidationType<M>) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |
| `value` | `ValueType<M> | undefined` | — | The current value (controlled). |

### Picker

Item

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this item. |
| `children` | `React.ReactNode` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onBlur` | `((e: React.FocusEvent<HTMLDivElement, Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: React.FocusEvent<HTMLDivElement, Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |

### Picker

Section

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for the section. |
| `children` | `React.ReactNode | ((item: T) => React.ReactElement)` | — | Static child items or a function to render children. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `id` | `Key | undefined` | — | The unique id of the section. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the section. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `T | undefined` | — | The object value that this section represents. When using dynamic collections, this is set automatically. |
