// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Renames variants', `
import {ProgressCircle} from '@adobe/react-spectrum';
<div>
  <ProgressCircle variant="overBackground"/>
</div>
`);
