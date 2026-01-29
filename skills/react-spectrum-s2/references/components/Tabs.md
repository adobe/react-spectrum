# Tabs

Tabs organize content into multiple sections and allow users to navigate between them. The content under the set of tabs should be related and form a coherent unit.

```tsx
import {Tabs, TabList, Tab, TabPanel} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Home from '@react-spectrum/s2/illustrations/gradient/generic2/Home';
import Folder from '@react-spectrum/s2/illustrations/gradient/generic2/FolderOpen';
import Search from '@react-spectrum/s2/illustrations/gradient/generic2/Search';
import Settings from '@react-spectrum/s2/illustrations/gradient/generic1/GearSetting';

<Tabs
  
  styles={style({minWidth: 250})}>
  <TabList aria-label="Tabs">
    <Tab id="home">Home</Tab>
    <Tab id="files">Files</Tab>
    <Tab id="search">Search</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="home">
    <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <Home />
    </div>
  </TabPanel>
  <TabPanel id="files">
    <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <Folder />
    </div>
  </TabPanel>
  <TabPanel id="search">
    <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <Search />
    </div>
  </TabPanel>
  <TabPanel id="settings">
    <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <Settings />
    </div>
  </TabPanel>
</Tabs>
```

## Content

`TabList` follows the [Collection Components API](collections.md?component=Tabs), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {ActionButton, ActionButtonGroup, Tabs, TabList, Tab, TabPanel, Collection} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';
import AddCircle from '@react-spectrum/s2/icons/AddCircle';
import RemoveCircle from '@react-spectrum/s2/icons/RemoveCircle';

function Example() {
  let [tabs, setTabs] = useState([
    {id: 1, title: 'Tab 1', content: 'Tab body 1'},
    {id: 2, title: 'Tab 2', content: 'Tab body 2'},
    {id: 3, title: 'Tab 3', content: 'Tab body 3'}
  ]);

  let addTab = () => {
    setTabs(tabs => [
      ...tabs,
      {
        id: tabs.length + 1,
        title: `Tab ${tabs.length + 1}`,
        content: `Tab body ${tabs.length + 1}`
      }
    ]);
  };

  let removeTab = () => {
    if (tabs.length > 1) {
      setTabs(tabs => tabs.slice(0, -1));
    }
  };

  return (
    <Tabs aria-label="Tabs" styles={style({width: 'full'})}>
      <div className={style({display: 'flex', alignItems: 'center'})}>
        <TabList
          items={tabs}
          styles={style({flexShrink: 1, flexGrow: 1, flexBasis: 'auto'})}>
          {item => <Tab>{item.title}</Tab>}
        </TabList>
        <ActionButtonGroup density="compact" size="S">
          <ActionButton onPress={addTab} aria-label="Add tab">
            <AddCircle />
          </ActionButton>
          <ActionButton onPress={removeTab} aria-label="Remove tab">
            <RemoveCircle />
          </ActionButton>
        </ActionButtonGroup>
      </div>
      {/*- begin highlight -*/}
      <Collection items={tabs}>
        {item => <TabPanel>{item.content}</TabPanel>}
      </Collection>
      {/*- end highlight -*/}
    </Tabs>
  )
}
```

### Icons

`Tag` supports icons and text as children. Text is always required, but can be hidden when the tabs are expanded using the `labelBehavior` prop.

```tsx
"use client"
import {Tabs, TabList, Tab, TabPanel, Text} from '@react-spectrum/s2';
import Edit from '@react-spectrum/s2/icons/Edit';
import Bell from '@react-spectrum/s2/icons/Bell';
import Heart from '@react-spectrum/s2/icons/Heart';

<Tabs>
  <TabList>
    <Tab id="edit">
      {/*- begin highlight -*/}
      <Edit />
      <Text>Edit</Text>
      {/*- end highlight -*/}
    </Tab>
    <Tab id="bell">
      <Bell />
      <Text>Notifications</Text>
    </Tab>
    <Tab id="heart">
      <Heart />
      <Text>Likes</Text>
    </Tab>
  </TabList>
  <TabPanel id="edit">
    Review your edits
  </TabPanel>
  <TabPanel id="bell">
    Check your notifications
  </TabPanel>
  <TabPanel id="heart">
    See your likes
  </TabPanel>
