// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Change variant info to informative', `
import {InlineAlert, Heading, Content} from '@adobe/react-spectrum';
let variant = 'info';
let props = {variant: 'info'};
<div>
  <InlineAlert variant="info">
    <Heading>Payment Information</Heading>
    <Content>
      Enter your billing address, shipping address, and payment method to
      complete your purchase.
    </Content>
  </InlineAlert>
  <InlineAlert variant={"info"}>
    <Heading>Payment Information</Heading>
    <Content>
      Enter your billing address, shipping address, and payment method to
      complete your purchase.
    </Content>
  </InlineAlert>
  <InlineAlert variant={variant}>
    <Heading>Payment Information</Heading>
    <Content>
      Enter your billing address, shipping address, and payment method to
      complete your purchase.
    </Content>
  </InlineAlert>
  <InlineAlert {...props}>
    <Heading>Payment Information</Heading>
    <Content>
      Enter your billing address, shipping address, and payment method to
      complete your purchase.
    </Content>
  </InlineAlert>
</div>
`);
