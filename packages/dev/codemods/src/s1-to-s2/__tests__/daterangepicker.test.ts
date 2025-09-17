// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `

import {DateRangePicker} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <DateRangePicker isQuiet />
  <DateRangePicker isQuiet={true} />
  <DateRangePicker isQuiet={false} />
  <DateRangePicker isQuiet={isQuiet} />
  <DateRangePicker isQuiet={'foo' === 'foo'} />
  <DateRangePicker {...props} />
</div>
`);


test('changes validationState to isInvalid or nothing', `
  import {DateRangePicker} from '@adobe/react-spectrum';
  let validationState = 'invalid';
  let props = {validationState: 'invalid'};
  <div>
    <DateRangePicker validationState="invalid" />
    <DateRangePicker validationState="valid" />
    <DateRangePicker validationState={validationState} />
    <DateRangePicker {...props} />
  </div>
`);
