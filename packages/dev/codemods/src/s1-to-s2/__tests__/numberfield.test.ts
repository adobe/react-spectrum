// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet', `
import {NumberField} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <NumberField isQuiet />
  <NumberField isQuiet={true} />
  <NumberField isQuiet={false} />
  <NumberField isQuiet={isQuiet} />
  <NumberField isQuiet={'foo' === 'foo'} />
  <NumberField {...props} />
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {NumberField} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
<div>
  <NumberField validationState="invalid" />
  <NumberField validationState="valid" />
  <NumberField validationState={validationState} />
  <NumberField {...props} />
</div>
`);

test('Comments out hideStepper', `
import {NumberField} from '@adobe/react-spectrum';

<div>
  <NumberField hideStepper />
  <NumberField hideStepper={true} />
</div>
`);
