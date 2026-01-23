# Tree

A tree provides users with a way to navigate nested hierarchical information, with support for keyboard navigation
and selection.

## Vanilla 

CSS example

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';

<Tree
  
  aria-label="Files">
  <TreeItem title="Documents">
    <TreeItem title="Project">
      <TreeItem title="Weekly Report" />
    </TreeItem>
  </TreeItem>
  <TreeItem title="Photos">
    <TreeItem title="Image 1" />
    <TreeItem title="Image 2" />
  </TreeItem>
</Tree>
```

### Tree.tsx

```tsx
'use client';
import {
  Button,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  TreeItemContentProps,
  TreeItemContentRenderProps,
  TreeItemProps as AriaTreeItemProps,
  TreeProps,
  TreeLoadMoreItem as AriaTreeLoadMoreItem,
  TreeLoadMoreItemProps
} from 'react-aria-components';
import {ChevronRight, GripVertical} from 'lucide-react';
import {Checkbox} from './Checkbox';
import {ProgressCircle} from './ProgressCircle';
import './Tree.css';

export function Tree<T extends object>(props: TreeProps<T>) {
  return <AriaTree {...props} />;
}

export function TreeItemContent(
  props: Omit<TreeItemContentProps, 'children'> & { children?: React.ReactNode }
) {
  return (
    <AriaTreeItemContent>
      {(
        { selectionBehavior, selectionMode, allowsDragging }:
          TreeItemContentRenderProps
      ) => (
        <>
          {allowsDragging && <Button slot="drag"><GripVertical size={16} /></Button>}
          {selectionBehavior === 'toggle' && selectionMode !== 'none' && (
            <Checkbox slot="selection" />
          )}
          <Button slot="chevron">
            <ChevronRight />
          </Button>
          {props.children}
        </>
      )}
    </AriaTreeItemContent>
  );
}

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title: React.ReactNode;
}

export function TreeItem(props: TreeItemProps) {
  let textValue = typeof props.title === 'string' ? props.title : '';
  return (
    <AriaTreeItem textValue={textValue} {...props}>
      <TreeItemContent>
        {props.title}
      </TreeItemContent>
      {props.children}
    </AriaTreeItem>
  );
}

export function TreeLoadMoreItem(props: TreeLoadMoreItemProps) {
  return (
    <AriaTreeLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaTreeLoadMoreItem>
  );
}

```

### Tree.css

```css
@import "./theme.css";

.react-aria-Tree {
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: var(--spacing-1);
  border: 0.5px solid var(--border-color);
  border-radius: calc(var(--radius) + var(--spacing-1));
  background: var(--overlay-background);
  forced-color-adjust: none;
  outline: none;
  width: 250px;
  max-height: 300px;
  box-sizing: border-box;
  --drag-button-width: 0px;
  --checkbox-width: 0px;

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -1px;
  }

  &[data-empty] {
    align-items: center;
    justify-content: center;
    font-style: italic;
    min-height: 100px;
  }

  &[data-selection-mode=multiple] {
    --checkbox-width: calc(var(--spacing) * 6.5);
  }

  &[data-allows-dragging] {
    --drag-button-width: var(--spacing-6);
  }

  &[data-drop-target] {
    outline: 2px solid var(--highlight-background);
    outline-offset: -1px;
    background: var(--highlight-overlay);
  }

  .react-aria-DropIndicator {
    &[data-drop-target] {
      outline: 1px solid var(--highlight-background);
      margin-left: calc(var(--spacing-2) + var(--checkbox-width) + var(--drag-button-width) + var(--spacing-5) + (var(--tree-item-level) - 1) * var(--spacing-4));
    }
  }
}

