# Menu

Menus display a list of actions or options that a user can choose.

```tsx
import {Menu, MenuTrigger, MenuItem, MenuSection, SubmenuTrigger, Header, Heading, Text, ActionButton} from '@react-spectrum/s2';
import Image from '@react-spectrum/s2/icons/Image';
import Copy from '@react-spectrum/s2/icons/Copy';
import DeviceTablet from '@react-spectrum/s2/icons/DeviceTablet';
import DeviceDesktop from '@react-spectrum/s2/icons/DeviceDesktop';

function Example(props) {
  return (
    <MenuTrigger>
      <ActionButton>Publish</ActionButton>
      <Menu {...props}>
        <MenuSection>
          <Header>
            <Heading>Publish and export</Heading>
            <Text slot="description">
              Social media, other formats
            </Text>
          </Header>
          <MenuItem
            textValue="quick export"
            onAction={() => alert('Quick export')}>
            <Image />
            <Text slot="label">Quick Export</Text>
            <Text slot="description">
              Share a low-res snapshot.
            </Text>
          </MenuItem>
          <SubmenuTrigger>
            <MenuItem textValue="open a copy">
              <Copy />
              <Text slot="label">Open a copy</Text>
              <Text slot="description">
                Illustrator for iPad or desktop
              </Text>
            </MenuItem>
            <Menu>
              <MenuSection>
                <Header>
                  <Heading>Open a copy in</Heading>
                </Header>
                <MenuItem
                  textValue="ipad"
                  onAction={() => alert('Open on iPad')}>
                  <DeviceTablet />
                  <Text slot="label">Illustrator for iPad</Text>
                </MenuItem>
                <MenuItem
                  textValue="desktop"
                  onAction={() => alert('Open on desktop')}>
                  <DeviceDesktop />
                  <Text slot="label">Illustrator for desktop</Text>
                </MenuItem>
              </MenuSection>
            </Menu>
          </SubmenuTrigger>
        </MenuSection>
        <MenuSection selectionMode="multiple" defaultSelectedKeys={['files']}>
          <MenuItem id="files">Show files</MenuItem>
          <MenuItem id="folders">Show folders</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}
```

## Content

`Menu` follows the [Collection Components API](collections.md?component=Menu), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {Menu, MenuTrigger, MenuItem, ActionButton} from '@react-spectrum/s2';

let items = [
  {id: 'cut', name: 'Cut'},
  {id: 'copy', name: 'Copy'},
  {id: 'paste', name: 'Paste'},
  {id: 'select-all', name: 'Select All'}
];

<MenuTrigger>
  <ActionButton>Edit</ActionButton>
  {/*- begin highlight -*/}
  <Menu items={items}>
    {item => <MenuItem>{item.name}</MenuItem>}
  </Menu>
  {/*- end highlight -*/}
</MenuTrigger>
```

### Slots

`MenuItem` supports icons or images, `label` and `description` text slots, and keyboard shortcuts.

## Vanilla 

CSS example

```tsx
import {MenuTrigger, ActionButton, Menu, MenuItem, Text, Keyboard} from '@react-spectrum/s2';
import Copy from '@react-spectrum/s2/icons/Copy';
import Cut from '@react-spectrum/s2/icons/Cut';
import Paste from '@react-spectrum/s2/icons/Paste';

<MenuTrigger>
  <ActionButton>Edit</ActionButton>
  <Menu>
    <MenuItem textValue="Copy">
      {/*- begin highlight -*/}
      <Copy />
      <Text slot="label">Copy</Text>
      <Text slot="description">Copy the selected text</Text>
      <Keyboard>⌘C</Keyboard>
      {/*- end highlight -*/}
    </MenuItem>
    <MenuItem textValue="Cut">
      <Cut />
      <Text slot="label">Cut</Text>
      <Text slot="description">Cut the selected text</Text>
      <Keyboard>⌘X</Keyboard>
    </MenuItem>
    <MenuItem textValue="Paste">
      <Paste />
      <Text slot="label">Paste</Text>
      <Text slot="description">Paste the copied text</Text>
      <Keyboard>⌘V</Keyboard>
    </MenuItem>
  </Menu>
