// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Remove isDisabled', `
import {StatusLight} from '@adobe/react-spectrum';
let isDisabled = true;
let props = {isDisabled: true};
<div>
  <StatusLight isDisabled>Test</StatusLight>
  <StatusLight isDisabled={true}>Test</StatusLight>
  <StatusLight isDisabled={false}>Test</StatusLight>
  <StatusLight isDisabled={isDisabled}>Test</StatusLight>
  <StatusLight {...props}>Test</StatusLight>
</div>
`);

test('Change variant from info to informative', `
import {StatusLight} from '@adobe/react-spectrum';
let variant = 'info';
let props = {variant: 'info'};
<div>
  <StatusLight variant="info">Test</StatusLight>
  <StatusLight variant="informative">Test</StatusLight>
  <StatusLight variant="foo">Test</StatusLight>
  <StatusLight variant={"info"}>Test</StatusLight>
  <StatusLight variant={variant}>Test</StatusLight>
  <StatusLight {...props}>Test</StatusLight>
</div>
`);
