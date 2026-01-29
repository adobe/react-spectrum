# Drag and 

Drop

React Aria collection components support drag and drop with mouse and touch interactions, and full keyboard and screen reader accessibility. Learn how to provide drag data and handle drop events to move, insert, or reorder items.

## Introduction

Drag and drop allows a user to move data between two locations. The initial location is referred to as a **drag source**, and the final location is referred to as a **drop target**. The dragged data consists of one or more **drag items**, each of which contains data such as text, files, or application-specific objects. These are shown in a **drag preview** under the user's cursor.

Drag and drop is implemented using the `useDragAndDrop` hook. The result of this function is passed into components that support drag and drop, such as [ListBox](ListBox.md), [GridList](GridList.md), [Tree](Tree.md), and [Table](Table.md).

## Drag source

A drag source provides one or more **drag items**. Each item includes one or more data formats, e.g. JSON, HTML, or plain text. Drag types can be standard [mime types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) or application-specific strings. Providing multiple data formats allows the user to drop in external applications such as email clients or text editors.

This example provides items as plain text, HTML, and a custom app-specific data format. Dropping within this page will use the custom data format. If you drop in an external application supporting rich text, the HTML representation will be used. Dropping in a text editor will use the plain text format.

## List

Box example

```tsx
import {useDragAndDrop} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon} from './PokemonCOMPONENT';
import {DroppableCOMPONENT} from './DroppableCOMPONENT';

function DraggableCOMPONENT() {
  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, values) {
      return values.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    }
  });

  return <PokemonCOMPONENT dragAndDropHooks={dragAndDropHooks} />;
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

## Drag preview

While dragging, a **drag preview** is displayed under the user's mouse or finger to represent the items being dragged. By default, this is a copy of the dragged element. A custom preview can be rendered by the `renderDragPreview` function, which receives the dragged data, and returns a JSX element.

This example renders a custom drag preview which shows the number of items being dragged.

## List

Box example

```tsx
import {useDragAndDrop} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon} from './PokemonCOMPONENT';

function DraggableCOMPONENT() {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys, items: Pokemon[]) {
      return items.map(item => ({
        'text/plain': item.name
      }));
    },
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    }
  });

  return <PokemonCOMPONENT dragAndDropHooks={dragAndDropHooks} />;
}
```

```css
/* TODO: move into starter */
.drag-preview {
  width: 150px;
  padding: var(--spacing-2);
  padding-inline-start: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-1);
  background: var(--highlight-background);
  color: var(--highlight-foreground);
  border-radius: var(--radius);

  .badge {
    background: var(--highlight-foreground);
    color: var(--highlight-background);
    padding: 0 var(--spacing-2);
    border-radius: var(--radius-sm);
  }
}
```

## Drop items

Users can drop one or more **drop items**, each of which contains data to be transferred from the drag source to drop target. There are three kinds of drag items:

* `text` – represents data inline as a string in one or more formats
* `file` – references a file on the user's device
* `directory` – references the contents of a directory

### Text

A `TextDropItem` represents textual data in one or more different formats. These may be either standard [mime types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) or custom app-specific formats.

This example uses the `acceptedDragTypes` prop to accept items that include an app-specific type, which is retrieved using the item's `getText` method. When `acceptedDragTypes` is specified, the dropped items are filtered to include only items that include the accepted types.

## List

Box example

```tsx
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {useState} from 'react';
import {PokemonCOMPONENT, Pokemon} from './PokemonCOMPONENT';
import {DraggableCOMPONENT} from './DraggableCOMPONENT';

function DroppableCOMPONENT() {
  let [items, setItems] = useState<Pokemon[]>([]);

  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    acceptedDragTypes: ['pokemon'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      setItems(items);
    }
  });

  return <PokemonCOMPONENT items={items} dragAndDropHooks={dragAndDropHooks} />;
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### Files

A `FileDropItem` references a file on the user's device. It includes the name and mime type of the file, and methods to read the contents as plain text, or retrieve a [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object for uploading. This example accepts JPEG and PNG image files, and renders them by creating a local [object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {useDragAndDrop, isFileDropItem, Text} from 'react-aria-components';
import {useState} from 'react';

interface ImageItem {
  id: number,
  url: string,
  name: string
}

