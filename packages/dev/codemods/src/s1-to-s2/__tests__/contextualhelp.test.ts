// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('No change', `
import {Content, ContextualHelp, Heading, TextField} from '@adobe/react-spectrum';
<TextField
  label="Password"
  type="password"
  contextualHelp={
    <ContextualHelp>
      <Heading>Need help?</Heading>
      <Content>
        If you're having trouble accessing your account, contact our customer
        support team for help.
      </Content>
    </ContextualHelp>
  }
/>
`);

