// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes size', `
import {ColorWheel} from '@adobe/react-spectrum';

<ColorWheel defaultValue="hsl(30, 100%, 50%)" size="size-1200" />
`);
