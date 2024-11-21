// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Converts ActionGroup to ActionButtonGroup', `
import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup onAction={onAction}>
  <Item key="add">Add</Item>
  <Item key="delete">Delete</Item>
  <Item key="edit">Edit</Item>
</ActionGroup>
`);

test('Converts ActionGroup to ActionButtonGroup with disabledKeys', `
import {ActionGroup, Item} from '@adobe/react-spectrum';

function Example({disabledKeys}) {
  return (
    <ActionGroup onAction={onAction} disabledKeys={disabledKeys}>
      <Item key="add">Add</Item>
      <Item key="delete">Delete</Item>
      <Item key="edit">Edit</Item>
    </ActionGroup>
  );
}
`);

test('Converts ActionGroup to ActionButtonGroup with dynamic collections', `
import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup onAction={onAction} items={items}>
  {item => <Item>{item.name}</Item>}
</ActionGroup>
`);

test('Converts ActionGroup to ActionButtonGroup with dynamic collections and custom key', `
import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup onAction={onAction} items={items}>
  {item => <Item key={item._id}>{item.name}</Item>}
</ActionGroup>
`);

test('Converts ActionGroup to ToggleButtonGroup', `
  import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup selectionMode="single" onSelectionChange={onSelectionChange}>
  <Item key="add">Add</Item>
  <Item key="delete">Delete</Item>
  <Item key="edit">Edit</Item>
</ActionGroup>
`);

test('Converts ActionGroup to ToggleButtonGroup with disabledKeys', `
import {ActionGroup, Item} from '@adobe/react-spectrum';

function Example({disabledKeys}) {
  return (
    <ActionGroup selectionMode="single" onSelectionChange={onSelectionChange} disabledKeys={disabledKeys}>
      <Item key="add">Add</Item>
      <Item key="delete">Delete</Item>
      <Item key="edit">Edit</Item>
    </ActionGroup>
  );
}
`);

test('Converts ActionGroup to ToggleButtonGroup with dynamic collections', `
  import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup selectionMode="single" onSelectionChange={onSelectionChange} items={items}>
  {item => <Item>{item.name}</Item>}
</ActionGroup>
`);

test('Converts ActionGroup to ToggleButtonGroup with dynamic collections and custom key', `
  import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup selectionMode="single" onSelectionChange={onSelectionChange} items={items}>
  {item => <Item key={item._id}>{item.name}</Item>}
</ActionGroup>
`);

test('Comments out unsupported props', `
import {ActionGroup, Item} from '@adobe/react-spectrum';
<ActionGroup overflowMode="collapse" buttonLabelBehavior="collapse" summaryIcon={<Icon />}>
  <Item key="add">Add</Item>
  <Item key="delete">Delete</Item>
  <Item key="edit">Edit</Item>
</ActionGroup>
`);
