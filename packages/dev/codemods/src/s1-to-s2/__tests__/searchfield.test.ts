// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes placeholder', `
import {SearchField} from '@adobe/react-spectrum';
let placeholder = 'is this actually removed?';
let props = {placeholder: 'is this actually removed?'};
<div>
  <SearchField placeholder="is this actually removed?" />
  <SearchField placeholder={"is this actually removed?"} />
  <SearchField placeholder={placeholder} />
  <SearchField {...props} />
</div>
`);

test('Removes isQuiet', `
import {SearchField} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <SearchField isQuiet />
  <SearchField isQuiet={true} />
  <SearchField isQuiet={false} />
  <SearchField isQuiet={isQuiet} />
  <SearchField isQuiet={'foo' === 'foo'} />
  <SearchField {...props} />
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {SearchField} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <SearchField validationState="invalid" />
  <SearchField validationState="valid" />
  <SearchField validationState={validationState} />
  <SearchField {...props} />
</div>
`);
