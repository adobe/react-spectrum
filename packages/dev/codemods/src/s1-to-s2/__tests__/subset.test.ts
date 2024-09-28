// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const testSubset = (name: string, input: string, components: string) => {
  defineSnapshotTest(transform, {components}, input, name);
};

testSubset('Should update multiple components provided to --components option', `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`, 'Button,TextArea');

testSubset('Should only update components provided to --components option', `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`, 'Button');

testSubset('Should not update components that are not provided to --components option', `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`, 'TableView');
