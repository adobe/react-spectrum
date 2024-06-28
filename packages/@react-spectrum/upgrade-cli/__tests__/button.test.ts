// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

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

test('Comments out isPending', `
import {Button} from '@adobe/react-spectrum';

<div>
  <Button isPending>Test</Button>
  <Button isPending={true}>Test</Button>
</div>
`);

test('Converts Button to LinkButton if it has href prop', `
import {Button} from '@adobe/react-spectrum';

<div>
  <Button>Test</Button>
  <Button href="/">Test</Button>
</div>
`);
