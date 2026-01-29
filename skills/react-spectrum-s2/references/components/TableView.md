# Table

View

Tables are containers for displaying information. They allow users to quickly scan, sort, compare, and take action on large amounts of data.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<TableView
  
  styles={style({width: 'full'})}>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody>
    <Row id="1">
      <Cell>Projects</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2025</Cell>
    </Row>
    <Row id="2">
      <Cell>Pictures</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2025</Cell>
    </Row>
    <Row id="3">
      <Cell>2024 Annual Financial Report</Cell>
      <Cell>Text document</Cell>
      <Cell>12/30/2024</Cell>
    </Row>
    <Row id="4">
      <Cell>Job Posting</Cell>
      <Cell>Text Document</Cell>
      <Cell>1/18/2025</Cell>
    </Row>
  </TableBody>
</TableView>
```

## Content

`TableView` follows the [Collection Components API](collections.md?component=Table), accepting both static and dynamic collections.
In this example, both the columns and the rows are provided to the table via a render function, enabling the user to hide and show columns and add additional rows.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, CheckboxGroup, Checkbox, ActionButton} from '@react-spectrum/s2';
import {useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const columns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Type', id: 'type'},
  {name: 'Date Modified', id: 'date'}
];

const initialRows = [
  {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
  {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
  {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
  {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
];

function FileTable() {
  let [showColumns, setShowColumns] = useState(['name', 'type', 'date']);
  let visibleColumns = columns.filter(column => showColumns.includes(column.id));

  let [rows, setRows] = useState(initialRows);
  let addRow = () => {
    let date = new Date().toLocaleDateString();
    setRows(rows => [
      ...rows,
      {id: rows.length + 1, name: 'file.txt', date, type: 'Text Document'}
    ]);
  };

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'start', width: 'full'})}>
      <CheckboxGroup aria-label="Show columns" value={showColumns} onChange={setShowColumns} orientation="horizontal">
        <Checkbox value="type">Type</Checkbox>
        <Checkbox value="date">Date Modified</Checkbox>
      </CheckboxGroup>
      <TableView aria-label="Files" styles={style({width: 'full'})}>
        <TableHeader columns={visibleColumns}>
          {column => (
            <Column isRowHeader={column.isRowHeader}>
              {column.name}
            </Column>
          )}
        </TableHeader>
        {/*- begin highlight -*/}
        <TableBody items={rows} dependencies={[visibleColumns]}>
          {item => (
            /*- end highlight -*/
            <Row columns={visibleColumns}>
              {column => <Cell>{item[column.id]}</Cell>}
            </Row>
          )}
        </TableBody>
      </TableView>
      <ActionButton onPress={addRow}>Add row</ActionButton>
    </div>
  );
}
```

<InlineAlert variant="notice">
  <Heading>Memoization</Heading>
  <Content>Dynamic collections are automatically memoized to improve performance. Use the `dependencies` prop to invalidate cached elements that depend
  on external state (e.g. `columns` in this example).</Content>
</InlineAlert>

### Asynchronous loading

Use the `loadingState` and `onLoadMore` props to enable async loading and infinite scrolling.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, useAsyncList} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface Character {
  name: string;
  height: number;
  mass: number;
  birth_year: number;
}