function DroppableGridList() {
  let [items, setItems] = useState<ImageItem[]>([]);

  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['image/jpeg', 'image/png'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items.filter(isFileDropItem).map(async item => ({
          id: Math.random(),
          url: URL.createObjectURL(await item.getFile()),
          name: item.name
        }))
      );
      setItems(items);
    }
  });

  return (
    <GridList
      aria-label="Droppable list"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => "Drop images here"}
      style={{height: 250}}
      data-size="small">
      {item => (
        <GridListItem textValue={item.name}>
          <img src={item.url} />
          <Text>{item.name}</Text>
        </GridListItem>
      )}
    </GridList>
  );
}
```

### Directories

A `DirectoryDropItem` references the contents of a directory on the user's device. It includes the name of the directory, as well as a method to iterate through the files and folders within the directory. Include the special `DIRECTORY_DRAG_TYPE` type in `acceptedDragTypes` to limit drops to directories.

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {useDragAndDrop, DIRECTORY_DRAG_TYPE, type DirectoryDropItem, isDirectoryDropItem, Collection} from 'react-aria-components';
import {useState} from 'react';
import File from '@react-spectrum/s2/icons/File';
import Folder from '@react-spectrum/s2/icons/Folder';

interface DirItem {
  id: number,
  name: string,
  kind: string,
  children: DirItem[]
}

function DroppableTree() {
  let [files, setFiles] = useState<DirItem[]>([]);

  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
    async onRootDrop(e) {
      // Read entries in directory and update state with relevant info.
      let getFiles = async (dir: DirectoryDropItem): Promise<DirItem[]> => {
        let files: DirItem[] = [];
        for await (let entry of dir.getEntries()) {
          files.push({
            id: Math.random(),
            name: entry.name,
            kind: entry.kind,
            children: entry.kind === 'directory' ? await getFiles(entry) : []
          });
        }
        return files;
      };

      let dir = e.items.find(isDirectoryDropItem)!;
      setFiles(await getFiles(dir));
    }
  });

  return (
    <Tree
      aria-label="Droppable tree"
      items={files}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop directory here'}
      style={{height: 250}}>
      {function renderItem(item) {
        return (
          <TreeItem
            title={
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{flex: '0 0 auto'}}>{item.kind === 'directory' ? <Folder /> : <File />}</span>
                <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'hidden'}}>{item.name}</span>
              </div>
            }>
            <Collection items={item.children}>
              {renderItem}
            </Collection>
          </TreeItem>
        );
      }}
    </Tree>
  );
}
```

## Drop positions

Collection components such as [ListBox](ListBox.md), [Table](Table.md), [Tree](Tree.md), and [GridList](GridList.md) support multiple **drop positions**.

* The `"root"` drop position allows dropping on the collection as a whole.
* The `"on"` drop position allows dropping on individual collection items, such as a folder within a list.
* The `"before"` and `"after"` drop positions allow the user to insert or move items between other items. This is displayed by rendering a **drop indicator** between items.

<Figure>
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 50, marginBottom: 4, background: 'var(--anatomy-gray-100)', padding: 32, width: 'calc(100% - 64px)', borderRadius: 'var(--anatomy-radius)'}}>
    <RootDropPosition
      role="img"
      aria-label="Root drop position"
    />

    <OnDropPosition
      role="img"
      aria-label="On drop position"
    />

    <BetweenDropPosition
      role="img"
      aria-label="Between drop position"
    />
  </div>

  <Caption style={{fontStyle: 'italic'}}>The "root", "on", and "between" drop positions.</Caption>
</Figure>

### Dropping on the collection

Use the `onRootDrop` event to enable dropping on the entire collection. When a valid drag hovers over the collection, it receives the `data-drop-target` state.

## List

Box example

```tsx
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {useState} from 'react';
import {PokemonCOMPONENT, Pokemon} from './PokemonCOMPONENT';
import {DraggableCOMPONENT} from './DraggableCOMPONENT';

function DroppableCOMPONENT() {
  let [items, setItems] = useState<Pokemon[]>([]);

  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    acceptedDragTypes: ['pokemon'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      setItems(items);
    }
  });

  return <PokemonCOMPONENT items={items} dragAndDropHooks={dragAndDropHooks} />;
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### Dropping on items

Use the `onItemDrop` event to enable dropping on items. When a valid drag hovers over an item, it receives the `data-drop-target` state.

## List

Box example

```tsx
import {useDragAndDrop} from 'react-aria-components';
import {PokemonCOMPONENT} from './PokemonCOMPONENT';
import {DraggableCOMPONENT} from './DraggableCOMPONENT';

