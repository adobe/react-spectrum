// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {DateRangePicker} from '@adobe/react-spectrum';

<div>
  <DateRangePicker label="Event date range" />
</div>
`);
