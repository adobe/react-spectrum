// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';
jest.mock('../src/getComponents');

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('No changes', `
import {ListBox, Item} from '@adobe/react-spectrum';
<div>
  <ListBox width="size-2400" aria-label="Alignment">
    <Item>Left</Item>
    <Item>Middle</Item>
    <Item>Right</Item>
  </ListBox>
</div>
`);
