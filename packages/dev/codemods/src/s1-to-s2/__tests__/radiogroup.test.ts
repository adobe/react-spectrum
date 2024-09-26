// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes showErrorIcon', `
import {Radio, RadioGroup} from '@adobe/react-spectrum';
let showErrorIcon = true;
let props = {showErrorIcon: true};
<div>
  <RadioGroup label="Favorite sports" showErrorIcon>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" showErrorIcon={true}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" showErrorIcon={false}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" showErrorIcon={showErrorIcon}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" {...props}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
</div>
`);

test('changes validationState to isInvalid or nothing', `
import {RadioGroup, Radio} from '@adobe/react-spectrum';
let validationState = 'invalid';
let props = {validationState: 'invalid'};
let foo;
<div>
  <RadioGroup label="Favorite sports" validationState="invalid">
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" validationState="valid">
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" validationState={'invalid'}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" validationState={validationState}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
  <RadioGroup label="Favorite sports" {...props}>
    <Radio value="soccer">Soccer</Radio>
  </RadioGroup>
</div>
`);


// Need a remapping change which can take a set of oldValues and maps to newValues.
// <RadioGroup label="Favorite sports" validationState={foo ? 'valid' : 'invalid'}>
//   <Radio value="soccer">Soccer</Radio>
// </RadioGroup>