</MenuTrigger>
```

## S2 example

```tsx
import {MenuTrigger, ActionButton, Menu, MenuItem, Text, Image} from '@react-spectrum/s2';
import normal from 'url:./assets/normal.png';
import multiply from 'url:./assets/multiply.png';
import screen from 'url:./assets/screen.png';

<MenuTrigger>
  <ActionButton>Blend mode</ActionButton>
  <Menu>
    <MenuItem textValue="normal">
      {/*- begin highlight -*/}
      <Image src={normal} />
      <Text slot="label">Normal</Text>
      <Text slot="description">No effect applied.</Text>
      {/*- end highlight -*/}
    </MenuItem>
    <MenuItem textValue="multiply">
      <Image src={multiply} />
      <Text slot="label">Multiply</Text>
      <Text slot="description">Add contrast, detail, and darken shadows.</Text>
    </MenuItem>
    <MenuItem textValue="screen">
      <Image src={screen} />
      <Text slot="label">Screen</Text>
      <Text slot="description">Reduce contrast and brighten details.</Text>
    </MenuItem>
  </Menu>
</MenuTrigger>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Interactive elements (e.g. buttons) within menu items are not allowed. This will break keyboard and screen reader navigation. Only add textual or decorative graphics (e.g. icons or images) as children.</Content>
</InlineAlert>

### Sections

Use the `<MenuSection>` component to group options. A `<Header>` element, with a `<Heading>` and optional `description` slot can be included to label a section. Sections without a header must have an `aria-label`.

```tsx
import {MenuTrigger, ActionButton, Menu, MenuItem, MenuSection, Header, Heading, Text} from '@react-spectrum/s2';

<MenuTrigger>
  <ActionButton>Publish</ActionButton>
  <Menu>
    {/*- begin highlight -*/}
    <MenuSection>
      <Header>
        <Heading>Export</Heading>
        <Text slot="description">Save to your device</Text>
      </Header>
      {/*- end highlight -*/}
      <MenuItem>Image…</MenuItem>
      <MenuItem>Video…</MenuItem>
      <MenuItem>Text…</MenuItem>
    </MenuSection>
    <MenuSection>
      <Header>
        <Heading>Share</Heading>
        <Text slot="description">Share to social media</Text>
      </Header>
      <MenuItem>YouTube…</MenuItem>
      <MenuItem>Instagram…</MenuItem>
      <MenuItem>Email…</MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>
```

### Submenus

Wrap a `<MenuItem>` and a `<Menu>` with a `<SubmenuTrigger>` to create a submenu.

```tsx
import {Menu, MenuTrigger, MenuItem, SubmenuTrigger, ActionButton} from '@react-spectrum/s2';

<MenuTrigger>
  <ActionButton>Actions</ActionButton>
  <Menu>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Cut</MenuItem>
    <MenuItem>Paste</MenuItem>
    {/*- begin highlight -*/}
    <SubmenuTrigger>
      <MenuItem id="share">Share</MenuItem>
      <Menu>
      {/*- end highlight -*/}
        <MenuItem>Email</MenuItem>
        <MenuItem>SMS</MenuItem>
        <MenuItem>Copy Link</MenuItem>
      </Menu>
    </SubmenuTrigger>
  </Menu>
</MenuTrigger>
```

### Links

Use the `href` prop on a `<MenuItem>` to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework.

```tsx
import {Menu, MenuTrigger, MenuItem, ActionButton} from '@react-spectrum/s2';

function Example(props) {
  return (
    <MenuTrigger>
      <ActionButton>Links</ActionButton>
      <Menu {...props}>
        {/*- begin highlight -*/}
        <MenuItem href="https://adobe.com/" target="_blank">Adobe</MenuItem>
        {/*- end highlight -*/}
        <MenuItem href="https://apple.com/" target="_blank">Apple</MenuItem>
        <MenuItem href="https://google.com/" target="_blank">Google</MenuItem>
        <MenuItem href="https://microsoft.com/" target="_blank">Microsoft</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
```

### Popover content

