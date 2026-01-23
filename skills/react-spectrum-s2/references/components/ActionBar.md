# Action

Bar

Action bars are used for single and bulk selection patterns when a user needs to perform actions on one or more items at the same time.

```tsx
import {ActionBar, ActionButton, TableView, TableHeader, TableBody, Column, Row, Cell, Text} from '@react-spectrum/s2';
import Edit from '@react-spectrum/s2/icons/Edit';
import Copy from '@react-spectrum/s2/icons/Copy';
import Delete from '@react-spectrum/s2/icons/Delete';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

let rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: '67'},
  {id: 2, name: 'Blastoise', type: 'Water', level: '56'},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: '83'},
  {id: 4, name: 'Pikachu', type: 'Electric', level: '100'}
];

function Example(props) {
  return (
    <TableView
      aria-label="Table with action bar"
      selectionMode="multiple"
      defaultSelectedKeys={[2]}
      styles={style({width: 'full', height: 250})}
      renderActionBar={(selectedKeys) => (
        /*- begin focus -*/
        <ActionBar {...props}>
          <ActionButton onPress={() => alert('Edit action')}>
            <Edit />
            <Text>Edit</Text>
          </ActionButton>
          <ActionButton onPress={() => alert('Copy action')}>
            <Copy />
            <Text>Copy</Text>
          </ActionButton>
          <ActionButton onPress={() => alert('Delete action')}>
            <Delete />
            <Text>Delete</Text>
          </ActionButton>
        </ActionBar>
        /*- end focus -*/
      )}>
      <TableHeader>
        <Column key="name" isRowHeader>Name</Column>
        <Column key="type">Type</Column>
        <Column key="level">Level</Column>
      </TableHeader>
      <TableBody items={rows}>
        {item => (
          <Row>
            <Cell key="name">{item.name}</Cell>
            <Cell key="type">{item.type}</Cell>
            <Cell key="level">{item.level}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
```

## A

PI

```tsx
<ActionBar>
  <ActionButton />
</ActionBar>
```

### Action

Bar

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | A list of ActionButtons to display. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isEmphasized` | `boolean | undefined` | — | Whether the ActionBar should be displayed with a emphasized style. |
| `onClearSelection` | `(() => void) | undefined` | — | Handler that is called when the ActionBar clear button is pressed. |
| `scrollRef` | `RefObject<HTMLElement | null> | undefined` | — | A ref to the scrollable element the ActionBar appears above. |
| `selectedItemCount` | `number | "all" | undefined` | — | The number of selected items that the ActionBar is currently linked to. If 0, the ActionBar is hidden. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
