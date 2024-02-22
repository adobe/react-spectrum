// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Handles dimensions', `
import {Button} from '@adobe/react-spectrum';

<Button marginX="size-200" marginY={20} width="100%">Test</Button>
`);

test('Handles renamed components', `
import {Button as RSPButton} from '@adobe/react-spectrum';

<RSPButton marginX="size-200" marginY={20} width="100%">Test</RSPButton>
`);

test('Adds a comment when a variable is used', `
import {Button} from '@adobe/react-spectrum';

<Button marginX={margin}>Test</Button>
`);

test('Adds a comment when a spread is used', `
import {Button} from '@adobe/react-spectrum';

<Button marginX="size-200" {...otherProps}>Test</Button>
`);

test('Handles Flex', `
import {Flex} from '@adobe/react-spectrum';

<Flex direction="column" alignItems="center" gap="size-200" wrap>Test</Flex>
`);

test('Handles Grid', `
import {Grid} from '@adobe/react-spectrum';

<Grid
  areas={[
    'header  header',
    'sidebar content',
    'footer  footer'
  ]}
  columns={['1fr', '3fr']}
  rows={['size-1000', 'auto', 'size-1000']}
  height="size-6000"
  gap="size-100">
  Test
</Grid>
`);

test('Handles View', `
import {View} from '@adobe/react-spectrum';

<View
  borderWidth="thin"
  borderColor="dark"
  borderRadius="medium"
  padding="size-250"
  backgroundColor="blue-600"
  flex>
  Test
</View>
`);

test('Handles View colorVersion={5}', `
import {View} from '@adobe/react-spectrum';

<View
  borderWidth="thin"
  borderColor="gray-300"
  borderRadius="medium"
  padding="size-250"
  backgroundColor="blue-600"
  colorVersion={5}>
  Test
</View>
`);

test('Handles View colorVersion={6}', `
import {View} from '@adobe/react-spectrum';

<View
  borderWidth="thin"
  borderColor="gray-300"
  borderRadius="medium"
  padding="size-250"
  backgroundColor="blue-600"
  colorVersion={6}>
  Test
</View>
`);

test('Handles responsive style props', `
import {TextField} from '@adobe/react-spectrum';

<TextField label="Name" width={{ base: 'size-2000', L: 'size-5000' }} />
`);

test('Handles UNSAFE_style', `
import {View} from '@adobe/react-spectrum';

<View
  UNSAFE_style={{
    color: isErrorState ? 'var(--spectrum-red-900)' : 'var(--spectrum-gray-900)',
    borderWidth: border === 'thin' ? 'var(--spectrum-alias-border-size-thin)' : 'var(--spectrum-alias-border-size-thick)',
    borderRadius: isRounded(props) ? 4 : 0,
    display: 'flex',
    gap: 'var(--spectrum-global-dimension-size-200)',
    fontSize: 'var(--spectrum-global-dimension-font-size-100)',
    fontWeight: 'var(--spectrum-global-font-weight-bold)',
    gridTemplateAreas: '"foo bar" "baz qux"',
    transitionDuration: 'var(--spectrum-global-animation-duration-200)'
  }}>
  Test
</View>
`);

test('Bails on UNSAFE_style if it contains a spread', `
import {View} from '@adobe/react-spectrum';

<View
  UNSAFE_style={{
    color: 'var(--spectrum-gray-900)',
    ...otherStyles
  }}>
  Test
</View>
`);

test('Adds a comment to UNSAFE_className', `
import {Button} from '@adobe/react-spectrum';

<Button UNSAFE_className="hi">
  Test
</Button>
`);

test('Converts UNSAFE_className to className on View', `
import {View} from '@adobe/react-spectrum';

<View UNSAFE_className="hi">
  Test
</View>
`);

test('Merges UNSAFE_className with macro className', `
import {View} from '@adobe/react-spectrum';

<View UNSAFE_className="hi" marginX="size-200">
  Test
</View>
`);

test('Handles responsive style props', `
import {TextField} from '@adobe/react-spectrum';

<TextField label="Name" width={{ base: 'size-2000', L: 'size-5000' }} />
`);
