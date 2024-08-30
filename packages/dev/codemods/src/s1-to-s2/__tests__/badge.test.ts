// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Change variant info to informative', `
import {Badge} from '@adobe/react-spectrum';
let variant = 'info';
let props = {variant: 'info'};
<div>
  <Badge variant="info">
    Content Info
  </Badge>
  <Badge variant={"info"}>
    Content Info
  </Badge>
  <Badge variant={variant}>
    Content Info
  </Badge>
  <Badge {...props}>
    Content Info
  </Badge>
</div>
`);