function DroppableCOMPONENT() {
  let {dragAndDropHooks} = useDragAndDrop({
    onItemDrop(e) {
      alert(`Dropped on ${e.target.key}`);
    }
  });

  return (
    <PokemonCOMPONENT
      dragAndDropHooks={dragAndDropHooks}
      items={[
        {id: 1, name: 'Beedrill', type: 'Bug, Poison', level: 25},
        {id: 2, name: 'Pidgeot', type: 'Flying', level: 40},
        {id: 3, name: 'Fearow', type: 'Flying', level: 32},
        {id: 4, name: 'Jigglypuff', type: 'Fairy', level: 56}
      ]} />
  );
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### Dropping between items

Use the `onInsert` event to enable dropping between items. React Aria renders a `DropIndicator` between items to indicate the insertion position, which can be customized using `renderDropIndicator`.

## List

Box example

```tsx
import {useDragAndDrop, isTextDropItem, DropIndicator, useListData} from 'react-aria-components';
import {PokemonCOMPONENT} from './PokemonCOMPONENT';
import {DraggableCOMPONENT} from './DraggableCOMPONENT';

function DroppableCOMPONENT() {
  let list = useListData({
    initialItems: [
      {id: 1, name: 'Beedrill', type: 'Bug, Poison', level: 25},
      {id: 2, name: 'Pidgeot', type: 'Flying', level: 40},
      {id: 3, name: 'Fearow', type: 'Flying', level: 32},
      {id: 4, name: 'Jigglypuff', type: 'Fairy', level: 56}
    ]
  });

  let {dragAndDropHooks} = useDragAndDrop({
    async onInsert(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => {
            let pokemon = JSON.parse(await item.getText('pokemon'));
            let processItem = item => ({
              ...item,
              id: Math.random(),
              children: item.children?.map(processItem)
            });
            return processItem(pokemon);
          })
      );

      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...items);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...items);
      }
    },
    renderDropIndicator(target) {
      return <DropIndicator target={target} />;
    }
  });

  return <PokemonCOMPONENT items={list.items} dragAndDropHooks={dragAndDropHooks} />;
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### Reordering items

Use the `onReorder` event to enable reordering items. For components with hierarchy like [Tree](Tree.md), this only allows reordering within the same level. Use `onMove` to allow moving items between levels.

## List

Box example

```tsx
import {useDragAndDrop, useListData} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon, defaultItems} from './PokemonCOMPONENT';

function ReorderableCOMPONENT() {
  let list = useListData({
    initialItems: defaultItems
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys, items: Pokemon[]) {
      return items.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return <PokemonCOMPONENT items={list.items} dragAndDropHooks={dragAndDropHooks} />
}
```

### Moving items

Use the `onMove` event to enable moving items within a collection. This allows reordering items within a level and moving items between levels. It supports dropping both on and between items.

## List

Box example

```tsx
import {useDragAndDrop, useTreeData} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon, defaultItems} from './PokemonCOMPONENT';

function ReorderableCOMPONENT() {
  let tree = useTreeData({
    initialItems: defaultItems
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys, items: Pokemon[]) {
      return items.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    },
    onMove(e) {
      if (e.target.dropPosition === 'before') {
        tree.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        tree.moveAfter(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'on') {
        // Move items to become children of the target
        let targetNode = tree.getItem(e.target.key);
        if (targetNode) {
          let targetIndex = targetNode.children
            ? targetNode.children.length
            : 0;
          let keyArray = Array.from(e.keys);
          for (let i = 0; i < keyArray.length; i++) {
            tree.move(keyArray[i], e.target.key, targetIndex + i);
          }
        }
      }
    }
  });

  // Map tree items to Pokemon objects
  let processItem = item => {
    return {...item.value, children: item.children.map(processItem)}
  };

  let items = tree.items.map(processItem);
  return <PokemonCOMPONENT items={items} dragAndDropHooks={dragAndDropHooks} />
}
```

### Multiple positions

This example puts together many of the examples described above, allowing users to drag items between lists bidirectionally. It also supports reordering items within the same list. When a list is empty, it accepts drops on the whole collection.

## List

Box example

```tsx
import {useDragAndDrop, isTextDropItem, useListData} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon, defaultItems} from './PokemonCOMPONENT';

interface DndCOMPONENTProps {
  initialItems: Pokemon[],
  'aria-label': string
}

