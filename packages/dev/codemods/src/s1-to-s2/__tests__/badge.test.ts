// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('No change', `
import {Badge} from '@adobe/react-spectrum';

<div>
  <Badge variant="positive">Licensed</Badge>
</div>
`);
