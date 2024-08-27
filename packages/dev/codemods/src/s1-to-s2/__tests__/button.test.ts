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

test('Renames variants with aliased import', `
import {Button as RSPButton} from '@adobe/react-spectrum';

<div>
  <RSPButton variant="cta">Test</RSPButton>
  <RSPButton variant="overBackground">Test</RSPButton>
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

test('Does not change nested components with same prop name', `
import {Button} from '@adobe/react-spectrum';
import {FakeComponent} from 'fake-package';

<div>
  <Button variant="cta">
    Test
    <FakeComponent variant="cta">Test</FakeComponent>
  </Button>
  <Button variant="overBackground">
    Test
    <FakeComponent variant="overBackground">Test</FakeComponent>
  </Button>
</div>
`);
