// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `
import {TextArea} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <TextArea isQuiet />
  <TextArea isQuiet={true} />
  <TextArea isQuiet={false} />
  <TextArea isQuiet={isQuiet} />
  <TextArea isQuiet={'foo' === 'foo'} />
  <TextArea {...props} />
</div>
`);

test('Removes placeholder', `
import {TextArea} from '@adobe/react-spectrum';
let placeholder = 'is this actually removed?';
let props = {placeholder: 'is this actually removed?'};
<div>
  <TextArea placeholder="is this actually removed?" />
  <TextArea placeholder={"is this actually removed?"} />
  <TextArea placeholder={placeholder} />
  <TextArea {...props} />
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {TextArea} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <TextArea validationState="invalid" />
  <TextArea validationState="valid" />
  <TextArea validationState={validationState} />
  <TextArea {...props} />
</div>
`);
