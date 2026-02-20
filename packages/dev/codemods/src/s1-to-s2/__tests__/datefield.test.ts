// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `

import {DateField} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <DateField isQuiet />
  <DateField isQuiet={true} />
  <DateField isQuiet={false} />
  <DateField isQuiet={isQuiet} />
  <DateField isQuiet={'foo' === 'foo'} />
  <DateField {...props} />
</div>
`);


test('changes validationState to isInvalid or nothing', `
  import {DateField} from '@adobe/react-spectrum';
  let validationState = 'invalid';
  let props = {validationState: 'invalid'};
  <div>
    <DateField validationState="invalid" />
    <DateField validationState="valid" />
    <DateField validationState={validationState} />
    <DateField {...props} />
  </div>
`);
