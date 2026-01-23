# Tag

Group

Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request.

```tsx
import {TagGroup, Tag} from '@react-spectrum/s2';

<TagGroup>
  <Tag>Chocolate</Tag>
  <Tag>Mint</Tag>
  <Tag>Strawberry</Tag>
  <Tag>Vanilla</Tag>
  <Tag>Chocolate Chip Cookie Dough</Tag>
  <Tag>Rocky Road</Tag>
  <Tag>Butter Pecan</Tag>
  <Tag>Neapolitan</Tag>
  <Tag>Salted Caramel</Tag>
  <Tag>Mint Chocolate Chip</Tag>
  <Tag>Tonight Dough</Tag>
  <Tag>Lemon Cookie</Tag>
  <Tag>Cookies and Cream</Tag>
  <Tag>Phish Food</Tag>
  <Tag>Peanut Butter Cup</Tag>
  <Tag>Coffee</Tag>
  <Tag>Pistachio</Tag>
  <Tag>Cherry</Tag>
</TagGroup>
```

## Content

`TagGroup` follows the [Collection Components API](collections.md?component=TagGroup), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children. Items can be removed via the `onRemove` event.

```tsx
import {TagGroup, Tag, useListData} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function PhotoCategories() {
  let list = useListData({
    initialItems: [
      {id: 1, name: 'Landscape'},
      {id: 2, name: 'Portrait'},
      {id: 3, name: 'Night'},
      {id: 4, name: 'Dual'},
      {id: 5, name: 'Golden Hour'}
    ]
  });

  return (
    <TagGroup
      label="Photo categories"
      styles={style({maxWidth: 320})}
      /*- begin highlight -*/
      items={list.items}
      onRemove={(keys) => list.remove(...keys)}>
      {/*- end highlight -*/}
      {(item) => <Tag>{item.name}</Tag>}
    </TagGroup>
  );
}
```

### Slots

`Tag` supports icons, avatars, or images, and text as children.

## S2 example

```tsx
import {TagGroup, Tag, Text} from '@react-spectrum/s2';
import FileText from '@react-spectrum/s2/icons/FileText';
import Camera from '@react-spectrum/s2/icons/Camera';
import Filmstrip from '@react-spectrum/s2/icons/Filmstrip';
import VectorDraw from '@react-spectrum/s2/icons/VectorDraw';

<TagGroup label="Media types">
  <Tag textValue="Text">
    {/*- begin highlight -*/}
    <FileText />
    <Text>Text</Text>
    {/*- end highlight -*/}
  </Tag>
  <Tag textValue="Photos">
    <Camera />
    <Text>Photos</Text>
  </Tag>
  <Tag textValue="Videos">
    <Filmstrip />
    <Text>Videos</Text>
  </Tag>
  <Tag textValue="Illustration">
    <VectorDraw />
    <Text>Illustration</Text>
  </Tag>
</TagGroup>
```

```tsx
import {TagGroup, Tag, Avatar, Text} from '@react-spectrum/s2';

<TagGroup label="Users">
  <Tag textValue="Abraham Baker">
    {/*- begin highlight -*/}
    <Avatar src="https://www.untitledui.com/images/avatars/abraham-baker" />
    <Text>Abraham Baker</Text>
    {/*- end highlight -*/}
  </Tag>
  <Tag textValue="Adriana Sullivan">
    <Avatar src="https://www.untitledui.com/images/avatars/adriana-sullivan" />
    <Text>Adriana Sullivan</Text>
  </Tag>
  <Tag textValue="Jonathan Kelly">
    <Avatar src="https://www.untitledui.com/images/avatars/jonathan-kelly" />
    <Text>Jonathan Kelly</Text>
  </Tag>
  <Tag textValue="Zara Bush">
    <Avatar src="https://www.untitledui.com/images/avatars/zara-bush" />
    <Text>Zara Bush</Text>
  </Tag>
</TagGroup>
```

```tsx
import {TagGroup, Tag, Image, Text} from '@react-spectrum/s2';

<TagGroup label="Dogs">
  <Tag textValue="Golden Retriever">
    {/*- begin highlight -*/}
    <Image src="https://images.unsplash.com/photo-1422565096762-bdb997a56a84?w=100&h=100&fit=crop" />
    <Text>Golden Retriever</Text>
    {/*- end highlight -*/}
  </Tag>
  <Tag textValue="Pug">
    <Image src="https://images.unsplash.com/photo-1523626797181-8c5ae80d40c2?w=100&h=100&fit=crop" />
    <Text>Pug</Text>
  </Tag>
  <Tag textValue="Chihuahua">
    <Image src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=100&h=100&fit=crop" />
    <Text>Chihuahua</Text>
  </Tag>
  <Tag textValue="Husky">
    <Image src="https://images.unsplash.com/photo-1491604612772-6853927639ef?w=100&h=100&fit=crop" />
    <Text>Husky</Text>
  </Tag>
</TagGroup>
```

