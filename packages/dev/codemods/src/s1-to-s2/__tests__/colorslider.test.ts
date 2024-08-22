// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes showValueLabel', `
import {ColorSlider} from '@adobe/react-spectrum';

<ColorSlider defaultValue="#7f0000" channel="red" showValueLabel={false} />
`);