function DndCOMPONENT(props: DndCOMPONENTProps) {
  let list = useListData({
    initialItems: props.initialItems
  });

  let {dragAndDropHooks} = useDragAndDrop({
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    },
    // Provide drag data in a custom format as well as plain text.
    getItems(keys, items: Pokemon[]) {
      return items.map(item => ({
        'pokemon': JSON.stringify(item),
        'text/plain': item.name
      }));
    },

    // Accept drops with the custom format.
    acceptedDragTypes: ['pokemon'],

    // Ensure items are always moved rather than copied.
    getDropOperation: () => 'move',

    // Handle drops between items from other lists.
    async onInsert(e) {
      let processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      if (e.target.dropPosition === 'before') {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === 'after') {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },

    // Handle drops on the collection when empty.
    async onRootDrop(e) {
      let processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      list.append(...processedItems);
    },

    // Handle reordering items within the same list.
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },

    // Remove the items from the source list on drop
    // if they were moved to a different list.
    onDragEnd(e) {
      if (e.dropOperation === 'move' && !e.isInternal) {
        list.remove(...e.keys);
      }
    }
  });

  return <PokemonCOMPONENT items={list.items} dragAndDropHooks={dragAndDropHooks} />
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DndCOMPONENT
    initialItems={defaultItems}
    aria-label="Drag and drop COMPONENT" />
  <DndCOMPONENT
    initialItems={[]}
    aria-label="Drag and drop COMPONENT" />
</div>
```

## Drop operations

A `DropOperation` is an indication of what will happen when dragged data is dropped on a particular drop target. These are:

* `move` – the dragged data will be moved from its source location to the target location.
* `copy` – the dragged data will be copied to the target destination.
* `link` – a relationship will be established between the source and target locations.
* `cancel` – the drag and drop operation will be canceled, resulting in no changes made to the source or target.

Many operating systems display these in the form of a cursor change, e.g. a plus sign to indicate a copy operation. The user may also be able to use a modifier key to choose which drop operation to perform, such as <Keyboard>Option</Keyboard> or <Keyboard>Alt</Keyboard> to switch from move to copy.

<Figure>
  <DropOperation
    role="img"
    aria-labelledby="drop-operation-caption"
  />

  <Caption id="drop-operation-caption" style={{fontStyle: 'italic'}}>Visual feedback for a copy drop operation.</Caption>
</Figure>

### get

DropOperation

Use `getDropOperation` option to provide feedback to the user when a drag hovers over the drop target. This function receives the drop target, set of types contained in the drag, and a list of allowed drop operations. It should return the operation that will be performed on drop, or `'cancel'` to reject the drop. If the returned operation is not in `allowedOperations`, the drop will be canceled.

## List

Box example

```tsx
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {useState} from 'react';
import {PokemonCOMPONENT, Pokemon} from './PokemonCOMPONENT';
import {DraggableCOMPONENT} from './DraggableCOMPONENT';

function DroppableCOMPONENT() {
  let [items, setItems] = useState<Pokemon[]>([]);

  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    acceptedDragTypes: ['pokemon'],
    getDropOperation: (target, types, allowedOperations) => 'copy',
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      setItems(items);
    }
  });

  return <PokemonCOMPONENT items={items} dragAndDropHooks={dragAndDropHooks} />;
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### get

AllowedDropOperations

The drag source can also control which drop operations are allowed. In the example below, the cursor shows the copy cursor by default, and pressing a modifier key cancels the drop.

## List

Box example

```tsx
import {useDragAndDrop, useListData} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon, defaultItems} from './PokemonCOMPONENT';
import {DroppableCOMPONENT} from './DroppableCOMPONENT';

function DraggableCOMPONENT() {
  let list = useListData({
    initialItems: defaultItems
  });

  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, items: Pokemon[]) {
      return items.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    },
    getAllowedDropOperations: () => ['copy']
  });

  return <PokemonCOMPONENT items={list.items} dragAndDropHooks={dragAndDropHooks} />
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### on

DragEnd

The `onDragEnd` event allows the drag source to respond when a drag that it initiated ends, either because it was dropped or because it was canceled by the user. The `dropOperation` property of the event object indicates the operation that was performed. For example, when data is moved, the UI could be updated to reflect this change by removing the original dragged items.

This example removes the dragged items from the UI when a move operation is completed. Try holding the <Keyboard>Option</Keyboard> or <Keyboard>Alt</Keyboard> keys to change the operation to copy, and see how the behavior changes.

## List

Box example

```tsx
import {useDragAndDrop, useListData} from 'react-aria-components';
import {PokemonCOMPONENT, Pokemon, defaultItems} from './PokemonCOMPONENT';
import {DroppableCOMPONENT} from './DroppableCOMPONENT';

function DraggableCOMPONENT() {
  let list = useListData({
    initialItems: defaultItems
  });

  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, items: Pokemon[]) {
      return items.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    },
    onDragEnd(e) {
      if (e.dropOperation === 'move') {
        list.remove(...e.keys);
      }
    }
  });

  return <PokemonCOMPONENT items={list.items} dragAndDropHooks={dragAndDropHooks} />
}