Wrap the Menu in a [Popover](Popover.md) to add additional sibling elements. This example includes a header with interactive content.

```tsx
import {Popover, MenuTrigger, ActionButton, Menu, MenuItem, MenuSection, SubmenuTrigger, Avatar, Switch, Divider, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Buildings from '@react-spectrum/s2/icons/Buildings';
import Settings from '@react-spectrum/s2/icons/Settings';

<MenuTrigger>
  <ActionButton aria-label="Account">
    <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
  </ActionButton>
  {/*- begin highlight -*/}
  <Popover>
  {/*- end highlight -*/}
    <div className={style({paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12})}>
      <div className={style({display: 'flex', gap: 12, alignItems: 'center', marginX: 12})}>
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" size={56} />
        <div>
          <div className={style({font: 'title'})}>Devon Govett</div>
          <div className={style({font: 'ui'})}>user@example.com</div>
          <Switch styles={style({marginTop: 4})}>Dark theme</Switch>
        </div>
      </div>
      <Divider styles={style({marginX: 12})} />
      <Menu aria-label="Account">
        <MenuSection>
          <SubmenuTrigger>
            <MenuItem>
              <Buildings />
              <Text slot="label">Organization</Text>
              <Text slot="value">Nike</Text>
            </MenuItem>
            <Menu selectionMode="single" selectedKeys={['nike']}>
              <MenuItem id="adobe">Adobe</MenuItem>
              <MenuItem id="nike">Nike</MenuItem>
              <MenuItem id="apple">Apple</MenuItem>
            </Menu>
          </SubmenuTrigger>
          <MenuItem>
            <Settings />
            <Text slot="label">Settings</Text>
          </MenuItem>
        </MenuSection>
        <MenuSection>
          <MenuItem>Legal notices</MenuItem>
          <MenuItem>Sign out</MenuItem>
        </MenuSection>
      </Menu>
    </div>
  </Popover>
</MenuTrigger>
```

### Autocomplete

Use [Autocomplete](react-aria:Autocomplete.md) from React Aria Components with a [SearchField](SearchField.md) to make a menu searchable.

```tsx
import {Autocomplete, MenuTrigger, ActionButton, Menu, MenuItem, Popover, SearchField} from '@react-spectrum/s2';
import {useFilter} from 'react-aria-components';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function Example() {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <MenuTrigger>
      <ActionButton>Add tag...</ActionButton>
      <Popover aria-label="Select a tag">
        {/*- begin highlight -*/}
        <Autocomplete filter={contains}>
          <SearchField aria-label="Search tags" autoFocus />
          <Menu styles={style({marginTop: 8})}>
            {/*- end highlight -*/}
            <MenuItem>News</MenuItem>
            <MenuItem>Travel</MenuItem>
            <MenuItem>Shopping</MenuItem>
            <MenuItem>Business</MenuItem>
            <MenuItem>Entertainment</MenuItem>
            <MenuItem>Food</MenuItem>
            <MenuItem>Technology</MenuItem>
            <MenuItem>Health</MenuItem>
            <MenuItem>Science</MenuItem>
          </Menu>
        </Autocomplete>
      </Popover>
    </MenuTrigger>
  );
}
```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Menu) for more details.

```tsx
import {Menu, MenuTrigger, MenuItem, ActionButton, Selection} from '@react-spectrum/s2';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set(['rulers']));

  return (
    <>
      <MenuTrigger>
        <ActionButton>View</ActionButton>
        <Menu
          {...props}
          /*- begin highlight -*/
          
          selectedKeys={selected}
          onSelectionChange={setSelected}>
          {/*- end highlight */}
          <MenuItem id="grid">Pixel grid</MenuItem>
          <MenuItem id="rulers">Rulers</MenuItem>
          <MenuItem id="comments" isDisabled>Comments</MenuItem>
          <MenuItem id="layout">Layout guides</MenuItem>
          <MenuItem id="toolbar">Toolbar</MenuItem>
        </Menu>
      </MenuTrigger>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </>
  );
}
```

### Section-level selection

