// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `
import {ColorField} from '@adobe/react-spectrum';

<ColorField label="Primary Color" isQuiet />
`);

test('Removes placeholder', `
import {ColorField} from '@adobe/react-spectrum';

<ColorField label="Primary Color" placeholder="Color" />
`);

test('changes validationState to isInvalid or nothing', `
import {ColorField} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <ColorField label="Primary Color" validationState="invalid" />
  <ColorField label="Primary Color" validationState="valid" />
  <ColorField label="Primary Color" validationState={'invalid'} />
  <ColorField label="Primary Color" validationState={validationState} />
  <ColorField label="Primary Color" {...props} />
</div>
`);
