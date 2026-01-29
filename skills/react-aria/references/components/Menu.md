# Menu

A menu displays a list of actions or options that a user can choose.

## Vanilla 

CSS example

```tsx
import {MenuTrigger, SubmenuTrigger, Menu, MenuItem, MenuSection} from 'vanilla-starter/Menu';
import {Separator, Text, Keyboard} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';
import {Ellipsis, FolderOpen, Pencil, Copy, Trash, Share, Mail, Smartphone, Instagram} from 'lucide-react';

<MenuTrigger>
  <Button aria-label="Actions">
    <Ellipsis size={18} />
  </Button>
  <Menu>
    <MenuSection>
      <MenuItem onAction={() => alert('open')}>
        <FolderOpen />
        <Text slot="label">Open</Text>
        <Keyboard>⌘O</Keyboard>
      </MenuItem>
      <MenuItem onAction={() => alert('rename')}>
        <Pencil />
        <Text slot="label">Rename…</Text>
        <Keyboard>⌘R</Keyboard>
      </MenuItem>
      <MenuItem onAction={() => alert('duplicate')}>
        <Copy />
        <Text slot="label">Duplicate</Text>
        <Keyboard>⌘D</Keyboard>
      </MenuItem>
      <MenuItem onAction={() => alert('delete')}>
        <Trash />
        <Text slot="label">Delete…</Text>
        <Keyboard>⌘⌫</Keyboard>
      </MenuItem>
      <SubmenuTrigger>
        <MenuItem>
          <Share />
          <Text slot="label">Share</Text>
        </MenuItem>
        <Menu>
          <MenuItem>
            <Mail />
            <Text slot="label">Email</Text>
          </MenuItem>
          <MenuItem>
            <Smartphone />
            <Text slot="label">SMS</Text>
          </MenuItem>
          <MenuItem>
            <Instagram />
            <Text slot="label">Instagram</Text>
          </MenuItem>
        </Menu>
      </SubmenuTrigger>
    </MenuSection>
    <Separator />
    <MenuSection selectionMode="multiple" defaultSelectedKeys={['files']}>
      <MenuItem id="files">Show files</MenuItem>
      <MenuItem id="folders">Show folders</MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>
```

### Menu.tsx

```tsx
'use client';
import {Check, ChevronRight, Dot} from 'lucide-react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  MenuItemProps,
  MenuProps,
  MenuSectionProps,
  MenuTriggerProps,
  SubmenuTriggerProps,
} from 'react-aria-components';
import {Popover} from './Popover';
import { Text } from './Content';
import React from 'react';
import './Menu.css';

export function MenuTrigger(props: MenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover>
        {menu}
      </Popover>
    </AriaMenuTrigger>
  )
}

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu
      {...props} >
      {props.children}
    </AriaMenu>
  );
}

export function MenuItem(props: Omit<MenuItemProps, 'children'> & { children?: React.ReactNode }) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    (
      <AriaMenuItem {...props} textValue={textValue}>
        {({ hasSubmenu, isSelected, selectionMode }) => (
          <>
            {isSelected && selectionMode === 'multiple' ? <Check /> : null}
            {isSelected && selectionMode === 'single' ? <Dot /> : null}
            {typeof props.children === 'string' ? <Text slot="label">{props.children}</Text> : props.children}
            {hasSubmenu && (
              <ChevronRight />
            )}
          </>
        )}
      </AriaMenuItem>
    )
  );
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return <AriaMenuSection {...props} />;
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover hideArrow offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}

```

### Menu.css

