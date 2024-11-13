// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes isQuiet and isReadOnly', `
import {Form, TextField, Checkbox} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <Form isQuiet isReadOnly>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form isQuiet={false} isReadOnly={false}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form isQuiet={true} isReadOnly={true}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form isQuiet={isQuiet} isReadOnly={'foo' === 'foo'}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form {...props}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
</div>
`);

test('removes validationState and validationBehavior', `
import {TextArea} from '@adobe/react-spectrum';
let validationState = 'invalid';
let validationBehavior = 'native';
let props = {validationState: 'invalid', validationBehavior: 'native'};
<div>
  <Form validationState="invalid" validationBehavior="aria">
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form validationState="valid" validationBehavior="native">
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form validationState={validationState} validationBehavior={validationBehavior}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
  <Form {...props}>
    <TextField label="Email" />
    <TextField label="Password" />
    <Checkbox>Remember me</Checkbox>
  </Form>
</div>
`);
