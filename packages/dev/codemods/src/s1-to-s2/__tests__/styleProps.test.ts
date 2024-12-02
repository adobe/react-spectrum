/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Handles dimensions', `
import {Button} from '@adobe/react-spectrum';

<Button marginX="size-200" marginY={20} width="100%" minWidth="fit-content">Test</Button>
`);

test('Should keep import aliases', `
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

test('Leaves comment for invalid style props', `
import {TextField} from '@adobe/react-spectrum';

<TextField label="Name" width="250" />
`);

test('Updates left/right layout values to be start/end', `
import {Button, Flex} from '@adobe/react-spectrum';

<>
  <Flex alignContent="left">Test</Flex>
  <Flex alignItems="left">Test</Flex>
  <Flex justifyContent="left">Test</Flex>
  <Flex justifyItems="left">Test</Flex>
  <Button alignSelf="left">Test</Button>
  <Button justifySelf="left">Test</Button>

  <Flex alignContent="right">Test</Flex>
  <Flex alignItems="right">Test</Flex>
  <Flex justifyContent="right">Test</Flex>
  <Flex justifyItems="right">Test</Flex>
  <Button alignSelf="right">Test</Button>
  <Button justifySelf="right">Test</Button>
</>
`);

test('Should leave existing style macros unaffected', `  
import { TextField } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

<TextField label="Name" styles={style({width: 160})} />
`);
