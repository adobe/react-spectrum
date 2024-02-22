// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Renames variants', `
import {Button} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
</div>
`);