### Links

Use the `href` prop on a `<Tag>` to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework.

```tsx
import {TagGroup, Tag} from '@react-spectrum/s2';

<TagGroup label="Photo categories">
  {/*- begin highlight -*/}
  <Tag href="https://en.wikipedia.org/wiki/Landscape_photography" target="_blank">Landscape</Tag>
  {/*- end highlight -*/}
  <Tag href="https://en.wikipedia.org/wiki/Portrait_photography" target="_blank">Portrait</Tag>
  <Tag href="https://en.wikipedia.org/wiki/Macro_photography" target="_blank">Macro</Tag>
  <Tag href="https://en.wikipedia.org/wiki/Night_photography" target="_blank">Night</Tag>
  <Tag href="https://en.wikipedia.org/wiki/Dualphotography" target="_blank">Dual</Tag>
  <Tag href="https://en.wikipedia.org/wiki/Golden_hour_(photography)" target="_blank">Golden Hour</Tag>
</TagGroup>
```

### Empty state

Use `renderEmptyState` to render placeholder content when the TagGroup is empty.

```tsx
import {TagGroup, Link} from '@react-spectrum/s2';

<TagGroup
  label="Photo categories"
  renderEmptyState={() => (
    <>No categories. <Link href="https://react-spectrum.adobe.com/">Click here</Link> to add some.</>
  )}>
  {[]}
</TagGroup>
```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=TagGroup) for more details.

```tsx
import {TagGroup, Tag, type Selection} from '@react-spectrum/s2';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <div>
      <TagGroup
        {...props}
        label="Amenities"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <Tag id="laundry">Laundry</Tag>
        <Tag id="fitness">Fitness center</Tag>
        <Tag id="parking" isDisabled>Parking</Tag>
        <Tag id="pool">Swimming pool</Tag>
        <Tag id="breakfast">Breakfast</Tag>
      </TagGroup>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </div>
  );
}
```

## Group actions

Use the `groupActionLabel` and `onGroupAction` props to add an action button at the end of the tags.

```tsx
import {TagGroup, Tag} from '@react-spectrum/s2';

<TagGroup
  label="Interests"
  /*- begin highlight -*/
  groupActionLabel="Clear"
  onGroupAction={() => alert('Clear')}>
  {/*- end highlight -*/}
  <Tag>News</Tag>
  <Tag>Travel</Tag>
  <Tag>Gaming</Tag>
  <Tag>Shopping</Tag>
</TagGroup>
```

## A

PI

```tsx
<TagGroup>
  <Tag>
    <Icon /> or <Avatar /> or <Image />
    <Text />
  </Tag>
</TagGroup>
```

### Tag

Group

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `description` | `ReactNode` | — | A description for the tag group. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `errorMessage` | `ReactNode` | — | An error message for the field. |
| `escapeKeyBehavior` | `"clearSelection" | "none" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the TagGroup or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `groupActionLabel` | `string | undefined` | — | The label to display on the action button. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isEmphasized` | `boolean | undefined` | — | Whether the tags are displayed in an emphasized style. |
| `isInvalid` | `boolean | undefined` | — | Whether the tags are displayed in a error state. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `maxRows` | `number | undefined` | — | Limit the number of rows initially shown. This will render a button that allows the user to expand to show all tags. |
| `onGroupAction` | `(() => void) | undefined` | — | Handler that is called when the action button is pressed. |
| `onRemove` | `((keys: Set<Key>) => void) | undefined` | — | Handler that is called when a user deletes a tag. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `renderEmptyState` | `(() => ReactNode) | undefined` | — | Provides content to display when there are no items in the tag group. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionBehavior` | `SelectionBehavior | undefined` | — | How multiple selection should behave in the collection. |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `size` | `"S" | "M" | "L" | undefined` | 'M' | The size of the tag group. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Tag

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The children of the tag. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | A unique id for the tag. |
| `isDisabled` | `boolean | undefined` | — | Whether the tag is disabled. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `onBlur` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onFocus` | `((e: FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
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
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the tags's contents, used for accessibility. Required if children is not a plain text string. |
