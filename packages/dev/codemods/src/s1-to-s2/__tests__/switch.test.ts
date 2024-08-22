// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

// nothing yet
test('Renames variants', `
// import {Switch} from '@adobe/react-spectrum';

<div>
</div>
`);
