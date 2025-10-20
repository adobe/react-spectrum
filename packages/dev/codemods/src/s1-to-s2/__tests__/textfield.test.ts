// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `
import {TextField} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <TextField isQuiet />
  <TextField isQuiet={true} />
  <TextField isQuiet={false} />
  <TextField isQuiet={isQuiet} />
  <TextField isQuiet={'foo' === 'foo'} />
  <TextField {...props} />
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {TextField} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <TextField validationState="invalid" />
  <TextField validationState="valid" />
  <TextField validationState={validationState} />
  <TextField {...props} />
</div>
`);
