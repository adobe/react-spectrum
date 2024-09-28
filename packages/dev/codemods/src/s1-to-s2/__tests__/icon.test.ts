// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Remove Icon and tells people to use compiler? import as svg?', `
import {Icon} from '@adobe/react-spectrum';

function CustomIcon(props) {
  return (
    <Icon {...props}>
      <svg viewBox="0 0 36 36">
        <path d="M18.477.593,22.8,12.029l12.212.578a.51.51,0,0,1,.3.908l-9.54,7.646,3.224,11.793a.51.51,0,0,1-.772.561L18,26.805,7.78,33.515a.51.51,0,0,1-.772-.561l3.224-11.793L.692,13.515a.51.51,0,0,1,.3-.908L13.2,12.029,17.523.593A.51.51,0,0,1,18.477.593Z" />
      </svg>
    </Icon>
  );
}
`);

test('Migrate S1 icon with same name to S2', `
import Add from '@spectrum-icons/workflow/Add';

<Add />;
`);

test('Migrate S1 icon with different name to S2', `
import Alert from '@spectrum-icons/workflow/Alert';

<Alert />;
`);

test('Migrate custom-named S1 icon to S2. Keep name as custom name.', `
import AlertIcon from '@spectrum-icons/workflow/Alert';
import Alert from 'elsewhere';

<div>
  <AlertIcon />
  <Alert />
</div>
`);

test('Migrate S1 icon with different name to S2. Keep name if already taken in scope.', `
import Alert from '@spectrum-icons/workflow/Alert';
import AlertTriangle from 'elsewhere';

<div>
  <Alert />
  <AlertTriangle />
</div>
`);

test('Leave comment if no matching S2 icon found', `
import AssetCheck from '@spectrum-icons/workflow/AssetCheck';

<AssetCheck />;
`);

test('Does not affect existing S2 icons', `
import Add from '@react-spectrum/s2/icons/Add';

<Add />;
`);