function AsyncSortTable() {
  let list = useAsyncList<Character>({
    async load({ signal, cursor }) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(
        cursor || 'https://swapi.py4e.com/api/people/?search=',
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
    <TableView
      aria-label="Star Wars characters"
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}
      styles={style({width: 'full', height: 320})}>
      <TableHeader>
        <Column id="name" isRowHeader>Name</Column>
        <Column id="height">Height</Column>
        <Column id="mass">Mass</Column>
        <Column id="birth_year">Birth Year</Column>
      </TableHeader>
      <TableBody items={list.items}>
        {(item) => (
          <Row id={item.name}>
            <Cell>{item.name}</Cell>
            <Cell>{item.height}</Cell>
            <Cell>{item.mass}</Cell>
            <Cell>{item.birth_year}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
```

### Links

Use the `href` prop on a Row to create a link. See the [getting started guide](getting-started.md) to learn how to integrate with your framework. Link interactions vary depending on the selection behavior.  See the [selection guide](selection.md) for more details.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<TableView
  
  styles={style({width: 'full'})}>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>URL</Column>
    <Column>Date added</Column>
  </TableHeader>
  <TableBody>
    {/*- begin highlight -*/}
    <Row href="https://adobe.com/" target="_blank">
      {/*- end highlight -*/}
      <Cell>Adobe</Cell>
      <Cell>https://adobe.com/</Cell>
      <Cell>January 28, 2023</Cell>
    </Row>
    <Row href="https://google.com/" target="_blank">
      <Cell>Google</Cell>
      <Cell>https://google.com/</Cell>
      <Cell>April 5, 2023</Cell>
    </Row>
    <Row href="https://nytimes.com/" target="_blank">
      <Cell>New York Times</Cell>
      <Cell>https://nytimes.com/</Cell>
      <Cell>July 12, 2023</Cell>
    </Row>
  </TableBody>
</TableView>
```

### Empty state

Use `renderEmptyState` to render placeholder content when the table is empty.

```tsx
import {TableView, TableHeader, Column, TableBody, IllustratedMessage, Heading, Content, Link} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import FolderOpen from '@react-spectrum/s2/illustrations/linear/FolderOpen';

<TableView aria-label="Search results" styles={style({width: 'full', height: 320})}>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  {/*- begin highlight -*/}
  <TableBody
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
  </TableBody>
</TableView>
```

### Cell options

Use the `align` prop on a Column and Cell to set the text alignment. `showDivider` adds a divider between a cell and the next cell. `colSpan` makes a cell span multiple columns.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, Collection} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];

const columns = [
  {id: 'name', name: 'Name', isRowHeader: true, showDivider: true, align: undefined},
  {id: 'type', name: 'Type', isRowHeader: false, showDivider: true, align: 'center'},
  {id: 'level', name: 'Level', isRowHeader: false, showDivider: false, align: 'end'}
] as const;

function TableWithDividers() {
  return (
    <TableView
      aria-label="Favorite pokemon"
      styles={style({width: 400, maxWidth: 'full'})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column
            /*- begin highlight -*/
            showDivider={column.showDivider}
            align={column.align}
            /*- end highlight -*/
            isRowHeader={column.isRowHeader}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody>
        <Collection items={rows}>
          {item => (
            <Row id={item.id} columns={columns}>
              {(column) => (
                <Cell
                  /*- begin highlight -*/
                  showDivider={column.showDivider}
                  align={column.align}>
                  {/*- end highlight -*/}
                  {item[column.id]}
                </Cell>
              )}
            </Row>
          )}
        </Collection>
        <Row>
          {/*- begin highlight -*/}
          <Cell colSpan={2} align="end" showDivider>Total:</Cell>
          {/*- end highlight -*/}
          <Cell align="end">{rows.reduce((p, v) => p + v.level, 0)}</Cell>
        </Row>
      </TableBody>
    </TableView>
  );
}
```

### Column menus

Use the `menuItems` prop to add custom menu items to a Column. See the [Menu](Menu.md) docs for more details.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, MenuSection, MenuItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];

const columns = [
  {id: 'name', name: 'Name', isRowHeader: true},
  {id: 'type', name: 'Type'},
  {id: 'level', name: 'Level'}
];

function CustomMenusTable() {
  return (
    <TableView aria-label="Favorite pokemon" styles={style({width: 400, maxWidth: 'full'})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column
            menuItems={
              <>
                <MenuSection>
                  <MenuItem onAction={() => alert(`Filtering "${column.name}" column`)}>Filter</MenuItem>
                </MenuSection>
                <MenuSection>
                  <MenuItem onAction={() => alert(`Hiding "${column.name}" column`)}>Hide column</MenuItem>
                  <MenuItem onAction={() => alert(`Managing the "${column.name}" column`)}>Manage columns</MenuItem>
                </MenuSection>
              </>
            }
            isRowHeader={column.isRowHeader}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
```

### Editable cells

Render an `<EditableCell>` instead of a `<Cell>` to allow users to edit the value. Editing is triggered by an `<ActionButton slot="edit">` and occurs in a popover that can contain one or more inputs.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, EditableCell, TextField, ActionButton, Picker, PickerItem, Text, type Key, type ColumnProps} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import User from '@react-spectrum/s2/icons/User';
import Edit from '@react-spectrum/s2/icons/Edit';
import {useCallback} from 'react';
import {useListData} from '@react-stately/data';

let defaultItems = [
  {id: 1, fruits: 'Apples', task: 'Collect', farmer: 'Eva'},
  {id: 2, fruits: 'Oranges', task: 'Collect', farmer: 'Steven'},
  {id: 3, fruits: 'Pears', task: 'Collect', farmer: 'Michael'},
  {id: 4, fruits: 'Cherries', task: 'Collect', farmer: 'Sara'},
  {id: 5, fruits: 'Dates', task: 'Collect', farmer: 'Karina'},
  {id: 6, fruits: 'Bananas', task: 'Collect', farmer: 'Otto'},
  {id: 7, fruits: 'Melons', task: 'Collect', farmer: 'Matt'},
  {id: 8, fruits: 'Figs', task: 'Collect', farmer: 'Emily'},
  {id: 9, fruits: 'Blueberries', task: 'Collect', farmer: 'Amelia'},
  {id: 10, fruits: 'Blackberries', task: 'Collect', farmer: 'Isla'}
];

let editableColumns: Array<Omit<ColumnProps, 'children'> & {name: string}> = [
  {name: 'Fruits', id: 'fruits', isRowHeader: true, width: '2fr', minWidth: 200},
  {name: 'Task', id: 'task', width: '1fr', minWidth: 150},
  {name: 'Farmer', id: 'farmer', width: '1fr', minWidth: 150}
];

export default function EditableTable(props) {
  let columns = editableColumns;
  let data = useListData({initialItems: defaultItems});

  let onChange = useCallback((id: Key, columnId: Key, values: any) => {
    let value = values[columnId];
    if (value == null) {
      return;
    }
    data.update(id, (prevItem) => ({...prevItem, [columnId]: value}));
  }, [data]);

  return (
    <TableView aria-label="Dynamic table" {...props} styles={style({height: 208, width: 'full'})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column {...column}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={data.items}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              if (column.id === 'fruits') {
                return (
                  <EditableCell
                    aria-label={`Edit ${item[column.id]} in ${column.name}`}
                    align={column.align}
                    showDivider={column.showDivider}
                    onSubmit={(e) => {
                      e.preventDefault();
                      let formData = new FormData(e.target as HTMLFormElement);
                      let values = Object.fromEntries(formData.entries());
                      onChange(item.id, column.id!, values);
                    }}
                    renderEditing={() => (
                      <TextField
                        aria-label="Fruit name edit field"
                        autoFocus
                        validate={value => value.length > 0 ? null : 'Fruit name is required'}
                        styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                        defaultValue={item[column.id!]}
                        name={column.id! as string} />
                    )}>
                    <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>
                      <span className={style({minWidth: 0, truncate: true})}>
                        {item[column.id]}
                      </span>
                      <ActionButton slot="edit" aria-label="Edit fruit">
                        <Edit />
                      </ActionButton>
                    </div>
                  </EditableCell>
                );
              }
              if (column.id === 'farmer') {
                return (
                  <EditableCell
                    align={column.align}
                    showDivider={column.showDivider}
                    onSubmit={(e) => {
                      e.preventDefault();
                      let formData = new FormData(e.target as HTMLFormElement);
                      let values = Object.fromEntries(formData.entries());
                      onChange(item.id, column.id!, values);
                    }}
                    renderEditing={() => (
                      <Picker
                        aria-label="Edit farmer"
                        autoFocus
                        styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                        defaultValue={item[column.id!]}
                        name={column.id! as string}
                        items={defaultItems}>
                        {item => (
                          <PickerItem textValue={item.farmer} id={item.farmer}>
                            <User />
                            <Text>{item.farmer}</Text>
                          </PickerItem>
                        )}
                      </Picker>
                    )}>
                    <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>
                      {item[column.id]}
                      <ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton>
                    </div>
                  </EditableCell>
                );
              }
              return <Cell align={column.align} showDivider={column.showDivider}>{item[column.id!]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
```

## Selection and actions

Use `selectionMode` to enable single or multiple selection, and `selectedKeys` (matching each row's `id`) to control the selected rows. Return an [ActionBar](ActionBar.md) from `renderActionBar` to handle bulk actions, and use `onAction` for row navigation. Disable rows with `isDisabled`. See the [selection guide](selection.md) for details.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, ActionBar, ActionButton, Text, type Selection} from '@react-spectrum/s2';
import Edit from '@react-spectrum/s2/icons/Edit';
import Copy from '@react-spectrum/s2/icons/Copy';
import Delete from '@react-spectrum/s2/icons/Delete';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <>
      <TableView
        {...props}
        aria-label="Favorite pokemon"
        styles={style({width: 'full', height: 200})}
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onAction={key => alert(`Clicked ${key}`)}
        renderActionBar={(selectedKeys) => {
          let selection = selectedKeys === 'all' ? 'all' : [...selectedKeys].join(', ');
          return (
            <ActionBar>
              <ActionButton onPress={() => alert(`Edit ${selection}`)}>
                <Edit />
                <Text>Edit</Text>
              </ActionButton>
              <ActionButton onPress={() => alert(`Copy ${selection}`)}>
                <Copy />
                <Text>Copy</Text>
              </ActionButton>
              <ActionButton onPress={() => alert(`Delete ${selection}`)}>
                <Delete />
                <Text>Delete</Text>
              </ActionButton>
            </ActionBar>
          );
        }}>
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
          <Row id="venusaur" isDisabled>
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
      </TableView>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </>
  );
}
```

## Sorting

Set the `allowsSorting` prop on a Column to make it sortable. When the column header is pressed, `onSortChange` is called with a `SortDescriptor` including the sorted column and direction (ascending or descending). Use this to sort the data accordingly, and pass the `sortDescriptor` prop to the TableView to display the sorted column.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell, type SortDescriptor} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

const rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];

function SortableTable() {
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(null);
  let sortedRows = rows;
  if (sortDescriptor) {
    sortedRows = rows.toSorted((a, b) => {
      let first = a[sortDescriptor.column];
      let second = b[sortDescriptor.column];
      let cmp = first < second ? -1 : 1;
      if (sortDescriptor.direction === 'descending') {
        cmp = -cmp;
      }
      return cmp;
    });
  }

  return (
    <TableView
      aria-label="Favorite pokemon"
      styles={style({width: 400, maxWidth: 'full'})}
      sortDescriptor={sortDescriptor ?? undefined}
      onSortChange={setSortDescriptor}
    >
      <TableHeader>
        {/*- begin highlight -*/}
        <Column id="name" isRowHeader allowsSorting>Name</Column>
        <Column id="type" allowsSorting>Type</Column>
        <Column id="level" allowsSorting>Level</Column>
        {/*- end highlight -*/}
      </TableHeader>
      <TableBody items={sortedRows}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.level}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
```

## Column resizing

Set the `allowsResizing` prop on a Column to make it resizable. Use the `defaultWidth`, `width`, `minWidth`, and `maxWidth` props on a Column to control resizing behavior. These accept pixels, percentages, or fractional values (the [fr](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout#the_fr_unit) unit). The default column width is `1fr`.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const rows = [
  {id: 1, name: '2022 Roadmap Proposal Revision 012822 Copy (2)', date: 'November 27, 2022 at 4:56PM', size: '214 KB'},
  {id: 2, name: 'Budget', date: 'January 27, 2021 at 1:56AM', size: '14 MB'},
  {id: 3, name: 'Welcome Email Template', date: 'July 24, 2022 at 2:48 PM', size: '20 KB'},
  {id: 4, name: 'Job Posting_8301', date: 'May 30, 2025', size: '139 KB'}
];

<TableView aria-label="Table with resizable columns" styles={style({width: 400, maxWidth: 'full'})}>
  <TableHeader>
    {/*- begin highlight -*/}
    <Column id="file" isRowHeader maxWidth={500} allowsResizing>
      File Name
    </Column>
    <Column id="size" width={80}>Size</Column>
    <Column id="date" minWidth={100} allowsResizing>
      Date Modified
    </Column>
    {/*- end highlight -*/}
  </TableHeader>
  <TableBody items={rows}>
    {item => (
      <Row>
        <Cell>{item.name}</Cell>
        <Cell>{item.size}</Cell>
        <Cell>{item.date}</Cell>
      </Row>
    )}
  </TableBody>
</TableView>
```

### Resize events

The TableView's `onResize` event is called when a column resizer is moved by the user. The `onResizeEnd` event is called when the user finishes resizing. These receive a `Map` containing the widths of all columns in the TableView. This example persists the column widths in `localStorage`.

```tsx
import {TableView, TableHeader, Column, TableBody, Row, Cell} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useSyncExternalStore} from 'react';

const rows = [
  {id: 1, name: '2022 Roadmap Proposal Revision 012822 Copy (2)', date: 'November 27, 2022 at 4:56PM', size: '214 KB'},
  {id: 2, name: 'Budget', date: 'January 27, 2021 at 1:56AM', size: '14 MB'},
  {id: 3, name: 'Welcome Email Template', date: 'July 24, 2022 at 2:48 PM', size: '20 KB'},
  {id: 4, name: 'Job Posting_8301', date: 'May 30, 2025', size: '139 KB'}
];

const columns = [
  {id: 'file', name: 'File Name'},
  {id: 'size', name: 'Size'},
  {id: 'date', name: 'Date'}
];

const initialWidths = new Map<string, string | number>([
  ['file', '1fr'],
  ['size', 80],
  ['date', 100]
]);

export default function ResizableTable() {
  let columnWidths = useSyncExternalStore(subscribe, getColumnWidths, getInitialWidths);

  return (
    <TableView
      aria-label="Table with resizable columns"
      onResize={setColumnWidths}
      styles={style({width: 400, maxWidth: 'full'})}>
      <TableHeader columns={columns} dependencies={[columnWidths]}>
        {column => (
          <Column
            isRowHeader={column.id === 'file'}
            allowsResizing
            width={columnWidths.get(column.id)}
          >
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody items={rows}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.size}</Cell>
            <Cell>{item.date}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

let parsedWidths;
function getColumnWidths() {
  // Parse column widths from localStorage.
  if (!parsedWidths) {
    let data = localStorage.getItem('table-widths');
    if (data) {
      parsedWidths = new Map(JSON.parse(data));
    }
  }
  return parsedWidths || initialWidths;
}

function setColumnWidths(widths) {
  // Store new widths in localStorage, and trigger subscriptions.
  localStorage.setItem('table-widths', JSON.stringify(Array.from(widths)));
  window.dispatchEvent(new Event('storage'));
}

function getInitialWidths() {
  return initialWidths;
}

function subscribe(fn) {
  let onStorage = () => {
    // Invalidate cache.
    parsedWidths = null;
    fn();
  };

  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
```

## A

PI

```tsx
<TableView>
  <TableHeader>
    <Column />
  </TableHeader>
  <TableBody>
    <Row>
      <Cell />
      <EditableCell />
    </Row>
  </TableBody>
</TableView>
```

### Table

View

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. |
| `defaultSelectedKeys` | `"all" | Iterable<Key> | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `density` | `"compact" | "regular" | "spacious" | undefined` | 'regular' | Sets the amount of vertical padding within each cell. |
| `disabledBehavior` | `DisabledBehavior | undefined` | "all" | Whether `disabledKeys` applies to all interactions, or only selection. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | A list of row keys to disable. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `escapeKeyBehavior` | `"clearSelection" | "none" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the table or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isQuiet` | `boolean | undefined` | — | Whether the Table should be displayed with a quiet style. |
| `loadingState` | `LoadingState | undefined` | — | The current loading state of the table. |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a user performs an action on a row. |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `onResize` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called when a user performs a column resize. Can be used with the width property on columns to put the column widths into a controlled state. |
| `onResizeEnd` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called after a user performs a column resize. Can be used to store the widths of columns for another future session. |
| `onResizeStart` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called when a user starts a column resize. |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `onSortChange` | `((descriptor: SortDescriptor) => any) | undefined` | — | Handler that is called when the sorted column or direction changes. |
| `overflowMode` | `"wrap" | "truncate" | undefined` | 'truncate' | Sets the overflow behavior for the cell contents. |
| `renderActionBar` | `((selectedKeys: "all" | Set<Key>) => ReactElement) | undefined` | — | Provides the ActionBar to display when rows are selected in the TableView. |
| `selectedKeys` | `"all" | Iterable<Key> | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `sortDescriptor` | `SortDescriptor | undefined` | — | The current sorted column and direction. |
| `styles` | `StylesPropWithHeight | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `React.CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |

### Table

Header

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactElement)` | — | A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. |
| `columns` | `Iterable<T> | undefined` | — | A list of table columns. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the column cache when using dynamic collections. |

### Column

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "center" | "end" | undefined` | 'start' | The alignment of the column's contents relative to its allotted width. |
| `allowsResizing` | `boolean | undefined` | — | Whether the column allows resizing. |
| `allowsSorting` | `boolean | undefined` | — | Whether the column allows sorting. |
| `children` | `React.ReactNode` | — | The content to render as the column header. |
| `defaultWidth` | `ColumnSize | null | undefined` | — | The default width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `id` | `Key | undefined` | — | The unique id of the column. |
| `isRowHeader` | `boolean | undefined` | — | Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be announced by assistive technology during row navigation. |
| `maxWidth` | `ColumnStaticSize | null | undefined` | — | The maximum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `menuItems` | `React.ReactNode` | — | Menu fragment to be rendered inside the column header's menu. |
| `minWidth` | `ColumnStaticSize | null | undefined` | — | The minimum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `showDivider` | `boolean | undefined` | — | Whether the column should render a divider between it and the next column. |
| `textValue` | `string | undefined` | — | A string representation of the column's contents, used for accessibility announcements. |
| `width` | `ColumnSize | null | undefined` | — | The width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |

### Table

Body

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `renderEmptyState` | `((props: TableBodyRenderProps) => ReactNode) | undefined` | — | Provides content to display when there are no rows in the table. |

### Row

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactElement)` | — | The cells within the row. Supports static items or a function for dynamic rendering. |
| `columns` | `Iterable<T> | undefined` | — | A list of columns used when dynamically rendering cells. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the cell cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the row. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the row is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the row. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the row's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Cell

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `"start" | "center" | "end" | undefined` | 'start' | The alignment of the column's contents relative to its allotted width. |
| `children` | `React.ReactNode` | — | The content to render as the cell children. |
| `colSpan` | `number | undefined` | — | Indicates how many columns the data cell spans. |
| `id` | `Key | undefined` | — | The unique id of the cell. |
| `isSticky` | `boolean | undefined` | — |  |
| `showDivider` | `boolean | undefined` | — | Whether the column should render a divider between it and the next column. |
| `textValue` | `string | undefined` | — | A string representation of the cell's contents, used for features like typeahead. |

### Editable

Cell

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `string | ((formData: FormData) => void | Promise<void>) | undefined` | — | The action to submit the form to. Only available in React 19+. |
| `align` | `"start" | "center" | "end" | undefined` | 'start' | The alignment of the column's contents relative to its allotted width. |
| `children` | `React.ReactNode` | — | The content to render as the cell children. |
| `colSpan` | `number | undefined` | — | Indicates how many columns the data cell spans. |
| `id` | `Key | undefined` | — | The unique id of the cell. |
| `isSaving` | `boolean | undefined` | — | Whether the cell is currently being saved. |
| `onCancel` | `(() => void) | undefined` | — | Handler that is called when the user cancels the edit. |
| `onSubmit` | `((e: FormEvent<HTMLFormElement>) => void) | undefined` | — | Handler that is called when the value has been changed and is ready to be saved. |
| `renderEditing` | `() => ReactNode` | — | The component which will handle editing the cell. For example, a `TextField` or a `Picker`. |
| `showDivider` | `boolean | undefined` | — | Whether the column should render a divider between it and the next column. |
| `textValue` | `string | undefined` | — | A string representation of the cell's contents, used for features like typeahead. |

## Related 

Types

### Sort

Descriptor

| Name | Type | Description |
|------|------|-------------|
| `column` \* | `Key` | The key of the column to sort by. |
| `direction` \* | `SortDirection` | The direction to sort by. |
