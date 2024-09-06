// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Replaces size prop with macro size value', `
import {ColorArea} from '@adobe/react-spectrum';
let size = 75;
let props = {size: 100};

<>
  <ColorArea defaultValue="#7f0000" size="size-1200" />
  <ColorArea defaultValue="#7f0000" size={50} />
  <ColorArea defaultValue="#7f0000" size={size} />
  <ColorArea defaultValue="#7f0000" {...props} />
</>
`);
