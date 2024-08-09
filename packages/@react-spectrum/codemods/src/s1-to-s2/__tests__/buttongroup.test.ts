// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Does nothing', `
import {Button, ButtonGroup} from '@adobe/react-spectrum';

<div>
  <ButtonGroup>
    <Button variant="accent">Rate Now</Button>
  </ButtonGroup>
</div>
`);
