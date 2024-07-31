// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Renames variants', `
import {ProgressBar} from '@adobe/react-spectrum';
<div>
  <ProgressBar variant="overBackground"/>
</div>
`);


test('Comments out labelPosition', `
import {ProgressBar} from '@adobe/react-spectrum';
<div>
  <ProgressBar labelPosition="side" />
  <ProgressBar labelPosition="top" />
</div>
`);

test('Removes showValueLabel', `
import {ProgressBar} from '@adobe/react-spectrum';
<div>
  <ProgressBar showValueLabel />
  <ProgressBar showValueLabel={true} />
  <ProgressBar showValueLabel={false} />
</div>
`);
