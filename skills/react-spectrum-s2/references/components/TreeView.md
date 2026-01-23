# Tree

View

A tree view provides users with a way to navigate nested hierarchical information.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent} from '@react-spectrum/s2';

<TreeView
  aria-label="Files"
  
  defaultExpandedKeys={['documents']}>
  <TreeViewItem id="documents" textValue="Documents">
    <TreeViewItemContent>Documents</TreeViewItemContent>
    <TreeViewItem id="project-a" textValue="Project A">
      <TreeViewItemContent>Project A</TreeViewItemContent>
      <TreeViewItem id="report" textValue="Weekly Report">
        <TreeViewItemContent>Weekly Report</TreeViewItemContent>
      </TreeViewItem>
    </TreeViewItem>
    <TreeViewItem id="readme" textValue="README">
      <TreeViewItemContent>README</TreeViewItemContent>
    </TreeViewItem>
  </TreeViewItem>
</TreeView>
```

## Content

`TreeView` follows the [Collection Components API](collections.md?component=TreeView), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a recursive function to render the children.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent, Collection} from '@react-spectrum/s2';

let items = [
  {id: 1, title: 'Documents', type: 'directory', children: [
    {id: 2, title: 'Project', type: 'directory', children: [
      {id: 3, title: 'Weekly Report', type: 'file', children: []},
      {id: 4, title: 'Budget', type: 'file', children: []}
    ]}
  ]},
  {id: 5, title: 'Photos', type: 'directory', children: [
    {id: 6, title: 'Image 1', type: 'file', children: []},
    {id: 7, title: 'Image 2', type: 'file', children: []}
  ]}
];

<TreeView
  aria-label="Files"
  defaultExpandedKeys={[1, 4]}
  items={items}
  selectionMode="multiple">
  {function renderItem(item) {
    return (
      <TreeViewItem textValue={item.title}>
        <TreeViewItemContent>{item.title}</TreeViewItemContent>
        {/*- begin highlight -*/}
        {/* recursively render children */}
        <Collection items={item.children}>
          {renderItem}
        </Collection>
        {/*- end highlight -*/}
      </TreeViewItem>
    );
  }}
</TreeView>
```

### Slots

`TreeViewItemContent` supports icons, `Text`, [ActionMenu](ActionMenu.md), and [ActionButtonGroup](ActionButtonGroup.md) as children.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent, Collection, ActionMenu, MenuItem, Text} from '@react-spectrum/s2';
import Folder from '@react-spectrum/s2/icons/Folder';
import File from '@react-spectrum/s2/icons/File';
import Edit from '@react-spectrum/s2/icons/Edit';
import Delete from '@react-spectrum/s2/icons/Delete';

let items = [
  {id: 1, title: 'Documents', type: 'directory', children: [
    {id: 2, title: 'Project', type: 'directory', children: [
      {id: 3, title: 'Weekly Report', type: 'file', children: []},
      {id: 4, title: 'Budget', type: 'file', children: []}
    ]}
  ]},
  {id: 5, title: 'Photos', type: 'directory', children: [
    {id: 6, title: 'Image 1', type: 'file', children: []},
    {id: 7, title: 'Image 2', type: 'file', children: []}
  ]}
];

<TreeView
  aria-label="Files"
  defaultExpandedKeys={[1, 4]}
  items={items}
  selectionMode="multiple">
  {function renderItem(item) {
    return (
      <TreeViewItem textValue={item.title}>
        <TreeViewItemContent>
          {/*- begin highlight -*/}
          {item.type === 'directory' ? <Folder /> : <File />}
          <Text>{item.title}</Text>
          <ActionMenu>
          {/*- end highlight -*/}
            <MenuItem>
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem>
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <Collection items={item.children}>
          {renderItem}
        </Collection>
      </TreeViewItem>
    );
  }}
</TreeView>
```

### Asynchronous loading

Use [renderEmptyState](#empty-state) to display a spinner during initial load. To enable infinite scrolling, render a `<TreeViewLoadMoreItem>` at the end of each `<TreeViewItem>`.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent, TreeViewLoadMoreItem, Collection, useAsyncList} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface Character {
  name: string
}

function AsyncLoadingExample() {
  let starWarsList = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  let pokemonList = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      let res = await fetch(
        cursor || `https://pokeapi.co/api/v2/pokemon`,
        {signal}
      );
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <TreeView
      aria-label="Async loading tree"
      styles={style({height: 300})}>
      <TreeViewItem textValue="Pokemon">
        <TreeViewItemContent>Pokemon</TreeViewItemContent>
        <Collection items={pokemonList.items}>
          {(item) => (
            <TreeViewItem id={item.name} textValue={item.name}>
              <TreeViewItemContent>{item.name}</TreeViewItemContent>
            </TreeViewItem>
          )}
        </Collection>
        {/*- begin highlight -*/}
        <TreeViewLoadMoreItem
          onLoadMore={pokemonList.loadMore}
          loadingState={pokemonList.loadingState} />
        {/*- end highlight -*/}
      </TreeViewItem>
      <TreeViewItem textValue="Star Wars">
        <TreeViewItemContent>Star Wars</TreeViewItemContent>
        <Collection items={starWarsList.items}>
          {(item) => (
            <TreeViewItem id={item.name} textValue={item.name}>
              <TreeViewItemContent>{item.name}</TreeViewItemContent>
            </TreeViewItem>
          )}
        </Collection>
        {/*- begin highlight -*/}
        <TreeViewLoadMoreItem
          onLoadMore={starWarsList.loadMore}
          loadingState={starWarsList.loadingState} />
        {/*- end highlight -*/}
      </TreeViewItem>
    </TreeView>
  );
}
```

### Links

Use the `href` prop on a `<TreeItem>` to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent} from '@react-spectrum/s2';

<TreeView
  aria-label="TreeView with links"
  selectionMode="multiple"
  defaultExpandedKeys={['bulbasaur', 'ivysaur']}>
  <TreeViewItem
    /*- begin highlight -*/
    href="https://pokemondb.net/pokedex/bulbasaur"
    target="_blank"
    /*- end highlight -*/
    id="bulbasaur"
    textValue="Bulbasaur">
    <TreeViewItemContent>Bulbasaur</TreeViewItemContent>
    <TreeViewItem
      id="ivysaur"
      href="https://pokemondb.net/pokedex/ivysaur"
      target="_blank"
      textValue="Ivysaur">
      <TreeViewItemContent>Ivysaur</TreeViewItemContent>
      <TreeViewItem
        id="venusaur"
        textValue="Venusaur"
        href="https://pokemondb.net/pokedex/venusaur"
        target="_blank">
        <TreeViewItemContent>Venusaur</TreeViewItemContent>
      </TreeViewItem>
    </TreeViewItem>
  </TreeViewItem>
</TreeView>
```

