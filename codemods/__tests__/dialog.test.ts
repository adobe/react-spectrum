// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes divider', `
import {Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<Dialog>
  <Heading>Test</Heading>
  <Divider />
  <Content>Content</Content>
</Dialog>
`);

test('Moves close function from DialogTrigger to Dialog', `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  {(close) => 
    <Dialog>
      <Heading>Test</Heading>
      <Divider />
      <Content>Content</Content>
    </Dialog>
  }
</DialogTrigger>
`);

test('bails when it cannot move the close function', `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  {(close) => 
    <ReusableDialog />
  }
</DialogTrigger>
`);