```css
@import "./theme.css";

.react-aria-Menu {
  min-height: 0;
  max-height: inherit;
  box-sizing: border-box;
  overflow: auto;
  min-width: 150px;
  box-sizing: border-box;
  outline: none;
  border-radius: inherit;
  display: grid;
  --check-width: 0;
  grid-template-columns: var(--spacing-3) var(--check-width) auto 1fr auto var(--spacing-3);
  grid-auto-rows: max-content;

  &:has(> [data-selection-mode]) {
    --check-width: var(--spacing-6);
  }

  &[data-empty] {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
    min-height: var(--spacing-8);
  }
}

.react-aria-MenuItem {
  margin-inline: var(--spacing-1);
  padding: calc((var(--spacing-8) - 1lh) / 2) 0;
  border-radius: calc(var(--radius-lg) - var(--spacing-1));
  outline: none;
  cursor: default;
  color: var(--text-color);
  font: var(--font-size) system-ui;
  position: relative;
  display: grid;
  grid-column-start: 1;
  grid-column-end: -1;
  grid-template-areas: ". check icon label end ."
                       ". . . desc end .";
  grid-template-columns: subgrid;
  align-items: center;
  forced-color-adjust: none;
  -webkit-tap-highlight-color: transparent;

  > svg:not(.lucide-check, .lucide-dot, .lucide-chevron-right) {
    grid-area: icon;
    width: var(--spacing-4);
    height: var(--spacing-4);
    justify-self: center;
    margin-inline-end: var(--spacing-2);
  }

  &:first-of-type {
    margin-top: var(--spacing);
  }

  &:last-of-type {
    margin-bottom: var(--spacing);
  }

  &[data-open],
  &[data-pressed] {
    background: var(--highlight-hover);
  }

  &[data-focused] {
    background: var(--highlight-background);
    color: var(--highlight-foreground);
  }

  &[data-selection-mode] {
    .lucide-check,
    .lucide-dot {
      grid-area: check;
      width: var(--spacing-4);
      height: var(--spacing-4);
    }

    .lucide-check {
      stroke-width: 3px;
    }

    .lucide-dot {
      scale: 3;
    }
  }

  &[href] {
    text-decoration: none;
    cursor: pointer;
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
  }

  .react-aria-Text:not([slot]),
  [slot=label] {
    grid-area: label;
    font-weight: 500;
  }

  [slot=description] {
    font-size: var(--font-size-sm);
    grid-area: desc;
  }

  kbd {
    grid-area: end;
    justify-self: end;
    margin-inline-start: var(--spacing-4);
    font-family: system-ui;
    font-size: var(--font-size-sm);
    text-align: end;
    background: var(--highlight-hover);
    border: 0.5px solid var(--highlight-pressed);
    padding: 0 var(--spacing-1);
    border-radius: var(--radius-sm);
  }

  &[data-focused] kbd {
    background: rgb(255 255 255 / 0.1);
    border-color: rgb(255 255 255 / 0.2);
  }

  .lucide-chevron-right {
    grid-area: end;
    margin-left: var(--spacing-1);
    justify-self: end;
    width: var(--spacing-4);
    height: var(--spacing-4);
  }
}

.react-aria-MenuSection {
  display: grid;
  grid-column-start: 1;
  grid-column-end: -1;
  --check-width: 0;
  grid-template-columns: var(--spacing-3) var(--check-width) auto 1fr auto var(--spacing-3);

  &:has(> [data-selection-mode]) {
    --check-width: var(--spacing-6);
  }

  .react-aria-Header {
    grid-column-start: 1;
    grid-column-end: -1;
    font-size: var(--font-size-sm);
    font-weight: 600;
    font-variation-settings: initial;
    padding: var(--spacing-1) var(--spacing-3);
    background: var(--gray-100);
    border-block: 0.5px solid var(--gray-400);
    cursor: default;
    user-select: none;
    box-shadow: inset 0px 1px 0px white, inset 0px -4px 8px var(--gray-200);

    @media (prefers-color-scheme: dark) {
      box-shadow: inset 0px 4px 8px var(--gray-200);
    }
  }

  &:first-child .react-aria-Header {
    margin-top: -0.5px;
  }
}

.react-aria-Menu .react-aria-Separator {
  grid-column-start: 1;
  grid-column-end: -1;
  margin: 0 var(--spacing-2);
  border: 0;
  border-top: 0.5px solid var(--border-color);
  height: auto;
  width: auto;

  .react-aria-MenuItem + & {
    margin-block-start: var(--spacing-1);
  }

  &:has(+ .react-aria-MenuItem) {
    margin-block-end: var(--spacing-1);
  }
}

```

## Tailwind example

