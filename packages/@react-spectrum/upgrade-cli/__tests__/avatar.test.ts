// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

// add other sizes if we are going to replace it for them
test('Replaces size (maybe? or just removes it?)', `
import {Avatar} from '@adobe/react-spectrum';
let size = 75;
let props = {size: 100};

<div>
  <Avatar
    src="https://i.imgur.com/kJOwAdv.png"
    alt="avatar with custom size"
    size={50} />
  <Avatar
    src="https://i.imgur.com/kJOwAdv.png"
    alt="avatar with custom size"
    size={size} />
  <Avatar
    src="https://i.imgur.com/kJOwAdv.png"
    alt="avatar with custom size"
    {...props} />
</div>
`);
