# Combo

Box

ComboBox allow users to choose a single option from a collapsible list of options when space is limited.

```tsx
import {ComboBox, ComboBoxItem} from '@react-spectrum/s2';

<ComboBox>
  <ComboBoxItem>Chocolate</ComboBoxItem>
  <ComboBoxItem>Mint</ComboBoxItem>
  <ComboBoxItem>Strawberry</ComboBoxItem>
  <ComboBoxItem>Vanilla</ComboBoxItem>
  <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
</ComboBox>
```

## Content

`ComboBox` follows the [Collection Components API](collections.md?component=ComboBox), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {ComboBox, ComboBoxItem} from '@react-spectrum/s2';

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
    <ComboBox label="Animals" defaultItems={options} placeholder="Select an animal">
      {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
    </ComboBox>
    /*- end highlight -*/
  );
}
```

### Slots

`ComboBoxItem` supports icons, avatars, and `label` and `description` text slots.

```tsx
import {Avatar, ComboBox, ComboBoxItem, Text} from '@react-spectrum/s2';
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
  <ComboBox label="Permissions" defaultSelectedKey="read" placeholder="Select a permission level">
    <ComboBoxItem id="read" textValue="Read">
      {/*- begin highlight -*/}
      <Comment />
      <Text slot="label">Read</Text>
      <Text slot="description">Comment only</Text>
      {/*- end highlight -*/}
    </ComboBoxItem>
    <ComboBoxItem id="write" textValue="Write">
      <Edit />
      <Text slot="label">Write</Text>
      <Text slot="description">Read and write only</Text>
    </ComboBoxItem>
    <ComboBoxItem id="admin" textValue="Admin">
      <UserSettings />
      <Text slot="label">Admin</Text>
      <Text slot="description">Full access</Text>
    </ComboBoxItem>
  </ComboBox>
  <ComboBox label="Share" defaultItems={users} defaultSelectedKey="user1" placeholder="Select a user">
    {(item) => (
      <ComboBoxItem id={item.id} textValue={item.name}>
        {/*- begin highlight -*/}
        <Avatar slot="avatar" src={item.avatar} />
        {/*- end highlight -*/}
        <Text slot="label">{item.name}</Text>
        <Text slot="description">{item.email}</Text>
      </ComboBoxItem>
    )}
  </ComboBox>
</div>

```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Interactive elements (e.g. buttons) within ComboBox items are not allowed. This will break keyboard and screen reader navigation. Only add textual or decorative graphics (e.g. icons) as children.</Content>
</InlineAlert>

### Sections

Use the `<ComboBoxSection>` component to group options. A `<Header>` element, with a `<Heading>` and optional `description` slot can be included to label a section. Sections without a header must have an `aria-label`.

```tsx
import {ComboBox, ComboBoxItem, ComboBoxSection, Header, Heading, Text} from '@react-spectrum/s2';

<ComboBox label="Preferred fruit or vegetable" placeholder="Select an option">
  {/*- begin highlight -*/}
  <ComboBoxSection>
    <Header>
      <Heading>Fruit</Heading>
      <Text slot="description">Sweet and nutritious</Text>
    </Header>
    {/*- end highlight -*/}
    <ComboBoxItem id="apple">Apple</ComboBoxItem>
    <ComboBoxItem id="banana">Banana</ComboBoxItem>
    <ComboBoxItem id="orange">Orange</ComboBoxItem>
    <ComboBoxItem id="grapes">Grapes</ComboBoxItem>
  </ComboBoxSection>
  <ComboBoxSection>
    <Header>
      <Heading>Vegetable</Heading>
      <Text slot="description">Healthy and savory</Text>
    </Header>
    <ComboBoxItem id="broccoli">Broccoli</ComboBoxItem>
    <ComboBoxItem id="carrots">Carrots</ComboBoxItem>
    <ComboBoxItem id="spinach">Spinach</ComboBoxItem>
    <ComboBoxItem id="lettuce">Lettuce</ComboBoxItem>
  </ComboBoxSection>
</ComboBox>
```

### Asynchronous loading

Use the `loadingState` and `onLoadMore` props to enable async loading and infinite scrolling.

```tsx
import {ComboBox, ComboBoxItem, useAsyncList} from '@react-spectrum/s2';

interface Character {
  name: string
}

function Example() {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ComboBox
      label="Star Wars Character Lookup"
      placeholder="Select a character"
      items={list.items}
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      /*- begin highlight -*/
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}>
      {/*- end highlight -*/}
      {item => <ComboBoxItem id={item.name} textValue={item.name}>{item.name}</ComboBoxItem>}
    </ComboBox>
  );
}
```

### Actions

Use the `onAction` prop on a `<ComboBoxItem>` to perform a custom action when the item is pressed. This example adds a "Create" action for the current input value.

```tsx
import {ComboBox, ComboBoxItem} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      label="Favorite Animal"
      placeholder="Select an animal"
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

### Links

Use the `href` prop on a `<ComboBoxItem>` to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework. Link items in a `ComboBox` are not selectable.

```tsx
import {ComboBox, ComboBoxItem} from '@react-spectrum/s2';

<ComboBox label="Bookmarks" placeholder="Select a bookmark">
  <ComboBoxItem href="https://adobe.com/" target="_blank">Adobe</ComboBoxItem>
  <ComboBoxItem href="https://apple.com/" target="_blank">Apple</ComboBoxItem>
  <ComboBoxItem href="https://google.com/" target="_blank">Google</ComboBoxItem>
  <ComboBoxItem href="https://microsoft.com/" target="_blank">Microsoft</ComboBoxItem>
</ComboBox>
```

## Selection

Use the `defaultSelectedKey` or `selectedKey` prop to set the selected item. The selected key corresponds to the `id` prop of an item. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=ComboBox#single-selection) for more details.

