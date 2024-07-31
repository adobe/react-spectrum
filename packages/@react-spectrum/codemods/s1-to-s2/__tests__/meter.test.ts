// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};


test('Renames variants', `
import {Meter} from '@adobe/react-spectrum';

<div>
  <Meter label="Space used" variant="critical"/>
  <Meter label="Space used" variant="warning"/>
</div>
`);
