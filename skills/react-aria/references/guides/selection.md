# Selection

Many collection components support selecting items by clicking or tapping them, or by using the keyboard. Learn how to handle selection events, how to control selection programmatically, and the data structures used to represent a selection.

## Multiple selection

Most collection components support item selection, which is handled by the `onSelectionChange` event. Use the `selectedKeys` prop to control the selected items programmatically, or `defaultSelectedKeys` for uncontrolled behavior.

Selection is represented by a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) containing the `id` of each selected item. You can also pass any iterable collection (e.g. an array) to the `selectedKeys` and `defaultSelectedKeys` props, but the `onSelectionChange` event will always pass back a Set.

## List

Box example

```tsx
import {type Selection} from 'react-aria-components';
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';
import {useState} from 'react';

function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['cheese']));

  return (
    <div>
      <ListBox
        aria-label="Sandwich contents"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <ListBoxItem id="lettuce">Lettuce</ListBoxItem>
        <ListBoxItem id="tomato">Tomato</ListBoxItem>
        <ListBoxItem id="cheese">Cheese</ListBoxItem>
        <ListBoxItem id="tuna">Tuna Salad</ListBoxItem>
        <ListBoxItem id="egg">Egg Salad</ListBoxItem>
        <ListBoxItem id="ham">Ham</ListBoxItem>
      </ListBox>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text, type Selection} from 'react-aria-components';
import {useState} from 'react';

export default function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['Blastoise']));

  return (
    <>
      <GridList
        aria-label="Sandwich contents"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        data-size="small">
        <PokemonItem name="Charizard" />
        <PokemonItem name="Blastoise" />
        <PokemonItem name="Venusaur" />
        <PokemonItem name="Pikachu" />
      </GridList>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </>
  );
}

function PokemonItem(props: {name: string}) {
  return (
    <GridListItem id={props.name} textValue={props.name}>
      <img src={`https://img.pokemondb.net/sprites/home/normal/2x/avif/${props.name.toLowerCase()}.avif`} alt="" />
      <Text>{props.name}</Text>
    </GridListItem>
  );
}
```

## Tree example

```tsx
import {type Selection} from 'react-aria-components';
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {useState} from 'react';

