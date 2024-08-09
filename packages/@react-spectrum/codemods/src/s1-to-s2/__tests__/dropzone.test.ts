// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {DropZone, IllustratedMessage, Heading} from '@adobe/react-spectrum';
import Upload from '@spectrum-icons/illustrations/Upload';

<div>
  <DropZone>
    <IllustratedMessage>
      <Upload />
      <Heading>
        {'Drag and drop your file'}
      </Heading>
    </IllustratedMessage>
  </DropZone>
</div>
`);
