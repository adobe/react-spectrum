// @ts-ignore
import {defineInlineTest} from 'jscodeshift/dist/testUtils';
import transform from './codemod';

function test(name: string, input: string, output: string) {
  defineInlineTest(transform, {}, input, output, name);
}

test(
  'rewrites individual react-aria imports',
  `
import {useButton} from '@react-aria/button';
`,
  `
import { useButton } from "react-aria";
`
);

test(
  'rewrites individual react-stately imports',
  `
import {useComboBoxState} from '@react-stately/combobox';
`,
  `
import { useComboBoxState } from "react-stately";
`
);

test(
  'rewrites individual react-spectrum imports',
  `
import {Button} from '@react-spectrum/button';
`,
  `
import { Button } from "@adobe/react-spectrum";
`
);

test(
  'does not re-write S2 imports',
  `
import {Button} from '@react-spectrum/s2';
`,
  `
import {Button} from '@react-spectrum/s2';
`
);
