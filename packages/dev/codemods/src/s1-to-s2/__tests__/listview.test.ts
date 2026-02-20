// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Leave a comment for density', `
import {Item, ListView} from '@adobe/react-spectrum';

<ListView density="compact">
  <Item key="photoshop">Adobe Photoshop</Item>
  <Item key="illustrator">Adobe Illustrator</Item>
</ListView>
`);

test('Leave a comment for dragAndDropHooks', `
import {Item, ListView} from '@adobe/react-spectrum';

<ListView dragAndDropHooks={() => ({})}>
  <Item key="photoshop">Adobe Photoshop</Item>
  <Item key="illustrator">Adobe Illustrator</Item>
</ListView>
`);
