// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes showErrorIcon', `
import {Checkbox, CheckboxGroup} from '@adobe/react-spectrum';
let showErrorIcon = true;
let props = {showErrorIcon: true};
<div>
  <CheckboxGroup label="Favorite sports" showErrorIcon>
    <Checkbox value="soccer">Soccer</Checkbox>
  </CheckboxGroup>
  <CheckboxGroup label="Favorite sports" showErrorIcon={true}>
    <Checkbox value="soccer">Soccer</Checkbox>
  </CheckboxGroup>
  <CheckboxGroup label="Favorite sports" showErrorIcon={false}>
    <Checkbox value="soccer">Soccer</Checkbox>
  </CheckboxGroup>
  <CheckboxGroup label="Favorite sports" showErrorIcon={showErrorIcon}>
    <Checkbox value="soccer">Soccer</Checkbox>
  </CheckboxGroup>
  <CheckboxGroup label="Favorite sports" {...props}>
    <Checkbox value="soccer">Soccer</Checkbox>
  </CheckboxGroup>
</div>
`);
