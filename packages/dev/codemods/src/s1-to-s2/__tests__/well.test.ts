// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Updates Well to be div with style macro', `
import {Well} from '@adobe/react-spectrum';

<div>
  <Well>
    Well content
  </Well>
  <Well role="region" aria-labelledby="wellLabel">
    <h3 id="wellLabel">Shipping Address</h3>
    <p>601 Townsend Street<br /> San Francisco, CA 94103</p>
  </Well>
</div>
`);