.react-aria-TreeItem {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: var(--spacing-8);
  padding: var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-2);
  box-sizing: border-box;
  --padding: var(--spacing-4);
  border-radius: var(--radius);
  outline: none;
  cursor: default;
  color: var(--text-color);
  font: var(--font-size) system-ui;
  position: relative;
  transform: translateZ(0);
  transition-property: background, color, border-radius;
  transition-duration: 200ms;
  -webkit-tap-highlight-color: transparent;
  --chevron-width: var(--spacing-5);

  &[data-has-child-items] {
    --chevron-width: 0px;
  }

  --border-color: var(--gray-300);
  &:not(:last-child)::after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    inset-inline-start: calc(var(--spacing-2) + var(--checkbox-width) + var(--drag-button-width) + var(--chevron-width) + (var(--tree-item-level) - 1) * var(--padding));
    inset-inline-end: var(--spacing-2);
    border-bottom: 0.5px solid var(--border-color);
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -2px;
  }

  &[data-pressed] {
    background: var(--highlight-hover);
  }

  &[data-selected] {
    background: var(--highlight-background);
    color: var(--highlight-foreground);
    --focus-ring-color: var(--highlight-foreground);
    --border-color: transparent;

    &[data-focus-visible] {
      outline-color: var(--highlight-foreground);
      outline-offset: -4px;
    }

    &:has(+ [data-selected]),
    &:has(+ .react-aria-DropIndicator + [data-selected]) {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      --border-color: rgb(255 255 255 / 0.3);
    }

    + [data-selected],
    + .react-aria-DropIndicator + [data-selected] {
      border-start-start-radius: 0;
      border-start-end-radius: 0;
    }
  }

  &[data-href] {
    cursor: pointer;
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
  }

  .react-aria-Button:not([slot]) {
    margin-left: auto;
  }

  &[data-allows-dragging] {
    padding-left: 4px;
  }

  &[data-dragging] {
    opacity: 0.6;
  }

  &[data-drop-target] {
    outline: 2px solid var(--highlight-background);
    background: var(--highlight-overlay);
  }

  .react-aria-Button[slot=chevron] {
    all: unset;
    display: flex;
    visibility: hidden;
    align-items: center;
    justify-content: center;
    width: var(--spacing-4);
    height: 100%;
    padding-left: calc((var(--tree-item-level) - 1) * var(--padding));

    svg {
      rotate: 0deg;
      transition: rotate 200ms;
      fill: none;
      stroke: currentColor;
      stroke-width: 3px;
    }
  }

  &[data-has-child-items] .react-aria-Button[slot=chevron] {
    visibility: visible;
  }

  &[data-expanded] .react-aria-Button[slot=chevron] svg {
    rotate: 90deg;
  }

  .react-aria-Button[slot=drag] {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--spacing-4);
    text-align: center;

    &[data-focus-visible] {
      border-radius: 4px;
      outline: 2px solid var(--focus-ring-color);
    }
  }
}

:where(.react-aria-TreeItem) .react-aria-Checkbox {
  --checkmark-color: var(--highlight-background);
  &[data-selected] .indicator {
    --indicator-color: var(--highlight-foreground);
    --indicator-shadow: transparent;
  }
}

.react-aria-TreeLoader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
}

```

## Tailwind example

```tsx
import {Tree, TreeItem} from 'tailwind-starter/Tree';

<Tree
  
  aria-label="Files">
  <TreeItem title="Documents">
    <TreeItem title="Project">
      <TreeItem title="Weekly Report" />
    </TreeItem>
  </TreeItem>
  <TreeItem title="Photos">
    <TreeItem title="Image 1" />
    <TreeItem title="Image 2" />
  </TreeItem>
</Tree>
```

### Tree.tsx

```tsx
'use client';
import React from 'react';
import {
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  Button,
  TreeItemProps as AriaTreeItemProps,
  TreeProps
} from 'react-aria-components';
import { ChevronRight } from "lucide-react";
import { tv } from 'tailwind-variants';
import { Checkbox } from './Checkbox';
import { composeTailwindRenderProps, focusRing } from './utils';

