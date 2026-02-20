// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `

import {TimeField} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <TimeField isQuiet />
  <TimeField isQuiet={true} />
  <TimeField isQuiet={false} />
  <TimeField isQuiet={isQuiet} />
  <TimeField isQuiet={'foo' === 'foo'} />
  <TimeField {...props} />
</div>
`);


test('changes validationState to isInvalid or nothing', `
  import {TimeField} from '@adobe/react-spectrum';
  let validationState = 'invalid';
  let props = {validationState: 'invalid'};
  <div>
    <TimeField validationState="invalid" />
    <TimeField validationState="valid" />
    <TimeField validationState={validationState} />
    <TimeField {...props} />
  </div>
`);