```tsx
import {ComboBox, ComboBoxItem, type Key} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [animal, setAnimal] = useState<Key | null>("bison");

  return (
    <div>
      <ComboBox
        label="Pick an animal"
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
import {ComboBox, ComboBoxItem, type Key} from '@react-spectrum/s2';
import {useState} from 'react';

function Example(props) {
  let [value, setValue] = useState<Key>('Kangaroo');

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
import {ComboBox, ComboBoxItem, type Key} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
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
      inputValue: id ? (options.find(o => o.id === id)?.name ?? '') : '',
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
        label="Pick a engineering major"
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
      <pre className={style({font: 'body'})}>
        Current selected major id: {fieldState.selectedKey}{'\n'}
        Current input text: {fieldState.inputValue}
      </pre>
    </div>
  );
}
```

## Forms

Use the `name` prop to submit the `id` of the selected item to the server. Set the `isRequired` prop to validate that the user selects a value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {ComboBox, ComboBoxItem, Form, Button} from '@react-spectrum/s2';

function Example(props) {
  return (
    <Form>
      <ComboBox
        {...props}
        label="Animal"
        placeholder="e.g. Cat"
        /*- begin highlight -*/
        name="animal"
        
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
  );
}
```

## Popover options

Use the `menuTrigger` prop to control when the popover opens:

* `input` (default): popover opens when the user edits the input text.
* `focus`: popover opens when the user focuses the input.
* `manual`: popover only opens when the user presses the trigger button or uses the arrow keys.

The `align`, `direction`, `shouldFlip` and `menuWidth` props control the behavior of the popover.

```tsx
import {ComboBox, ComboBoxItem} from '@react-spectrum/s2';

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
  <ComboBoxItem>
    <Icon /> or <Avatar />
    <Text slot="label" />
    <Text slot="description" />
  </ComboBoxItem>
  <ComboBoxSection>
    <Header>
      <Heading />
      <Text slot="description" />
    </Header>
    <ComboBoxItem />
  </ComboBoxSection>
</ComboBox>
```

### Combo

Box

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "end" | undefined` | 'start' | Alignment of the menu relative to the input target. |
| `allowsCustomValue` | `boolean | undefined` | — | Whether the ComboBox allows a non-item matching input value to be set. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | — | Whether the element should receive focus on render. |
| `children` | `ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultInputValue` | `string | undefined` | — | The default value of the ComboBox input (uncontrolled). |
| `defaultItems` | `Iterable<T> | undefined` | — | The list of ComboBox items (uncontrolled). |
| `defaultSelectedKey` | `Key | undefined` | — | The initial selected key in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `description` | `ReactNode` | — | A description for the field. Provides a hint such as specific requirements for what to choose. |
| `direction` | `"top" | "bottom" | undefined` | 'bottom' | Direction the menu will render relative to the ComboBox. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `errorMessage` | `ReactNode | ((v: ValidationResult) => ReactNode)` | — | An error message for the field. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `formValue` | `"text" | "key" | undefined` | 'key' | Whether the text or key of the selected item is submitted as part of an HTML form. When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inputValue` | `string | undefined` | — | The value of the ComboBox input (controlled). |
| `isDisabled` | `boolean | undefined` | — | Whether the input is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the input value is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the input can be selected but not changed by the user. |
| `isRequired` | `boolean | undefined` | — | Whether user input is required on the input before form submission. |
| `items` | `Iterable<T> | undefined` | — | The list of ComboBox items (controlled). |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `loadingState` | `LoadingState | undefined` | — | The current loading state of the ComboBox. Determines whether or not the progress circle should be shown. |
| `menuTrigger` | `MenuTriggerAction | undefined` | 'input' | The interaction required to display the ComboBox menu. |
| `menuWidth` | `number | undefined` | — | Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `necessityIndicator` | `NecessityIndicator | undefined` | 'icon' | Whether the required state should be shown as an icon or text. |
| `onBlur` | `((e: FocusEvent<HTMLInputElement, Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<HTMLInputElement, Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onInputChange` | `((value: string) => void) | undefined` | — | Handler that is called when the ComboBox input value changes. |
| `onKeyDown` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is pressed. |
| `onKeyUp` | `((e: KeyboardEvent) => void) | undefined` | — | Handler that is called when a key is released. |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `onOpenChange` | `((isOpen: boolean, menuTrigger?: MenuTriggerAction) => void) | undefined` | — | Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. |
| `onSelectionChange` | `((key: Key | null) => void) | undefined` | — | Handler that is called when the selection changes. |
| `placeholder` | `string | undefined` | — | Temporary text that occupies the text input when it is empty. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/placeholder). |
| `selectedKey` | `Key | null | undefined` | — | The currently selected key in the collection (controlled). |
| `shouldFlip` | `boolean | undefined` | true | Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely. |
| `shouldFocusWrap` | `boolean | undefined` | — | Whether keyboard navigation is circular. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Combobox. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `validate` | `((value: ComboBoxValidationValue) => ValidationError | true | null | undefined) | undefined` | — | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead. |
| `validationBehavior` | `"native" | "aria" | undefined` | 'native' | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA. |

### Combo

BoxItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this item. |
| `children` | `ReactNode` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onBlur` | `((e: FocusEvent<HTMLDivElement, Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<HTMLDivElement, Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
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
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |

### Combo

BoxSection

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for the section. |
| `children` | `ReactNode | ((item: T) => ReactElement)` | — | Static child items or a function to render children. |
| `className` | `string | undefined` | — | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `id` | `Key | undefined` | — | The unique id of the section. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the section. |
| `style` | `CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `value` | `T | undefined` | — | The object value that this section represents. When using dynamic collections, this is set automatically. |
