// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {IllustratedMessage, Heading, Content} from '@adobe/react-spectrum';
import NotFound from '@spectrum-icons/illustrations/NotFound';

<div>
  <IllustratedMessage>
    <NotFound />
    <Heading>No results</Heading>
    <Content>Try another search</Content>
  </IllustratedMessage>
</div>
`);