Each section in a menu may have independent selection states by passing `selectionMode` and `selectedKeys` to the `MenuSection`.

```tsx
import {Menu, MenuTrigger, MenuItem, MenuSection, Header, Heading, ActionButton, Selection} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [style, setStyle] = useState<Selection>(new Set(['bold']));
  let [align, setAlign] = useState<Selection>(new Set(['left']));
  return (
    <MenuTrigger>
      <ActionButton>Edit</ActionButton>
      <Menu>
        <MenuSection>
          <Header>
            <Heading>Clipboard</Heading>
          </Header>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </MenuSection>
        {/*- begin highlight -*/}
        <MenuSection
          selectionMode="multiple"
          selectedKeys={style}
          onSelectionChange={setStyle}>
          {/*- end highlight -*/}
          <Header>
            <Heading>Text style</Heading>
          </Header>
          <MenuItem id="bold">Bold</MenuItem>
          <MenuItem id="italic">Italic</MenuItem>
          <MenuItem id="underline">Underline</MenuItem>
        </MenuSection>
        <MenuSection selectionMode="single" selectedKeys={align} onSelectionChange={setAlign}>
          <Header>
            <Heading>Text alignment</Heading>
          </Header>
          <MenuItem id="left">Left</MenuItem>
          <MenuItem id="center">Center</MenuItem>
          <MenuItem id="right">Right</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}
```

## Menu trigger

MenuTrigger accepts props to control trigger interactions and Menu positioning.

```tsx
import {MenuTrigger, Menu, MenuItem, ActionButton} from '@react-spectrum/s2';

<MenuTrigger>
  <ActionButton>Copy</ActionButton>
  <Menu>
    <MenuItem>Copy as plain text</MenuItem>
    <MenuItem>Copy as rich text</MenuItem>
    <MenuItem>Copy URL</MenuItem>
  </Menu>
</MenuTrigger>
```

## A

PI

```tsx
<MenuTrigger>
  <Button />
  <Menu>
    <MenuItem>
      <Icon /> or <Image />
      <Text slot="label" />
      <Text slot="description" />
      <Keyboard />
    </MenuItem>
    <MenuSection>
      <Header>
        <Heading />
        <Text slot="description" />
      </Header>
      <MenuItem />
    </MenuSection>
    <SubmenuTrigger>
      <MenuItem />
      <Menu />
    </SubmenuTrigger>
  </Menu>
</MenuTrigger>
```

### Menu

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "end" | undefined` | 'start' | Alignment of the menu relative to the trigger. |
| `children` | `ReactNode` | — |  |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `direction` | `"start" | "end" | "top" | "bottom" | "left" | "right" | undefined` | 'bottom' | Where the Menu opens relative to its trigger. |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `shouldFlip` | `boolean | undefined` | true | Whether the menu should automatically flip direction when space is limited. |
| `trigger` | `MenuTriggerType | undefined` | 'press' | How the menu is triggered. |

### Menu

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Where the focus should be set. |
| `children` | `ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `escapeKeyBehavior` | `"clearSelection" | "none" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the menu or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `hideLinkOutIcon` | `boolean | undefined` | — | Hides the default link out icons on menu items that open links in a new tab. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when an item is selected. |
| `onClose` | `(() => void) | undefined` | — | Handler that is called when the menu should close after selecting an item. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `shouldFocusWrap` | `boolean | undefined` | — | Whether keyboard navigation is circular. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Menu. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Menu

Item

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this item. |
| `children` | `ReactNode` | — | The contents of the item. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when the item is selected. |
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
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |

### Menu

Section

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for the section. |
| `children` | `ReactNode | ((item: T) => ReactElement)` | — | Static child items or a function to render children. |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The currently disabled keys in the collection (controlled). |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `id` | `Key | undefined` | — | The unique id of the section. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the section. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `value` | `T | undefined` | — | The object value that this section represents. When using dynamic collections, this is set automatically. |

### Submenu

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactElement<unknown, string | JSXElementConstructor<any>>[]` | — | The contents of the SubmenuTrigger. The first child should be an Item (the trigger) and the second child should be the Popover (for the submenu). |
