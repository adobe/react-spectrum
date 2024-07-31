// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {Provider, defaultTheme} from '@adobe/react-spectrum';

<Provider theme={defaultTheme} locale="en-US">
  Test
</Provider>
`);
