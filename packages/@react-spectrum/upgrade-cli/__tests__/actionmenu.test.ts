// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - no change', `
import {ActionMenu, Item} from '@adobe/react-spectrum';

<div>
  <ActionMenu>
    <Item>Cut</Item>
    <Item>Copy</Item>
    <Item>Paste</Item>
  </ActionMenu>
</div>
`);

test('Dynamic - no change', `
import {ActionMenu, Item} from '@adobe/react-spectrum';
let actionMenuItems = [
  {name: 'Cut'},
  {name: 'Copy'},
  {name: 'Paste'},
  {name: 'Select All'}
];

<div>
  <ActionMenu items={actionMenuItems}>
    {item => <Item key={item.name}>{item.name}</Item>}
  </ActionMenu>
</div>
`);
