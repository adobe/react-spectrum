// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test(
  'Rewrites illustration import to S2 with name change',
  `
import {IllustratedMessage, Heading, Content} from '@adobe/react-spectrum';
import NotFound from '@spectrum-icons/illustrations/NotFound';

<div>
  <IllustratedMessage>
    <NotFound />
    <Heading>No results</Heading>
    <Content>Try another search</Content>
  </IllustratedMessage>
</div>
`
);

test(
  'Rewrites illustration import to S2 with same name',
  `
import {IllustratedMessage, Heading, Content} from '@adobe/react-spectrum';
import Upload from '@spectrum-icons/illustrations/Upload';

<div>
  <IllustratedMessage>
    <Upload />
    <Heading>Upload a file</Heading>
    <Content>Drag and drop to upload</Content>
  </IllustratedMessage>
</div>
`
);
