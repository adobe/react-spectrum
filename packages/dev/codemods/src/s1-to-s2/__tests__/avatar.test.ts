// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Updates size prop to pixel value', `
import {Avatar} from '@adobe/react-spectrum';
let size = 75;
let props = {size: 100};

<div>
  <Avatar
    src="https://i.imgur.com/kJOwAdv.png"
    alt="avatar with custom size"
    size="avatar-size-50" />
  <Avatar
    src="https://i.imgur.com/kJOwAdv.png"
    alt="avatar with custom size"
    size="avatar-size-700" />
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