function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['project']));

  return (
    <div>
      <Tree
        aria-label="Files"
        defaultExpandedKeys={['documents', 'photos', 'project']}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <TreeItem id="documents" title="Documents">
          <TreeItem id="project" title="Project">
            <TreeItem title="Weekly Report" />
          </TreeItem>
        </TreeItem>
        <TreeItem id="photos" title="Photos">
          <TreeItem title="Image 1" />
          <TreeItem title="Image 2" />
        </TreeItem>
      </Tree>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

## Tag

Group example

```tsx
import {type Selection} from 'react-aria-components';
import {TagGroup, Tag} from 'vanilla-starter/TagGroup';
import {useState} from 'react';

function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['cheese']));

  return (
    <div>
      <TagGroup
        label="Sandwich contents"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <Tag id="lettuce">Lettuce</Tag>
        <Tag id="tomato">Tomato</Tag>
        <Tag id="cheese">Cheese</Tag>
        <Tag id="tuna">Tuna Salad</Tag>
        <Tag id="egg">Egg Salad</Tag>
        <Tag id="ham">Ham</Tag>
      </TagGroup>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

## Table example

```tsx
import {type Selection} from 'react-aria-components';
import {Table, TableHeader, TableBody, Column, Row, Cell} from 'vanilla-starter/Table';
import {useState} from 'react';

const rows = [
  {id: 'lettuce', name: 'Lettuce', type: 'Vegetable', calories: 4},
  {id: 'tomato', name: 'Tomato', type: 'Vegetable', calories: 5},
  {id: 'cheese', name: 'Cheddar', type: 'Cheese', calories: 113},
  {id: 'tuna', name: 'Tuna salad', type: 'Salad', calories: 187},
  {id: 'egg', name: 'Egg salad', type: 'Salad', calories: 200},
  {id: 'ham', name: 'Ham', type: 'Meat', calories: 205}
];

function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['cheese']));

  return (
    <div>
      <Table
        aria-label="Sandwich contents"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Calories</Column>
        </TableHeader>
        <TableBody items={rows}>
          {item => (
            <Row>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
              <Cell>{item.calories}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

### Select all

Some components support a checkbox to select all items in the collection, or a keyboard shortcut like <Keyboard>⌘ Cmd</Keyboard> + <Keyboard>A</Keyboard>. This represents a selection of all items in the collection, regardless of whether or not all items have been loaded from the network. For example, when using a component with infinite scrolling support, the user will be unaware that all items are not yet loaded. For this reason, it makes sense for select all to represent all items, not just the loaded ones.

When a select all event occurs, `onSelectionChange` is called with the string `"all"` rather than a set of selected keys. `selectedKeys`
and `defaultSelectedKeys` can also be set to `"all"` to programmatically select all items. The application must adjust its handling of bulk actions in this case to apply to the entire collection rather than only the keys available to it locally.

```tsx
import {Table, TableHeader, Column, TableBody, Row, Cell, type Selection} from 'react-aria-components';
import {Checkbox} from 'vanilla-starter/Checkbox';
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

const rows = [
  {name: 'Games', date: '6/7/2020', type: 'File folder'},
  {name: 'Program Files', date: '4/7/2021', type: 'File folder'},
  {name: 'bootmgr', date: '11/20/2010', type: 'System file'},
  {name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
];

function Example() {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  function performBulkAction() {
    if (selectedKeys === 'all') {
      alert('Performing action on all items');
    } else {
      alert(`Performing action on selected items: ${[...selectedKeys].join(', ')}`);
    }
  }

  return (
    <div>
      <Table
        aria-label="Files"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}>
        <TableHeader>
          <Column><Checkbox slot="selection" /></Column>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Date Modified</Column>
        </TableHeader>
        <TableBody items={rows}>
          {item => (
            <Row id={item.name}>
              <Cell><Checkbox slot="selection" /></Cell>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
              <Cell>{item.date}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
      {(selectedKeys === 'all' || selectedKeys.size > 0) && (
        <div style={{marginTop: '16px', padding: '8px'}}>
          <Button onPress={performBulkAction}>Delete Selected</Button>
        </div>
      )}
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

### Selection behavior

By default, React Aria uses the `"toggle"` selection behavior, which behaves like a checkbox group: clicking, tapping, or pressing the <Keyboard>Space</Keyboard> or <Keyboard>Enter</Keyboard> keys toggles selection for the focused row. Using the arrow keys moves focus but does not change selection. The `"toggle"` selection mode is often paired with a column of checkboxes in each row as an explicit affordance for selection.

When the `selectionBehavior` prop is set to `"replace"`, clicking a row with the mouse *replaces* the selection with only that row. Using the arrow keys moves both focus and selection. To select multiple rows, modifier keys such as <Keyboard>Ctrl</Keyboard>, <Keyboard>Cmd</Keyboard>, and <Keyboard>Shift</Keyboard> can be used. On touch screen devices, selection always behaves as toggle since modifier keys may not be available. This behavior emulates native platforms such as macOS and Windows, and is often used when checkboxes in each row are not desired.

To move focus without moving selection, the <Keyboard>Ctrl</Keyboard> key on Windows or the <Keyboard>Option</Keyboard> key on macOS can be held while pressing the arrow keys. Holding this modifier while pressing the <Keyboard>Space</Keyboard> key toggles selection for the focused row, which allows multiple selection of non-contiguous items.

These selection styles implement the behaviors defined in [Aria Practices](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction).

## List

Box example

```tsx
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';
import {useState} from 'react';

function Example(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());

  return (
    <ListBox
      {...props}
      aria-label="ListBox"
      selectionMode="multiple"
      /*- begin highlight -*/
      
      /*- end highlight -*/
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}>
      <ListBoxItem id="one">One</ListBoxItem>
      <ListBoxItem id="two">Two</ListBoxItem>
      <ListBoxItem id="three">Three</ListBoxItem>
    </ListBox>
  );
}
```

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';
import {useState} from 'react';

function Example(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());

  return (
    <GridList
      {...props}
      aria-label="GridList"
      selectionMode="multiple"
      /*- begin highlight -*/
      
      /*- end highlight -*/
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      data-size="small">
      <GridListItem textValue="Desert Sunset">
        <img src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
        <Text>Desert Sunset</Text>
        <Text slot="description">PNG • 2/3/2024</Text>
      </GridListItem>
      <GridListItem textValue="Hiking Trail">
        <img src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
        <Text>Hiking Trail</Text>
        <Text slot="description">JPEG • 1/10/2022</Text>
      </GridListItem>
      <GridListItem textValue="Lion">
        <img src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={899} alt="" />
        <Text>Lion</Text>
        <Text slot="description">JPEG • 8/28/2021</Text>
      </GridListItem>
    </GridList>
  );
}
```

## Tree example

```tsx
import {type Selection} from 'react-aria-components';
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {useState} from 'react';

function Example(props) {
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div>
      <Tree
        {...props}
        aria-label="Files"
        defaultExpandedKeys={['documents', 'photos', 'project']}
        selectionMode="multiple"
        /*- begin highlight -*/
        
        /*- end highlight -*/
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}>
        <TreeItem id="documents" title="Documents">
          <TreeItem id="project" title="Project">
            <TreeItem title="Weekly Report" />
          </TreeItem>
        </TreeItem>
        <TreeItem id="photos" title="Photos">
          <TreeItem title="Image 1" />
          <TreeItem title="Image 2" />
        </TreeItem>
      </Tree>
      <p>selectedKeys: {selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ')}</p>
    </div>
  );
}
```

## Tag

Group example

```tsx
import {TagGroup, Tag} from 'vanilla-starter/TagGroup';
import {useState} from 'react';

function Example(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());

  return (
    <TagGroup
      {...props}
      label="TagGroup"
      selectionMode="multiple"
      /*- begin highlight -*/
      
      /*- end highlight -*/
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}>
      <Tag id="one">One</Tag>
      <Tag id="two">Two</Tag>
      <Tag id="three">Three</Tag>
    </TagGroup>
  );
}
```

## Table example

```tsx
import {Table, TableHeader, Column, Row} from 'vanilla-starter/Table';
import {TableBody, Cell} from 'react-aria-components';
import {useState} from 'react';

function Example(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());

  return (
    <Table
      {...props}
      aria-label="Table"
      selectionMode="multiple"
      /*- begin highlight -*/
      
      /*- end highlight -*/
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Date Modified</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>Games</Cell>
          <Cell>File folder</Cell>
          <Cell>6/7/2020</Cell>
        </Row>
        <Row>
          <Cell>Program Files</Cell>
          <Cell>File folder</Cell>
          <Cell>4/7/2021</Cell>
        </Row>
        <Row>
          <Cell>bootmgr</Cell>
          <Cell>System file</Cell>
          <Cell>11/20/2010</Cell>
        </Row>
        <Row>
          <Cell>log.txt</Cell>
          <Cell>Text Document</Cell>
          <Cell>1/18/2016</Cell>
        </Row>
      </TableBody>
    </Table>
  );
}
```

## Single selection

In some components like [ComboBox](ComboBox.md), only single selection is supported. In this case, the singular `selectedKey` and `defaultSelectedKey` props are available instead of their plural variants. These accept a single id instead of a `Set` as their value.

```tsx
import type {Key} from 'react-aria-components';
import {ComboBox, ComboBoxItem} from 'vanilla-starter/ComboBox';
import {useState} from 'react';

function Example() {
  let [selectedKey, setSelectedKey] = useState<Key | null>(null);

  return (
    <div>
      <ComboBox
        label="ComboBox"
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}>
        <ComboBoxItem id="one">One</ComboBoxItem>
        <ComboBoxItem id="two">Two</ComboBoxItem>
        <ComboBoxItem id="three">Three</ComboBoxItem>
      </ComboBox>
      <p>selectedKey: {String(selectedKey)}</p>
    </div>
  );
}
```

In components which support multiple selection, you can limit the selection to a single item using the
`selectionMode` prop. This continues to accept `selectedKeys` and `defaultSelectedKeys` as a `Set`, but it will
only contain a single id at a time.

### Animated 

SelectionIndicator

Render a `<SelectionIndicator />` within each collection item to animate selection changes. All CSS properties listed by `transition-property` are animated. Include the `translate` property to smoothly animate the position. Use the entering and exiting states to add a transition when no items are selected.

```tsx
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';
import {SelectionIndicator} from 'react-aria-components';
import './SelectionIndicator.css';

function SelectableItem({id, children}) {
  return (
    <ListBoxItem id={id} className="animated-ListBoxItem">
      {/*- begin highlight -*/}
      <SelectionIndicator />
      {/*- end highlight -*/}
      {children}
    </ListBoxItem>
  );
}

<ListBox
  aria-label="Animated ListBox"
  selectionMode="single">
  <SelectableItem id="home">Home</SelectableItem>
  <SelectableItem id="getting-started">Getting Started</SelectableItem>
  <SelectableItem id="components">Components</SelectableItem>
</ListBox>
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `about` | `string | undefined` | — |  |
| `accessKey` | `string | undefined` | — |  |
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "true" | "false") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "list" | "inline" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
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
| `aria-haspopup` | `boolean | "true" | "false" | "dialog" | "grid" | "listbox" | "menu" | "tree" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
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
| `aria-relevant` | `"text" | "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
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
| `autoCapitalize` | `"off" | "none" | "on" | "sentences" | "words" | "characters" | (string & {}) | undefined` | — |  |
| `autoCorrect` | `string | undefined` | — |  |
| `autoFocus` | `boolean | undefined` | — |  |
| `autoSave` | `string | undefined` | — |  |
| `children` | `ChildrenOrFunction<SharedElementRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<SharedElementRenderProps> | undefined` | 'react-aria-SelectionIndicator' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
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
| `isSelected` | `boolean | undefined` | — | Whether the SelectionIndicator is visible. This is usually set automatically by the parent component. |
| `itemID` | `string | undefined` | — |  |
| `itemProp` | `string | undefined` | — |  |
| `itemRef` | `string | undefined` | — |  |
| `itemScope` | `boolean | undefined` | — |  |
| `itemType` | `string | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `nonce` | `string | undefined` | — |  |
| `onAbort` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onChange` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onPaste` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onProgress` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<HTMLDivElement> | undefined` | — |  |
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
| `onVolumeChange` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `part` | `string | undefined` | — |  |
| `popover` | `"" | "auto" | "manual" | undefined` | — |  |
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
| `style` | `(React.CSSProperties | ((values: SharedElementRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `suppressContentEditableWarning` | `boolean | undefined` | — |  |
| `suppressHydrationWarning` | `boolean | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |
| `title` | `string | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `typeof` | `string | undefined` | — |  |
| `unselectable` | `"off" | "on" | undefined` | — |  |
| `vocab` | `string | undefined` | — |  |

## Item actions

In addition to selection, some collection components support item actions via the `onAction` prop. In the default `"toggle"` selection behavior, when nothing is selected, clicking, tapping, or pressing the <Keyboard>Enter</Keyboard> key triggers the item action. Items may be selected using the checkbox, or by pressing the <Keyboard>Space</Keyboard> key. When at least one item is selected, clicking or tapping a row toggles the selection.

In the `"replace"` selection behavior, selection is the primary interaction. Clicking an item with a mouse selects it, and double clicking performs the action. On touch devices, actions remain the primary tap interaction. Long pressing enters selection mode, which temporarily swaps the selection behavior to `"toggle"`. Deselecting all items exits selection mode and reverts the selection behavior back to `"replace"`. Keyboard behaviors are unaffected.

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

<GridList>
  <GridListItem
    /*- begin highlight -*/
    onAction={() => alert('Opening "Mountain Sunrise"')}
    /*- end highlight -*/
    textValue="Mountain Sunrise">
    <img src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Mountain Sunrise</Text>
    <Text slot="description">PNG • 3/15/2015</Text>
  </GridListItem>
  <GridListItem
    onAction={() => alert('Opening "Architecture"')}
    textValue="Architecture">
    <img src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} alt="" />
    <Text>Architecture</Text>
    <Text slot="description">PNG • 12/24/2016</Text>
  </GridListItem>
  <GridListItem
    onAction={() => alert('Opening "Golden Hour"')}
    textValue="Golden Hour">
    <img src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={402} alt="" />
    <Text>Golden Hour</Text>
    <Text slot="description">WEBP • 7/24/2024</Text>
  </GridListItem>
</GridList>
```

## Tree example

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';

<Tree
  aria-label="Files"
  selectionMode="multiple"
  
  defaultExpandedKeys={['computer']}>
  <TreeItem id="computer" title="My Computer">
    <TreeItem
      title="Games"
      /*- begin highlight -*/
      onAction={() => alert('Opening Games')} />
      {/*- end highlight -*/}
    <TreeItem
      title="Documents"
      onAction={() => alert('Opening Documents')} />
    <TreeItem
      title="Photos"
      onAction={() => alert('Opening Photos')} />
  </TreeItem>
</Tree>
```

## Table example

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

<Table
  aria-label="Table"
  selectionMode="multiple"
  >
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody>
    {/*- begin highlight -*/}
    <Row onAction={() => alert('Opening Games')}>
    {/*- end highlight -*/}
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
    </Row>
    <Row onAction={() => alert('Opening Documents')}>
      <Cell>Documents</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
    </Row>
    <Row onAction={() => alert('Opening Photos')}>
      <Cell>Photos</Cell>
      <Cell>File folder</Cell>
      <Cell>11/20/2010</Cell>
    </Row>
  </TableBody>
</Table>
```

In dynamic collections, it may be more convenient to use the `onAction` prop at the collection level instead of on individual items. This receives the id of the pressed item.

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

let images = [
  {
    title: "Rays of sun in the forest",
    user: "Joyce G",
    image: "https://images.unsplash.com/photo-1736185597807-371cae1c7e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    title: "Tall grass",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737301519296-062cd324dbfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    title: "Winding Road",
    user: "Artem Stoliar",
    image: "https://images.unsplash.com/photo-1738249034651-1896f689be58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 300
  }
];

<GridList
  aria-label="Files"
  selectionMode="multiple"
  data-size="small"
  
  items={images}
  /*- begin highlight -*/
  onAction={id => alert(`Opening "${id}"`)}>
  {/*- end highlight -*/}
  {image => (
    <GridListItem id={image.title} textValue={image.title}>
      <img src={image.image} width={image.width} height={image.height} alt="" />
      <Text>{image.title}</Text>
      <Text slot="description">By {image.user}</Text>
    </GridListItem>
  )}
</GridList>
```

## Tree example

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {Collection} from 'react-aria-components';

const files = [
  {id: 'games', name: 'Games'},
  {id: 'documents', name: 'Documents'},
  {id: 'photos', name: 'Photos'}
];

<Tree
  aria-label="Files"
  selectionMode="multiple"
  
  defaultExpandedKeys={['computer']}
  /*- begin highlight -*/
  onAction={id => alert(`Opening ${id}`)}>
  {/*- end highlight -*/}
  <TreeItem id="computer" title="My Computer">
    <Collection items={files}>
      {item => <TreeItem title={item.name} />}
    </Collection>
  </TreeItem>
</Tree>
```

## Table example

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

const files = [
  {id: 'games', name: 'Games', type: 'Folder', date: '6/7/2020'},
  {id: 'documents', name: 'Documents', type: 'Folder', date: '4/7/2021'},
  {id: 'photos', name: 'Photos', type: 'Folder', date: '11/20/2010'}
];

<Table
  aria-label="Table"
  selectionMode="multiple"
  
  /*- begin highlight -*/
  onRowAction={id => alert(`Opening ${id}`)}>
  {/*- end highlight -*/}
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody items={files}>
    {item => (
      <Row>
        <Cell>{item.name}</Cell>
        <Cell>{item.type}</Cell>
        <Cell>{item.date}</Cell>
      </Row>
    )}
  </TableBody>
</Table>
```

## Disabled items

An item can be disabled with the `isDisabled` prop. By default, disabled items are not focusable, selectable, or actionable. When `disabledBehavior="selection"`, only selection is disabled.

## List

Box example

```tsx
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';

<ListBox aria-label="Pokemon" selectionMode="multiple">
  <ListBoxItem>Charizard</ListBoxItem>
  <ListBoxItem>Blastoise</ListBoxItem>
  {/*- begin highlight -*/}
  <ListBoxItem isDisabled>Venusaur</ListBoxItem>
  {/*- end highlight -*/}
  <ListBoxItem>Pikachu</ListBoxItem>
</ListBox>
```

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

<GridList>
  <GridListItem textValue="Desert Sunset">
    <img src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
    <Text>Desert Sunset</Text>
    <Text slot="description">PNG • 2/3/2024</Text>
  </GridListItem>
  {/*- begin highlight -*/}
  <GridListItem isDisabled textValue="Hiking Trail">
  {/*- end highlight -*/}
    <img src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Hiking Trail</Text>
    <Text slot="description">JPEG • 1/10/2022</Text>
  </GridListItem>
  <GridListItem textValue="Lion">
    <img src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={899} alt="" />
    <Text>Lion</Text>
    <Text slot="description">JPEG • 8/28/2021</Text>
  </GridListItem>
  <GridListItem textValue="Mountain Sunrise">
    <img src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Mountain Sunrise</Text>
    <Text slot="description">PNG • 3/15/2015</Text>
  </GridListItem>
</GridList>
```

## Tree example

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';

<Tree
  aria-label="Pokemon evolution"
  style={{height: 250}}
  defaultExpandedKeys={['bulbasaur', 'ivysaur']}
  
  selectionMode="multiple">
  <TreeItem id="bulbasaur" title="Bulbasaur">
    <TreeItem id="ivysaur" title="Ivysaur">
      {/*- begin highlight -*/}
      <TreeItem id="venusaur" title="Venusaur" isDisabled />
      {/*- end highlight -*/}
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
```

## Tag

Group example

```tsx
import {TagGroup, Tag} from 'vanilla-starter/TagGroup';

<TagGroup
  label="Pokemon"
  
  selectionMode="multiple">
  <Tag>Charizard</Tag>
  <Tag>Blastoise</Tag>
  {/*- begin highlight -*/}
  <Tag isDisabled>Venusaur</Tag>
  {/*- end highlight -*/}
  <Tag>Pikachu</Tag>
</TagGroup>
```

## Table example

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

<Table
  aria-label="Pokemon"
  
  selectionMode="multiple">
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Level</Column>
  </TableHeader>
  <TableBody>
    <Row id="charizard">
      <Cell>Charizard</Cell>
      <Cell>Fire, Flying</Cell>
      <Cell>67</Cell>
    </Row>
    <Row id="blastoise">
      <Cell>Blastoise</Cell>
      <Cell>Water</Cell>
      <Cell>56</Cell>
    </Row>
    {/*- begin highlight -*/}
    <Row id="venusaur" isDisabled>
    {/*- end highlight -*/}
      <Cell>Venusaur</Cell>
      <Cell>Grass, Poison</Cell>
      <Cell>83</Cell>
    </Row>
    <Row id="pikachu">
      <Cell>Pikachu</Cell>
      <Cell>Electric</Cell>
      <Cell>100</Cell>
    </Row>
  </TableBody>
</Table>
```

In dynamic collections, it may be more convenient to use the `disabledKeys` prop at the collection level instead of `isDisabled` on individual items. This accepts a list of item ids that are disabled.

## List

Box example

```tsx
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';

const items = [
  {id: 1, name: 'Charizard'},
  {id: 2, name: 'Blastoise'},
  {id: 3, name: 'Venusaur'},
  {id: 4, name: 'Pikachu'}
];

<ListBox
  aria-label="Pokemon"
  
  disabledKeys={[3]}
  selectionMode="multiple"
  items={items}>
  {item => <ListBoxItem>{item.name}</ListBoxItem>}
</ListBox>

```

## Grid

List example

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

const items = [
  {id: 1, name: 'Charizard'},
  {id: 2, name: 'Blastoise'},
  {id: 3, name: 'Venusaur'},
  {id: 4, name: 'Pikachu'}
];

<GridList
  aria-label="Pokemon"
  data-size="small"
  
  disabledKeys={[3]}
  items={items}>
  {item => (
    <GridListItem textValue={item.name}>
      <img src={`https://img.pokemondb.net/sprites/home/normal/2x/avif/${item.name.toLowerCase()}.avif`} alt="" />
      <Text>{item.name}</Text>
    </GridListItem>
  )}
</GridList>
```

## Tree example

```tsx
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {Collection} from 'react-aria-components';

type Pokemon = {
  id: number;
  name: string;
  type: string;
  level: number;
  children?: Pokemon[];
};

let items: Pokemon[] = [
  {id: 1, name: 'Bulbasaur', type: 'Grass', level: 14, children: [
    {id: 2, name: 'Ivysaur', type: 'Grass', level: 30, children: [
      {id: 3, name: 'Venusaur', type: 'Grass', level: 83}
    ]}
  ]},
  {id: 4, name: 'Charmander', type: 'Fire', level: 16, children: [
    {id: 5, name: 'Charmeleon', type: 'Fire', level: 32, children: [
      {id: 6, name: 'Charizard', type: 'Fire, Flying', level: 67}
    ]}
  ]},
  {id: 7, name: 'Squirtle', type: 'Water', level: 8, children: [
    {id: 8, name: 'Wartortle', type: 'Water', level: 34, children: [
      {id: 9, name: 'Blastoise', type: 'Water', level: 56}
    ]}
  ]}
];

<Tree
  aria-label="Pokemon evolution"
  style={{height: 250}}
  defaultExpandedKeys={[1, 2]}
  selectionMode="multiple"
  
  disabledKeys={[3]}
  items={items}>
  {function renderItem(item: Pokemon) {
    return (
      <TreeItem title={item.name}>
        <Collection items={item.children}>
          {renderItem}
        </Collection>
      </TreeItem>
    )
  }}
</Tree>
```

## Tag

Group example

```tsx
import {TagGroup, Tag} from 'vanilla-starter/TagGroup';

const items = [
  {id: 1, name: 'Charizard'},
  {id: 2, name: 'Blastoise'},
  {id: 3, name: 'Venusaur'},
  {id: 4, name: 'Pikachu'}
];

<TagGroup
  aria-label="Pokemon"
  selectionMode="multiple"
  
  disabledKeys={[3]}
  items={items}>
  {item => <Tag>{item.name}</Tag>}
</TagGroup>
```

## Table example

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

let items = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];

<Table
  aria-label="Pokemon"
  
  disabledKeys={[3]}
  selectionMode="multiple">
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Level</Column>
  </TableHeader>
  <TableBody items={items}>
    {item => (
      <Row>
        <Cell>{item.name}</Cell>
        <Cell>{item.type}</Cell>
        <Cell>{item.level}</Cell>
      </Row>
    )}
  </TableBody>
</Table>
```