</Tabs>
```

### Overflow behavior

Horizontal tabs automatically collapse into a Picker when space is limited.

```tsx
import {Tabs, TabList, Tab, TabPanel} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<div
  className={style({
    width: 320,
    maxWidth: 'full',
    padding: 16,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'gray-300',
    borderRadius: 'default',
    overflow: 'hidden',
    resize: 'horizontal'
  })}>
  {/*- begin focus -*/}
  <Tabs aria-label="Tabs">
    <TabList>
      <Tab id="home">Home</Tab>
      <Tab id="profile">Profile</Tab>
      <Tab id="contact">Contact</Tab>
      <Tab id="about">About</Tab>
    </TabList>
    <TabPanel id="home">
      Welcome home
    </TabPanel>
    <TabPanel id="profile">
      View your profile
    </TabPanel>
    <TabPanel id="contact">
      Find your contacts
      </TabPanel>
    <TabPanel id="about">
      Learn more
    </TabPanel>
  </Tabs>
  {/*- end focus -*/}
</div>
```

## Selection

Use the `defaultSelectedKey` or `selectedKey` prop to set the selected tab. The selected key corresponds to the `id` prop of a `<Tab>`. Tabs can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Tabs#single-selection) for more details.

```tsx
import {Tabs, TabList, Tab, TabPanel, type Key} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Home from '@react-spectrum/s2/illustrations/gradient/generic2/Home';
import Folder from '@react-spectrum/s2/illustrations/gradient/generic2/FolderOpen';
import Search from '@react-spectrum/s2/illustrations/gradient/generic2/Search';
import Settings from '@react-spectrum/s2/illustrations/gradient/generic1/GearSetting';
import {useState} from 'react';

function Example() {
  let [tab, setTab] = useState<Key>("files");
  return (
    <div>
      <Tabs
        aria-label="Tabs"
        selectedKey={tab}
        onSelectionChange={setTab}
      >
        <TabList aria-label="Tabs">
          <Tab id="home">Home</Tab>
          <Tab id="files">Files</Tab>
          <Tab id="search" isDisabled>Search</Tab>
          <Tab id="settings">Settings</Tab>
        </TabList>
        <TabPanel id="home">
          <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
            <Home />
          </div>
        </TabPanel>
        <TabPanel id="files">
          <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
            <Folder />
          </div>
        </TabPanel>
        <TabPanel id="search">
          <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
            <Search />
          </div>
        </TabPanel>
        <TabPanel id="settings">
          <div className={style({size: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
            <Settings />
          </div>
        </TabPanel>
      </Tabs>
      <p>Selected tab: {tab}</p>
    </div>
  );
}
```

## A

PI

```tsx
<Tabs>
  <TabList>
    <Tab>
      <Icon />
      <Text />
    </Tab>
  </TabList>
  <TabPanel />
</Tabs>
```

### Tabs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content to display in the tabs. |
| `defaultSelectedKey` | `Key | undefined` | — | The initial selected key in the collection (uncontrolled). |
| `density` | `"compact" | "regular" | undefined` | 'regular' | The amount of space between the tabs. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the TabList is disabled. Shows that a selection exists, but is not available in that circumstance. |
| `keyboardActivation` | `"manual" | "automatic" | undefined` | 'automatic' | Whether tabs are activated automatically on focus or manually. |
| `labelBehavior` | `"show" | "hide" | undefined` | 'show' | Defines if the text within the tabs should be hidden and only the icon should be shown. The text is always visible when the item is collapsed into a picker. |
| `onSelectionChange` | `((key: Key) => void) | undefined` | — | Handler that is called when the selection changes. |
| `orientation` | `Orientation | undefined` | 'horizontal' | The orientation of the tabs. |
| `selectedKey` | `Key | null | undefined` | — | The currently selected key in the collection (controlled). |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Tab

List

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `children` | `ReactNode | ((item: T) => ReactNode)` | — | The content to display in the tablist. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Tab

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content to display in the tab. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the tab. |
| `isDisabled` | `boolean | undefined` | — | Whether the tab is disabled. |
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
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Tab

Panel

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `ReactNode` | — | The content to display in the tab panels. |
| `id` | `Key | undefined` | — | The unique id of the tab. |
| `shouldForceMount` | `boolean | undefined` | false | Whether to mount the tab panel in the DOM even when it is not currently selected. Inactive tab panels are inert and cannot be interacted with. They must be styled appropriately so this is clear to the user visually. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
