// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('should replace named imports', `
import {Button} from '@adobe/react-spectrum';

<Button>Test</Button>
`);

test('should replace named imports from individual packages', `
import {Button} from '@react-spectrum/button';

<Button>Test</Button>
`);

test('should leave unimplemented components untouched', `
import {Button, Fake} from '@adobe/react-spectrum';

<>
  <Button>Test</Button>
  <Fake>Foo</Fake>
</>
`);

test('should keep import aliases', `
import {Button as RSPButton} from '@adobe/react-spectrum';

<RSPButton>Test</RSPButton>
`);

test('should not replace shadowed imports', `
import {Button} from '@adobe/react-spectrum';

function Test() {
  let Button = 'button';
  return <Button>Test</Button>;
}

<Button>Foo</Button>
`);

// TODO: Could pre problematic if user is only upgrading a subset of components
test('should keep namespace imports', `
import * as RSP from '@adobe/react-spectrum';

<RSP.Button>Test</RSP.Button>
`);

test('should leave unimplemented components untouched in namespace imports', `
import * as RSP from '@adobe/react-spectrum';

<>
  <RSP.Button>Test</RSP.Button>
  <RSP.Fake>Foo</RSP.Fake>
</>
`);

test('leaves a comment on dynamic imports', `
const LazyButton = React.lazy(() => import('@react-spectrum/button'))
`);

test('should not import Item from S2', `
import {Menu, ListView, Item} from '@adobe/react-spectrum';

<div>
  <Menu aria-label="Alignment">
    <Item>Left</Item>
    <Item>Middle</Item>
    <Item>Right</Item>
  </Menu>
  <ListView aria-label="Alignment">
    <Item>Left</Item>
    <Item>Middle</Item>
    <Item>Right</Item>
  </ListView>
</div>
`);

test('should not import Section from S2', `
import {Menu, Section, Item, ListBox} from '@adobe/react-spectrum';

<div>
  <Menu aria-label="Text">
    <Section title="Styles">
      <Item key="bold">Bold</Item>
      <Item key="underline">Underline</Item>
    </Section>
  </Menu>
  <ListBox aria-label="Text">
    <Section title="Styles">
      <Item key="bold">Bold</Item>
      <Item key="underline">Underline</Item>
    </Section>
  </ListBox>
</div>
`);

test('should use unique alias if newly imported component name is already in scope', `
import {TagGroup, Item} from '@adobe/react-spectrum';

const Tag = 'something else';

<div>
  <TagGroup aria-label="TagGroup items">
    <Item>News</Item>
    <Item>Travel</Item>
    <Item>Gaming</Item>
    <Item>Shopping</Item>
  </TagGroup>
</div>
`);

test('should preserve leading comment if first line is removed', `
/*
 * Some comment
 */
import {Button, StatusLight} from '@adobe/react-spectrum';

<>
  <Button>Test</Button>
  <StatusLight variant="positive">Test</StatusLight>
</>
`);

test('should remove unused Item/Section import even if name taken in different scope', `
import {Menu, Section, Item} from '@adobe/react-spectrum';

function foo() {
  let Item = 'something else';
  let Section = 'something else';
}

<div>
  <Menu aria-label="Text">
    <Section title="Styles">
      <Item key="bold">Bold</Item>
      <Item key="underline">Underline</Item>
    </Section>
  </Menu>
</div>
`);

test('should remove unused Item/Section import if aliased', `
import {Menu, Section as RSPSection, Item as RSPItem} from '@adobe/react-spectrum';
import {Section, Item} from 'elsewhere';

<div>
  <Section>
    <Item>Test</Item>
  </Section>
  <Menu aria-label="Text">
    <RSPSection title="Styles">
      <RSPItem key="bold"></RSPItem>
      <RSPItem key="underline">Underline</RSPItem>
    </RSPSection>
  </Menu>
</div>
`);