const itemStyles = tv({
  extend: focusRing,
  base: 'relative font-sans flex group gap-3 cursor-default select-none py-1 px-3 text-sm text-neutral-900 dark:text-neutral-200 bg-white dark:bg-neutral-900 border-t dark:border-t-neutral-700 border-transparent first:border-t-0 -outline-offset-2 first:rounded-t-lg last:rounded-b-lg',
  variants: {
    isSelected: {
      false: 'hover:bg-neutral-100 pressed:bg-neutral-100 dark:hover:bg-neutral-800 dark:pressed:bg-neutral-800',
      true: 'bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 pressed:bg-blue-200 dark:hover:bg-blue-700/40 dark:pressed:bg-blue-700/40 border-y-blue-200 dark:border-y-blue-900 z-20'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText] z-10'
    }
  }
});

export function Tree<T extends object>(
  { children, ...props }: TreeProps<T>
) {
  return (
    <AriaTree {...props} className={composeTailwindRenderProps(props.className, 'w-48 max-w-full overflow-auto relative border border-neutral-200 dark:border-neutral-700 rounded-lg')}>
      {children}
    </AriaTree>
  );
}

const expandButton = tv({
  extend: focusRing,
  base: "border-0 p-0 bg-transparent shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-start cursor-default [-webkit-tap-highlight-color:transparent]",
  variants: {
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

const chevron = tv({
  base: "w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ease-in-out",
  variants: {
    isExpanded: {
      true: "transform rotate-90",
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title: string;
}

export function TreeItem(props: TreeItemProps) {
  return (
    <AriaTreeItem className={itemStyles}  textValue={props.title} {...props}>
      <AriaTreeItemContent {...props}>
        {({ selectionMode, selectionBehavior, hasChildItems, isExpanded, isDisabled }) => (
          <div className={`flex items-center`}>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            <div className='shrink-0 w-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]' />
            {hasChildItems ? (
              <Button slot="chevron" className={expandButton({ isDisabled })}>
              <ChevronRight aria-hidden className={chevron({ isExpanded, isDisabled })} />
            </Button>
            ) : <div className='shrink-0 w-8 h-8' />}
            {props.title}
          </div>
        )}
      </AriaTreeItemContent>
      {props.children}
    </AriaTreeItem>
  )
}

```

## Content

`Tree` follows the [Collection Components API](collections.md?component=Tree), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a recursive function to render the children.

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {Collection} from 'react-aria-components';

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

<Tree
  aria-label="Files"
  defaultExpandedKeys={[1, 4]}
  items={items}
  selectionMode="multiple">
  {function renderItem(item) {
    return (
      <TreeItem title={item.title}>
        {/*- begin highlight -*/}
        {/* recursively render children */}
        <Collection items={item.children}>
          {renderItem}
        </Collection>
        {/*- end highlight -*/}
      </TreeItem>
    );
  }}
</Tree>
```

### Asynchronous loading

Use [renderEmptyState](#empty-state) to display a spinner during initial load. To enable infinite scrolling, render a `<TreeLoadMoreItem>` at the end of each `<TreeItem>`. Use whatever data fetching library you prefer – this example uses `useAsyncList` from `react-stately`.

```tsx
import {Tree, TreeItem, TreeLoadMoreItem} from 'vanilla-starter/Tree';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';
import {Collection, useAsyncList} from 'react-aria-components';

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
    <Tree
      aria-label="Async loading tree"
      style={{height: 300}}
      renderEmptyState={() => (
        <ProgressCircle isIndeterminate aria-label="Loading..." />
      )}>
      <TreeItem title="Pokemon">
        <Collection items={pokemonList.items}>
          {(item) => <TreeItem id={item.name} title={item.name} />}
        </Collection>
        {/*- begin highlight -*/}
        <TreeLoadMoreItem
          onLoadMore={pokemonList.loadMore}
          isLoading={pokemonList.loadingState === 'loadingMore'} />
        {/*- end highlight -*/}
      </TreeItem>
      <TreeItem title="Star Wars">
        <Collection items={starWarsList.items}>
          {(item) => <TreeItem id={item.name} title={item.name} />}
        </Collection>
        {/*- begin highlight -*/}
        <TreeLoadMoreItem
          onLoadMore={starWarsList.loadMore}
          isLoading={starWarsList.loadingState === 'loadingMore'} />
        {/*- end highlight -*/}
      </TreeItem>
    </Tree>
  );
}
```

### Links

Use the `href` prop on a `<TreeItem>` to create a link. See the [framework setup guide](frameworks.md) to learn how to integrate with your framework. Link interactions vary depending on the selection behavior. See the [selection guide](selection.md?component=Tree#selection-behavior) for more details.

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';

<Tree
  
  aria-label="Tree with links"
  defaultExpandedKeys={['bulbasaur', 'ivysaur']}>
  <TreeItem
    /*- begin highlight -*/
    href="https://pokemondb.net/pokedex/bulbasaur"
    target="_blank"
    /*- end highlight -*/
    id="bulbasaur"
    title="Bulbasaur">
    <TreeItem
      id="ivysaur"
      title="Ivysaur"
      href="https://pokemondb.net/pokedex/ivysaur"
      target="_blank">
      <TreeItem
        id="venusaur"
        title="Venusaur"
        href="https://pokemondb.net/pokedex/venusaur"
        target="_blank" />
    </TreeItem>
  </TreeItem>
</Tree>
```

### Empty state

```tsx
import {Tree} from 'vanilla-starter/Tree';

<Tree
  aria-label="Search results"
  renderEmptyState={() => 'No results found.'}>
  {[]}
</Tree>
```

## Selection and actions

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. The `onAction` event handles item actions. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=Tree) for more details.

```tsx
import type {Selection} from 'react-aria-components';
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <div>
      <Tree
        {...props}
        aria-label="Pokemon evolution"
        style={{height: 250}}
        defaultExpandedKeys={['bulbasaur', 'ivysaur']}
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onAction={key => alert(`Clicked ${key}`)}
      >
        <TreeItem id="bulbasaur" title="Bulbasaur">
          <TreeItem id="ivysaur" title="Ivysaur">
            <TreeItem id="venusaur" title="Venusaur" isDisabled />
          </TreeItem>
        </TreeItem>
        <TreeItem id="charmander" title="Charmander">
          <TreeItem id="charmeleon" title="Charmeleon">
            <TreeItem id="charizard" title="Charizard" />
          </TreeItem>
        </TreeItem>
        <TreeItem id="squirtle" title="Squirtle">
          <TreeItem id="wartortle" title="Wartortle">
            <TreeItem id="blastoise" title="Blastoise" />
          </TreeItem>
        </TreeItem>
      </Tree>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </div>
  );
}
```

## Drag and drop

Tree supports drag and drop interactions when the `dragAndDropHooks` prop is provided using the `useDragAndDrop` hook. Users can drop data on the list as a whole, on individual items, insert new items between existing ones, or reorder items. React Aria supports drag and drop via mouse, touch, keyboard, and screen reader interactions. See the [drag and drop guide](dnd.md?component=Tree) to learn more.

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {useDragAndDrop, Collection, useTreeData} from 'react-aria-components';

function Example() {
  let tree = useTreeData({
    initialItems: [
      {id: '1', title: 'Documents', type: 'directory', children: [
        {id: '2', title: 'Project', type: 'directory', children: [
          {id: '3', title: 'Weekly Report', type: 'file', children: []},
          {id: '4', title: 'Budget', type: 'file', children: []}
        ]}
      ]},
      {id: '5', title: 'Photos', type: 'directory', children: [
        {id: '6', title: 'Image 1', type: 'file', children: []},
        {id: '7', title: 'Image 2', type: 'file', children: []}
      ]}
    ]
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys, items: typeof tree.items) => items.map(item => ({'text/plain': item.value.title})),
    onMove(e) {
      if (e.target.dropPosition === 'before') {
        tree.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        tree.moveAfter(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'on') {
        // Move items to become children of the target
        let targetNode = tree.getItem(e.target.key);
        if (targetNode) {
          let targetIndex = targetNode.children ? targetNode.children.length : 0;
          let keyArray = Array.from(e.keys);
          for (let i = 0; i < keyArray.length; i++) {
            tree.move(keyArray[i], e.target.key, targetIndex + i);
          }
        }
      }
    }
  });

  return (
    <Tree
      aria-label="Tree with hierarchical drag and drop"
      selectionMode="multiple"
      items={tree.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {function renderItem(item) {
        return (
          <TreeItem title={item.value.title}>
            {item.children && <Collection items={item.children}>
              {renderItem}
            </Collection>}
          </TreeItem>
        )
      }}
    </Tree>
  );
}
```

## Examples

<ExampleList
  tag="tree"
  pages={props.pages}
/>

## A

PI

```tsx
<Tree>
  <TreeItem>
    <TreeItemContent>
      <Button slot="chevron" />
      <Checkbox slot="selection" /> or <SelectionIndicator />
      <Button slot="drag" />
    </TreeItemContent>
    <TreeItem>
      {/* ... */}
    </TreeItem>
    <TreeLoadMoreItem />
  </TreeItem>
</Tree>
```

### Tree

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Whether to auto focus the gridlist or an option. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `className` | `ClassNameOrFunction<TreeRenderProps> | undefined` | 'react-aria-Tree' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultExpandedKeys` | `Iterable<Key> | undefined` | — | The initial expanded keys in the collection (uncontrolled). |
| `defaultSelectedKeys` | `Iterable<Key> | "all" | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `disabledBehavior` | `DisabledBehavior | undefined` | 'all' | Whether `disabledKeys` applies to all interactions, or only selection. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `dragAndDropHooks` | `DragAndDropHooks<NoInfer<T>> | undefined` | — | The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the Tree. |
| `escapeKeyBehavior` | `"none" | "clearSelection" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the grid list or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `expandedKeys` | `Iterable<Key> | undefined` | — | The currently expanded keys in the collection (controlled). |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a user performs an action on an item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
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
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onExpandedChange` | `((keys: Set<Key>) => any) | undefined` | — | Handler that is called when items are expanded or collapsed. |
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
| `renderEmptyState` | `((props: TreeEmptyStateRenderProps) => ReactNode) | undefined` | — | Provides content to display when there are no items in the list. |
| `selectedKeys` | `Iterable<Key> | "all" | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionBehavior` | `SelectionBehavior | undefined` | "toggle" | How multiple selection should behave in the tree. |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: TreeRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Tree

Item

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for this tree item. |
| `children` | `React.ReactNode` | — | The content of the tree item along with any nested children. Supports static nested tree items or use of a Collection to dynamically render nested tree items. |
| `className` | `ClassNameOrFunction<TreeItemRenderProps> | undefined` | 'react-aria-TreeItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hasChildItems` | `boolean | undefined` | — | Whether this item has children, even if not loaded yet. |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the tree row. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on this tree item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `style` | `(React.CSSProperties | ((values: TreeItemRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string` | — | A string representation of the tree item's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this tree item represents. When using dynamic collections, this is set automatically. |

### Tree

ItemContent

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<TreeItemContentRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |

### Tree

LoadMoreItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<TreeLoadMoreItemRenderProps>` | — | The load more spinner to render when loading additional items. |
| `className` | `ClassNameOrFunction<TreeLoadMoreItemRenderProps> | undefined` | 'react-aria-TreeLoadMoreItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `isLoading` | `boolean | undefined` | — | Whether or not the loading spinner should be rendered or not. |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `scrollOffset` | `number | undefined` | 1 | The amount of offset from the bottom of your scrollable region that should trigger load more. Uses a percentage value relative to the scroll body's client height. Load more is then triggered when your current scroll position's distance from the bottom of the currently loaded list of items is less than or equal to the provided value. (e.g. 1 = 100% of the scroll region's height). |
| `style` | `(React.CSSProperties | ((values: TreeLoadMoreItemRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |

## Related 

Types

### use

DragAndDrop

`useDragAndDrop(options: DragAndDropOptions<T>): DragAndDrop<T>`

Provides the hooks required to enable drag and drop behavior for a drag and drop compatible collection component.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `getItems` | `((keys: Set<Key>, items: T[]) => DragItem[]) | undefined` | () => \[] | A function that returns the items being dragged. If not specified, we assume that the collection is not draggable. |
| `renderDragPreview` | `((items: DragItem[]) => JSX.Element | { element: JSX.Element; x: number; y: number; }) | undefined` | — | A function that renders a drag preview, which is shown under the user's cursor while dragging. By default, a copy of the dragged element is rendered. |
| `renderDropIndicator` | `((target: DropTarget) => JSX.Element) | undefined` | — | A function that renders a drop indicator element between two items in a collection. This should render a `<DropIndicator>` element. If this function is not provided, a default DropIndicator is provided. |
| `dropTargetDelegate` | `DropTargetDelegate | undefined` | — | A custom delegate object that provides drop targets for pointer coordinates within the collection. |
| `isDisabled` | `boolean | undefined` | — | Whether the drag and drop events should be disabled. |
| `onDragStart` | `((e: DraggableCollectionStartEvent) => void) | undefined` | — | Handler that is called when a drag operation is started. |
| `onDragMove` | `((e: DraggableCollectionMoveEvent) => void) | undefined` | — | Handler that is called when the drag is moved. |
| `onDragEnd` | `((e: DraggableCollectionEndEvent) => void) | undefined` | — | Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. |
| `getAllowedDropOperations` | `(() => DropOperation[]) | undefined` | — | Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. |
| `acceptedDragTypes` | `"all" | (string | symbol)[] | undefined` | 'all' | The drag types that the droppable collection accepts. If the collection accepts directories, include `DIRECTORY_DRAG_TYPE` in your array of allowed types. |
| `onInsert` | `((e: DroppableCollectionInsertDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped "between" items. |
| `onRootDrop` | `((e: DroppableCollectionRootDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped on the droppable collection's root. |
| `onItemDrop` | `((e: DroppableCollectionOnItemDropEvent) => void) | undefined` | — | Handler that is called when items are dropped "on" an item. |
| `onReorder` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are reordered within the collection. This handler only allows dropping between items, not on items. It does not allow moving items to a different parent item within a tree. |
| `onMove` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are moved within the source collection. This handler allows dropping both on or between items, and items may be moved to a different parent item within a tree. |
| `shouldAcceptItemDrop` | `((target: ItemDropTarget, types: DragTypes) => boolean) | undefined` | — | A function returning whether a given target in the droppable collection is a valid "on" drop target for the current drag types. |
| `onDropEnter` | `((e: DroppableCollectionEnterEvent) => void) | undefined` | — | Handler that is called when a valid drag enters a drop target. |
| `onDropActivate` | `((e: DroppableCollectionActivateEvent) => void) | undefined` | — | Handler that is called after a valid drag is held over a drop target for a period of time. |
| `onDropExit` | `((e: DroppableCollectionExitEvent) => void) | undefined` | — | Handler that is called when a valid drag exits a drop target. |
| `onDrop` | `((e: DroppableCollectionDropEvent) => void) | undefined` | — | Handler that is called when a valid drag is dropped on a drop target. When defined, this overrides other drop handlers such as `onInsert`, and `onItemDrop`. |
| `getDropOperation` | `((target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation) | undefined` | — | A function returning the drop operation to be performed when items matching the given types are dropped on the drop target. |