<div style={{display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', justifyContent: 'center'}}>
  <DraggableCOMPONENT />
  <DroppableCOMPONENT />
</div>
```

### Drop events

Drop events such as `onInsert`, `onItemDrop`, etc. also include the `dropOperation`. This can be used to perform different actions accordingly, for example, when communicating with a backend API.

```tsx
let onItemDrop = async (e) => {
  let data = JSON.parse(await e.items[0].getText('my-app-file'));
  switch (e.dropOperation) {
    case 'move':
      MyAppFileService.move(data.filePath, props.filePath);
      break;
    case 'copy':
      MyAppFileService.copy(data.filePath, props.filePath);
      break;
    case 'link':
      MyAppFileService.link(data.filePath, props.filePath);
      break;
  }
};
```

## Accessibility

While drag and drop has historically been mostly limited to mouse and touchscreen users, keyboard and screen reader friendly alternatives are important for users who cannot use these interaction methods. React Aria implements keyboard and screen reader interactions for drag and drop that provide full parity with the mouse and touch experiences.

Users can press <Keyboard>Enter</Keyboard> on a draggable element to enter drag and drop mode. Then, they can press <Keyboard>Tab</Keyboard> to cycle between the drop targets that accept the dragged data, and <Keyboard>Enter</Keyboard> to drop. <Keyboard>Escape</Keyboard> cancels a drag. Touch screen reader users can also drag by double tapping to activate drag and drop mode, swiping between drop targets, and double tapping again to drop. Screen reader announcements are included to help guide the user through this process.

Collection components such as [GridList](GridList.md) and [Table](Table.md) are treated as a single drop target, so that users can easily tab past them to get to the next drop target. Within a droppable collection, keys such as <Keyboard>ArrowDown</Keyboard> and <Keyboard>ArrowUp</Keyboard> can be used to select a **drop position**, such as on an item, or between items.

Draggable elements can sometimes have conflicting keyboard interactions, such as selection. These are handled by adding an explicit **drag affordance**. Keyboard and screen reader users can focus this element, and use it to initiate drag and drop for the parent item. In addition, this has the added benefit of making drag and drop more discoverable.

<Figure>
  <DragAffordance
    role="img"
    aria-labelledby="drag-affordance-caption"
  />

  <Caption id="drag-affordance-caption" style={{fontStyle: 'italic'}}>A focusable drag affordance to initiate keyboard and screen reader drag and drop.</Caption>
</Figure>

Note that because mouse and touch drag and drop interactions utilize the native browser APIs, they work both within the browser window and with external applications on the user's device. Keyboard and screen reader drag and drop is implemented from scratch, and therefore can only be supported within the browser window. Alternative interactions for operations involving external applications, such as file uploading or copy and paste, should be implemented in addition to drag and drop.

## Examples

<ExampleList
  tag="drag and drop"
  pages={props.pages}
/>

## A

PI

### use

DragAndDrop

### Drop

Indicator

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<DropIndicatorRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DropIndicatorRenderProps> | undefined` | 'react-aria-DropIndicator' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `style` | `(React.CSSProperties | ((values: DropIndicatorRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `DropTarget` | — | The drop target that the drop indicator represents. |

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

### Text

DropItem

### Properties

| Name | Type | Description |
|------|------|-------------|
| `kind` \* | `"text"` | The item kind. |
| `types` \* | `Set<string>` | The drag types available for this item. These are often mime types, but may be custom app-specific types. |

### Methods

#### `get

Text(type: string): Promise<string>`

Returns the data for the given type as a string.

### File

DropItem

### Properties

| Name | Type | Description |
|------|------|-------------|
| `kind` \* | `"file"` | The item kind. |
| `type` \* | `string` | The file type (usually a mime type). |
| `name` \* | `string` | The file name. |

### Methods

#### `get

File(): Promise<File>`

Returns the contents of the file as a blob.

#### `get

Text(): Promise<string>`

Returns the contents of the file as a string.

### Directory

DropItem

### Properties

| Name | Type | Description |
|------|------|-------------|
| `kind` \* | `"directory"` | The item kind. |
| `name` \* | `string` | The directory name. |

### Methods

#### `get

Entries(): AsyncIterable<FileDropItem | DirectoryDropItem>`

Returns the entries contained within the directory.

### Drop

Indicator

`DropIndicator(props: P): React.ReactNode`

A DropIndicator is rendered between items in a collection to indicate where dropped data will be inserted.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<DropIndicatorRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<DropIndicatorRenderProps> | undefined` | 'react-aria-DropIndicator' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `style` | `(React.CSSProperties | ((values: DropIndicatorRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `DropTarget` | — | The drop target that the drop indicator represents. |

### Drop

Operation
