// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {DatePicker} from '@adobe/react-spectrum';

<div>
  <DatePicker label="Event date" />
</div>
`);