```tsx
import {MenuTrigger, SubmenuTrigger, Menu, MenuItem, MenuSection, MenuSeparator} from 'tailwind-starter/Menu';
import {Button} from 'tailwind-starter/Button';
import {MoreHorizontal} from 'lucide-react';

<MenuTrigger>
  <Button aria-label="Actions" variant="secondary">
    <MoreHorizontal className="w-5 h-5" />
  </Button>
  <Menu>
    <MenuItem onAction={() => alert('open')}>Open</MenuItem>
    <MenuItem onAction={() => alert('rename')}>Rename…</MenuItem>
    <MenuItem onAction={() => alert('duplicate')}>Duplicate</MenuItem>
    <MenuItem onAction={() => alert('delete')}>Delete…</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Share</MenuItem>
      <Menu>
        <MenuItem>Email</MenuItem>
        <MenuItem>SMS</MenuItem>
        <MenuItem>Instagram</MenuItem>
      </Menu>
    </SubmenuTrigger>
    <MenuSeparator />
    <MenuSection selectionMode="multiple" defaultSelectedKeys={['files']}>
      <MenuItem id="files">Show files</MenuItem>
      <MenuItem id="folders">Show folders</MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>
```

### Menu.tsx

```tsx
'use client';
import { Check, ChevronRight } from 'lucide-react';
import React from 'react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuProps,
  MenuItemProps,
  MenuSection as AriaMenuSection,
  MenuSectionProps as AriaMenuSectionProps,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  Separator,
  SeparatorProps,
  composeRenderProps,
  Header,
  Collection,
  SubmenuTriggerProps,
  MenuTriggerProps as AriaMenuTriggerProps
} from 'react-aria-components';
import { dropdownItemStyles } from './ListBox';
import { Popover, PopoverProps } from './Popover';

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu {...props} className="font-sans p-1 outline outline-0 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)] empty:text-center empty:pb-2" />
  );
}

export function MenuItem(props: MenuItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem textValue={textValue} {...props} className={dropdownItemStyles}>
      {composeRenderProps(props.children, (children, {selectionMode, isSelected, hasSubmenu}) => <>
        {selectionMode !== 'none' && (
          <span className="flex items-center w-4">
            {isSelected && <Check aria-hidden className="w-4 h-4" />}
          </span>
        )}
        <span className="flex items-center flex-1 gap-2 font-normal truncate group-selected:font-semibold">
          {children}
        </span>
        {hasSubmenu && (
          <ChevronRight aria-hidden className="absolute w-4 h-4 right-2" />
        )}
      </>)}
    </AriaMenuItem>
  );
}

export function MenuSeparator(props: SeparatorProps) {
  return <Separator {...props} className="mx-3 my-1 border-b border-neutral-300 dark:border-neutral-700" />
}

export interface MenuSectionProps<T> extends AriaMenuSectionProps<T> {
  title?: string
  items?: any
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return (
    <AriaMenuSection {...props} className="first:-mt-[5px] after:content-[''] after:block after:h-[5px]">
      {props.title && <Header className="text-sm font-semibold text-neutral-500 dark:text-neutral-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-neutral-100/60 dark:bg-neutral-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-neutral-100 border-y border-y-neutral-200 dark:border-y-neutral-700 [&+*]:mt-1">{props.title}</Header>}
      <Collection items={props.items}>
        {props.children}
      </Collection>
    </AriaMenuSection>
  )
}

interface MenuTriggerProps extends AriaMenuTriggerProps {
  placement?: PopoverProps['placement']
}

export function MenuTrigger(props: MenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover placement={props.placement} className="min-w-[150px]">
        {menu}
      </Popover>
    </AriaMenuTrigger>
  );
}

export function SubmenuTrigger(
  props: SubmenuTriggerProps
) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}

```

## Content

`Menu` follows the [Collection Components API](collections.md?component=Menu), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';

