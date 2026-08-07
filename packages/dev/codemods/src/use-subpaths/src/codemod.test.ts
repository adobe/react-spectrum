// @ts-ignore
import {defineInlineTest} from 'jscodeshift/dist/testUtils';
import transform from './codemod';

function test(name: string, input: string, output: string) {
  defineInlineTest(transform, {}, input, output, name);
}

test(
  'rewrites a uniquely mapped specifier',
  `
import {Accordion} from '@adobe/react-spectrum';
`,
  `
import { Accordion } from '@adobe/react-spectrum/Accordion';
`
);

test(
  'splits mixed uniquely mapped specifiers across subpaths',
  `
import {Accordion, Button} from '@adobe/react-spectrum';
`,
  `
import { Accordion } from '@adobe/react-spectrum/Accordion';
import { Button } from '@adobe/react-spectrum/Button';
`
);

test(
  'groups multi-mapped specifiers with a uniquely mapped import from the same declaration',
  `
import {ListView, Item} from '@adobe/react-spectrum';
`,
  `
import { ListView, Item } from '@adobe/react-spectrum/ListView';
`
);

test(
  'handles when Item is available in multiple existing imports',
  `
import {ListView, ActionGroup, Item} from '@adobe/react-spectrum';
`,
  `
import { ListView, Item } from '@adobe/react-spectrum/ListView';
import { ActionGroup } from '@adobe/react-spectrum/ActionGroup';
`
);

test(
  'handles multiple monopackage imports',
  `
import {ListView} from '@adobe/react-spectrum';
import {ActionGroup, Item} from '@adobe/react-spectrum';
`,
  `
import { ListView, Item } from '@adobe/react-spectrum/ListView';
import { ActionGroup } from '@adobe/react-spectrum/ActionGroup';
`
);

test(
  'reuses an existing matching subpath import elsewhere in the file',
  `
import {Item} from '@adobe/react-spectrum';
import {ListView} from '@adobe/react-spectrum/ListView';
`,
  `
import { ListView, Item } from '@adobe/react-spectrum/ListView';
`
);

test(
  'preserves aliases when moving specifiers',
  `
import {ListView as RSListView, Item as RSItem} from '@adobe/react-spectrum';
`,
  `
import { ListView as RSListView, Item as RSItem } from '@adobe/react-spectrum/ListView';
`
);

test(
  'keeps unsupported, default, and namespace imports untouched',
  `
import ReactSpectrum, {Accordion, fakeThing} from '@adobe/react-spectrum';
import * as RAC from 'react-aria-components';
`,
  `
import ReactSpectrum, { fakeThing } from '@adobe/react-spectrum';
import { Accordion } from '@adobe/react-spectrum/Accordion';
import * as RAC from 'react-aria-components';
`
);

test(
  'merges into an existing destination import',
  `
import {Disclosure} from '@adobe/react-spectrum';
import {Accordion} from '@adobe/react-spectrum/Accordion';
`,
  `
import { Accordion, Disclosure } from '@adobe/react-spectrum/Accordion';
`
);

test(
  'leaves already subpathed imports unchanged',
  `
import {Accordion} from '@adobe/react-spectrum/Accordion';
`,
  `
import {Accordion} from '@adobe/react-spectrum/Accordion';
`
);

test(
  'groups by import kind',
  `
import {Button, ButtonContext} from 'react-aria-components';
import type {ButtonProps} from 'react-aria-components';
`,
  `
import { Button, ButtonContext } from 'react-aria-components/Button';
import type { ButtonProps } from 'react-aria-components/Button';
`
);

test(
  'sorts exact match candidates first',
  `
import {Group, GroupProps} from 'react-aria-components';
`,
  `
import { Group, GroupProps } from 'react-aria-components/Group';
`
);

test(
  'combines related imports',
  `
import {RangeCalendar, CalendarCell, Heading} from 'react-aria-components';
`,
  `
import { RangeCalendar, CalendarCell, Heading } from 'react-aria-components/RangeCalendar';
`
);

test(
  'rewrites declare module for RouterConfig on @react-spectrum/s2 to Provider subpath',
  `
declare module '@react-spectrum/s2' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`,
  `
declare module '@react-spectrum/s2/Provider' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`
);

test(
  'rewrites declare module for RouterConfig on @adobe/react-spectrum to Provider subpath',
  `
declare module '@adobe/react-spectrum' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`,
  `
declare module '@adobe/react-spectrum/Provider' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`
);

test(
  'leaves declare module on an existing Provider subpath unchanged',
  `
declare module '@react-spectrum/s2/Provider' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`,
  `
declare module '@react-spectrum/s2/Provider' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`
);

test(
  'does not rewrite react-aria-components declare module when there is no Provider subpath',
  `
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`,
  `
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: { x: string };
  }
}
`
);

test(
  'does not rewrite declare module on root package when not augmenting RouterConfig',
  `
declare module '@react-spectrum/s2' {
  interface SomethingElse {
    x: string;
  }
}
`,
  `
declare module '@react-spectrum/s2' {
  interface SomethingElse {
    x: string;
  }
}
`
);