### Empty state

Use `renderEmptyState` to render placeholder content when the tree is empty.

```tsx
import {TreeView, IllustratedMessage, Heading, Content, Link} from '@react-spectrum/s2';
import FolderOpen from '@react-spectrum/s2/illustrations/linear/FolderOpen';

<TreeView
  aria-label="Search results"
  /*- begin highlight -*/
  renderEmptyState={() => (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>No results</Heading>
      <Content>Press <Link href="https://adobe.com">here</Link> for more info.</Content>
    </IllustratedMessage>
  )}>
  {/*- end highlight -*/}
  {[]}
</TreeView>
```

## Selection and actions

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. The `onAction` event handles item actions. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Tree) for more details.

```tsx
import {TreeView, TreeViewItem, TreeViewItemContent, type Selection} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <div className={style({width: 'full'})}>
      <TreeView
        {...props}
        aria-label="Pokemon evolution"
        styles={style({height: 250, width: 'full', maxWidth: 300})}
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onAction={key => alert(`Clicked ${key}`)}
      >
        <TreeViewItem id="bulbasaur" textValue="Bulbasaur">
          <TreeViewItemContent>Bulbasaur</TreeViewItemContent>
          <TreeViewItem id="ivysaur" textValue="Ivysaur">
            <TreeViewItemContent>Ivysaur</TreeViewItemContent>
            <TreeViewItem id="venusaur" isDisabled textValue="Venusaur">
              <TreeViewItemContent>Venusaur</TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="charmander" textValue="Charmander">
          <TreeViewItemContent>Charmander</TreeViewItemContent>
          <TreeViewItem id="charmeleon" textValue="Charmeleon">
            <TreeViewItemContent>Charmeleon</TreeViewItemContent>
            <TreeViewItem id="charizard" textValue="Charizard">
              <TreeViewItemContent>Charizard</TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="squirtle" textValue="Squirtle">
          <TreeViewItemContent>Squirtle</TreeViewItemContent>
          <TreeViewItem id="wartortle" textValue="Wartortle">
            <TreeViewItemContent>Wartortle</TreeViewItemContent>
            <TreeViewItem id="blastoise" textValue="Blastoise">
              <TreeViewItemContent>Blastoise</TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </div>
  );
}
```

## A

PI

```tsx
<TreeView>
  <TreeViewItem>
    <TreeViewItemContent>
      <Icon />
      <Text />
      <ActionMenu /> or <ActionButtonGroup />
    </TreeViewItemContent>
    <TreeViewItem>
      {/* ... */}
    </TreeViewItem>
    <TreeViewLoadMoreItem />
  </TreeViewItem>
</TreeView>
```

### Tree

View

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Whether to auto focus the gridlist or an option. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `defaultExpandedKeys` | `Iterable<Key> | undefined` | — | The initial expanded keys in the collection (uncontrolled). |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `disabledBehavior` | `DisabledBehavior | undefined` | 'all' | Whether `disabledKeys` applies to all interactions, or only selection. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `escapeKeyBehavior` | `"clearSelection" | "none" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the grid list or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `expandedKeys` | `Iterable<Key> | undefined` | — | The currently expanded keys in the collection (controlled). |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a user performs an action on an item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onExpandedChange` | `((keys: Set<Key>) => any) | undefined` | — | Handler that is called when items are expanded or collapsed. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `renderEmptyState` | `((props: TreeEmptyStateRenderProps) => ReactNode) | undefined` | — | Provides content to display when there are no items in the list. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Tree

ViewItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this tree item. |
| `children` | `React.ReactNode` | — | The content of the tree item along with any nested children. Supports static nested tree items or use of a Collection to dynamically render nested tree items. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hasChildItems` | `boolean | undefined` | — | Whether this item has children, even if not loaded yet. |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the tree row. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on this tree item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
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
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string` | — | A string representation of the tree item's contents, used for features like typeahead. |
| `value` | `object | undefined` | — | The object value that this tree item represents. When using dynamic collections, this is set automatically. |

### Tree

ViewItemContent

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Rendered contents of the tree item or child items. |

### Tree

ViewLoadMoreItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `loadingState` | `LoadingState | undefined` | — | The current loading state of the TreeView or TreeView row. |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