function Example() {
  let items = [
    { id: 1, name: 'New file…' },
    { id: 2, name: 'New window' },
    { id: 3, name: 'Open…' },
    { id: 4, name: 'Save' },
    { id: 5, name: 'Save as…' },
    { id: 6, name: 'Revert file' },
    { id: 7, name: 'Print…' },
    { id: 8, name: 'Close window' },
    { id: 9, name: 'Quit' }
  ];

  return (
    <MenuTrigger>
      <Button>File</Button>
      {/*- begin highlight -*/}
      <Menu items={items}>
        {(item) => <MenuItem>{item.name}</MenuItem>}
      </Menu>
      {/*- end highlight -*/}
    </MenuTrigger>
  );
}
```

### Text slots

Use the `"label"` and `"description"` slots to separate primary and secondary content within a `<MenuItem>`. This improves screen reader announcements and can also be used for styling purposes. Use the `<Keyboard>` component to display a keyboard shortcut.

```tsx
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Text, Keyboard} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';

<MenuTrigger>
  <Button>Permissions</Button>
  <Menu>
    <MenuItem textValue="Copy">
      {/*- begin highlight -*/}
      <Text slot="label">Copy</Text>
      <Text slot="description">Copy the selected text</Text>
      {/*- end highlight -*/}
      <Keyboard>⌘C</Keyboard>
    </MenuItem>
    <MenuItem textValue="Cut">
      <Text slot="label">Cut</Text>
      <Text slot="description">Cut the selected text</Text>
      <Keyboard>⌘X</Keyboard>
    </MenuItem>
    <MenuItem textValue="Paste">
      <Text slot="label">Paste</Text>
      <Text slot="description">Paste the copied text</Text>
      <Keyboard>⌘V</Keyboard>
    </MenuItem>
  </Menu>
</MenuTrigger>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Interactive elements (e.g. buttons) within menu items are not allowed. This will break keyboard and screen reader navigation. Only add textual or decorative graphics (e.g. icons or images) as children.</Content>
</InlineAlert>

### Sections

Use the `<MenuSection>` component to group options. A `<Header>` element may also be included to label the section. Sections without a header must have an `aria-label`.

```tsx
import {Header} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem, MenuSection} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';

<MenuTrigger>
  <Button>Publish</Button>
  <Menu>
    {/*- begin highlight -*/}
    <MenuSection>
      <Header>Export</Header>
      {/*- end highlight -*/}
      <MenuItem>Image…</MenuItem>
      <MenuItem>Video…</MenuItem>
      <MenuItem>Text…</MenuItem>
    </MenuSection>
    <MenuSection>
      <Header>Share</Header>
      <MenuItem>YouTube…</MenuItem>
      <MenuItem>Instagram…</MenuItem>
      <MenuItem>Email…</MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>
```

### Submenus

Wrap a `<MenuItem>` with a `<SubmenuTrigger>` to create a submenu.

```tsx
import {MenuTrigger, SubmenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';

<MenuTrigger>
  <Button>Actions</Button>
  <Menu>
    <MenuItem>Cut</MenuItem>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Delete</MenuItem>
    {/*- begin highlight -*/}
    <SubmenuTrigger>
      <MenuItem>Share</MenuItem>
      {/*- end highlight -*/}
      <Menu>
        <MenuItem>SMS</MenuItem>
        <MenuItem>Instagram</MenuItem>
        <SubmenuTrigger>
          <MenuItem>Email</MenuItem>
          <Menu>
            <MenuItem>Work</MenuItem>
            <MenuItem>Personal</MenuItem>
          </Menu>
        </SubmenuTrigger>
      </Menu>
    </SubmenuTrigger>
  </Menu>
</MenuTrigger>
```

### Separators

Separators may be added between menu items or sections in order to create non-labeled groupings.

```tsx
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Separator} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';

<MenuTrigger>
  <Button>Actions</Button>
  <Menu>
    <MenuItem>New…</MenuItem>
    <MenuItem>Open…</MenuItem>
    {/*- begin highlight -*/}
    <Separator />
    {/*- end highlight -*/}
    <MenuItem>Save</MenuItem>
    <MenuItem>Save as…</MenuItem>
    <MenuItem>Rename…</MenuItem>
    <Separator />
    <MenuItem>Page setup…</MenuItem>
    <MenuItem>Print…</MenuItem>
  </Menu>
</MenuTrigger>
```

