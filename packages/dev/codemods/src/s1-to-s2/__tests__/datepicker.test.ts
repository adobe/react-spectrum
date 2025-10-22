// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `

import {DatePicker} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <DatePicker isQuiet />
  <DatePicker isQuiet={true} />
  <DatePicker isQuiet={false} />
  <DatePicker isQuiet={isQuiet} />
  <DatePicker isQuiet={'foo' === 'foo'} />
  <DatePicker {...props} />
</div>
`);


test('changes validationState to isInvalid or nothing', `
  import {DatePicker} from '@adobe/react-spectrum';
  let validationState = 'invalid';
  let props = {validationState: 'invalid'};
  <div>
    <DatePicker validationState="invalid" />
    <DatePicker validationState="valid" />
    <DatePicker validationState={validationState} />
    <DatePicker {...props} />
  </div>
`);
