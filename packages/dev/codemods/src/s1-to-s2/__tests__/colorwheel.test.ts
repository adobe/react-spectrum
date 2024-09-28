// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Replaces size prop with macro size value', `
import {ColorWheel} from '@adobe/react-spectrum';
let size = 75;
let props = {size: 100};

<>
  <ColorWheel defaultValue="hsl(30, 100%, 50%)" size="size-1200" />
  <ColorWheel defaultValue="hsl(30, 100%, 50%)" size={50} />
  <ColorWheel defaultValue="hsl(30, 100%, 50%)" size={size} />
  <ColorWheel defaultValue="hsl(30, 100%, 50%)" {...props} />
</>
`);