### Links

Use the `href` prop on a `<MenuItem>` to create a link. See the [framework setup guide](frameworks.md) to learn how to integrate with your framework.

```tsx
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';

<MenuTrigger>
  <Button>Links</Button>
  <Menu>
    {/*- begin highlight -*/}
    <MenuItem href="https://adobe.com/" target="_blank">Adobe</MenuItem>
    {/*- end highlight -*/}
    <MenuItem href="https://apple.com/" target="_blank">Apple</MenuItem>
    <MenuItem href="https://google.com/" target="_blank">Google</MenuItem>
    <MenuItem href="https://microsoft.com/" target="_blank">Microsoft</MenuItem>
  </Menu>
</MenuTrigger>
```

### Autocomplete

Popovers can include additional components as siblings of a menu. This example uses an [Autocomplete](Autocomplete.md) with a [SearchField](SearchField.md) to let the user filter the items.

```tsx
import {Autocomplete, useFilter} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';
import {SearchField} from 'vanilla-starter/SearchField';

function Example() {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <MenuTrigger>
      <Button>Add tag...</Button>
      <div style={{display: 'flex', flexDirection: 'column', maxHeight: 'inherit'}}>
        {/*- begin highlight -*/}
        <Autocomplete filter={contains}>
          <SearchField aria-label="Search tags" placeholder="Search tags" autoFocus style={{margin: 4}} />
          <Menu style={{flex: 1}}>
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
      </div>
    </MenuTrigger>
  );
}
```

## Selection

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Menu) for more details.

```tsx
import type {Selection} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set(['rulers']));

  return (
    <>
      <MenuTrigger>
        <Button>View</Button>
        <Menu
          {...props}
          
          selectedKeys={selected}
          onSelectionChange={setSelected}>
          {/*- end highlight -*/}
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
import type {Selection} from 'react-aria-components';
import {Header} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem, MenuSection} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

function Example() {
  let [style, setStyle] = useState<Selection>(new Set(['bold']));
  let [align, setAlign] = useState<Selection>(new Set(['left']));
  return (
    <MenuTrigger>
      <Button>Edit</Button>
      <Menu>
        <MenuSection>
          <Header>Clipboard</Header>
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
          <Header>Text style</Header>
          <MenuItem id="bold">Bold</MenuItem>
          <MenuItem id="italic">Italic</MenuItem>
          <MenuItem id="underline">Underline</MenuItem>
        </MenuSection>
        <MenuSection selectionMode="single" selectedKeys={align} onSelectionChange={setAlign}>
          <Header>Text alignment</Header>
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

### Custom trigger

`MenuTrigger` works with any pressable React Aria component (e.g. [Button](Button.md), [Link](Link.md), etc.). Use the `<Pressable>` component or [usePress](usePress.md) hook to wrap a custom trigger element such as a third party component or DOM element.

```tsx
import {Pressable} from 'react-aria-components';
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';

<MenuTrigger>
  {/*- begin highlight -*/}
  <Pressable>
    <span role="button">Custom trigger</span>
  </Pressable>
  {/*- end highlight -*/}
  <Menu>
    <MenuItem>Open</MenuItem>
    <MenuItem>Rename…</MenuItem>
    <MenuItem>Duplicate</MenuItem>
    <MenuItem>Delete…</MenuItem>
  </Menu>
</MenuTrigger>
```

<InlineAlert variant="notice">
  <Heading>Accessibility</Heading>
  <Content>Any `<Pressable>` child must have an [interactive ARIA role](https://www.w3.org/TR/wai-aria-1.2/#widget_roles) or use an appropriate semantic HTML element so that screen readers can announce the trigger. Trigger components must forward their `ref` and spread all props to a DOM element.</Content>
</InlineAlert>

```tsx
const CustomTrigger = React.forwardRef((props, ref) => (
  <button {...props} ref={ref} />
));
```

### Long press

Use `trigger="longPress"` to open the menu on long press instead of on click/tap. Keyboard users can open the menu using <Keyboard>Alt</Keyboard> <Keyboard>▼</Keyboard>. This is useful when the menu trigger has a primary action on press, and the menu provides secondary actions.

```tsx
import {MenuTrigger, Menu, MenuItem} from 'vanilla-starter/Menu';
import {Button} from 'vanilla-starter/Button';
import {ChevronDown} from 'lucide-react';

