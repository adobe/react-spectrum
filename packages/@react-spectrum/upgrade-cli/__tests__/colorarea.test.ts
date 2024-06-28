// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes size', `
import {ColorArea} from '@adobe/react-spectrum';

<ColorArea defaultValue="#7f0000" size="size-1200" />
`);