<MenuTrigger trigger="longPress">
  <Button onPress={() => alert('crop')}>
    <span>Crop</span>
    <ChevronDown size={18} />
  </Button>
  <Menu>
    <MenuItem>Rotate</MenuItem>
    <MenuItem>Slice</MenuItem>
    <MenuItem>Clone stamp</MenuItem>
  </Menu>
</MenuTrigger>
```

## Examples

<ExampleList
  tag="menu"
  pages={props.pages}
/>

## A

PI

```tsx
<MenuTrigger>
  <Button />
  <Popover>
    <Menu>
      <MenuItem>
        <Text slot="label" />
        <Text slot="description" />
        <Keyboard />
        <SelectionIndicator />
      </MenuItem>
      <Separator />
      <MenuSection>
        <Header />
        <MenuItem />
      </MenuSection>
      <SubmenuTrigger>
        <MenuItem />
        <Popover>
          <Menu />
        </Popover>
      </SubmenuTrigger>
    </Menu>
  </Popover>
</MenuTrigger>
```

### Menu

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — |  |
| `defaultOpen` | `boolean | undefined` | — | Whether the overlay is open by default (uncontrolled). |
| `isOpen` | `boolean | undefined` | — | Whether the overlay is open by default (controlled). |
| `isTriggerUpWhenOpen` | `boolean | undefined` | — | Whether the trigger is up when the overlay is open. |
| `onOpenChange` | `((isOpen: boolean) => void) | undefined` | — | Handler that is called when the overlay's open state changes. |
| `trigger` | `MenuTriggerType | undefined` | 'press' | How the menu is triggered. |

### Menu

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Where the focus should be set. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `className` | `ClassNameOrFunction<MenuRenderProps> | undefined` | 'react-aria-Menu' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelectedKeys` | `Iterable<Key> | "all" | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `escapeKeyBehavior` | `"none" | "clearSelection" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the menu or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when an item is selected. |
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
| `onClose` | `(() => void) | undefined` | — | Handler that is called when the menu should close after selecting an item. |
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
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
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
| `renderEmptyState` | `(() => ReactNode) | undefined` | — | Provides content to display when there are no items in the list. |
| `selectedKeys` | `Iterable<Key> | "all" | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `shouldFocusWrap` | `boolean | undefined` | — | Whether keyboard navigation is circular. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: MenuRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Menu

Item

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this item. |
| `children` | `ChildrenOrFunction<MenuItemRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<MenuItemRenderProps> | undefined` | 'react-aria-MenuItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when the item is selected. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element loses focus. |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `((e: React.FocusEvent<Element>) => void) | undefined` | — | Handler that is called when the element receives focus. |
| `onFocusChange` | `((isFocused: boolean) => void) | undefined` | — | Handler that is called when the element's focus status changes. |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
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
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
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
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `style` | `(React.CSSProperties | ((values: MenuItemRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |

### Menu

Section

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for the section. |
| `children` | `React.ReactNode | ((item: T) => ReactElement)` | — | Static child items or a function to render children. |
| `className` | `string | undefined` | 'react-aria-MenuSection' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `defaultSelectedKeys` | `Iterable<Key> | "all" | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The currently disabled keys in the collection (controlled). |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | The unique id of the section. |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the section. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
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
| `onScroll` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
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
| `onWheel` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `selectedKeys` | `Iterable<Key> | "all" | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldCloseOnSelect` | `boolean | undefined` | — | Whether the menu should close when the menu item is selected. |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this section represents. When using dynamic collections, this is set automatically. |

### Submenu

Trigger

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactElement<unknown, string | React.JSXElementConstructor<any>>[]` | — | The contents of the SubmenuTrigger. The first child should be an Item (the trigger) and the second child should be the Popover (for the submenu). |
| `delay` | `number | undefined` | 200 | The delay time in milliseconds for the submenu to appear after hovering over the trigger. |
