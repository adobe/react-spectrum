// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const testSubset = (name: string, input: string, components: string) => {
  defineSnapshotTest(transform, {components}, input, name);
};

testSubset(
  'Should update multiple components provided to --components option',
  `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`,
  'Button,TextArea'
);

testSubset(
  'Should only update components provided to --components option',
  `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`,
  'Button'
);

testSubset(
  'Should not update components that are not provided to --components option',
  `
import {Button, TextArea} from '@adobe/react-spectrum';

<div>
  <Button variant="cta">Test</Button>
  <Button variant="overBackground">Test</Button>
  <TextArea isQuiet />
</div>
`,
  'TableView'
);

testSubset(
  'Should update related TableView components provided to --components option',
  `
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@adobe/react-spectrum';

<TableView>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`,
  'TableView'
);

testSubset(
  'Should only update ComboBox related shared components provided to --components option',
  `
import {ComboBox, Menu, MenuTrigger, Button, Section, Item} from '@adobe/react-spectrum';

<>
  <ComboBox>
    <Section title="Animals">
      <Item key="dog">Dog</Item>
      <Item key="cat">Cat</Item>
    </Section>
  </ComboBox>
  <MenuTrigger>
    <Button>Open</Button>
    <Menu>
      <Section title="Actions">
        <Item key="cut">Cut</Item>
      </Section>
    </Menu>
  </MenuTrigger>
</>
`,
  'ComboBox'
);

testSubset(
  'Should update Menu related components provided to --components option',
  `
import {Breadcrumbs, Menu, MenuTrigger, SubmenuTrigger, ContextualHelpTrigger, Item, Section, Button, Dialog, Heading, Content} from '@adobe/react-spectrum';

<>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu>
      <Item key="undo">Undo</Item>
      <SubmenuTrigger>
        <Item key="share">Share</Item>
        <Menu>
          <Item key="sms">SMS</Item>
        </Menu>
      </SubmenuTrigger>
      <Section title="Help">
        <ContextualHelpTrigger isUnavailable>
          <Item key="cut">Cut</Item>
          <Dialog>
            <Heading>Cut</Heading>
            <Content>Please select text for Cut to be enabled.</Content>
          </Dialog>
        </ContextualHelpTrigger>
      </Section>
    </Menu>
  </MenuTrigger>
  <Breadcrumbs>
    <Item key="home">Home</Item>
  </Breadcrumbs>
</>
`,
  'Menu'
);

testSubset(
  'Should update Tabs related components provided to --components option',
  `
import {Tabs, TabList, TabPanels, Item} from '@adobe/react-spectrum';

<Tabs aria-label="History of Ancient Rome">
  <TabList>
    <Item key="FoR">Founding of Rome</Item>
    <Item key="MaR">Monarchy and Republic</Item>
  </TabList>
  <TabPanels>
    <Item key="FoR">Arma virumque cano, Troiae qui primus ab oris.</Item>
    <Item key="MaR">Senatus Populusque Romanus.</Item>
  </TabPanels>
</Tabs>
`,
  'Tabs'
);

testSubset(
  'Should update DialogTrigger related components provided to --components option',
  `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  <Dialog>
    <Heading>Test</Heading>
    <Divider />
    <Content>Content</Content>
  </Dialog>
</DialogTrigger>
`,
  'DialogTrigger'
);

testSubset(
  'Should update TooltipTrigger related components provided to --components option',
  `
import {ActionButton, TooltipTrigger, Tooltip} from '@adobe/react-spectrum';

<TooltipTrigger>
  <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
  <Tooltip placement="bottom left" showIcon>Change Name</Tooltip>
</TooltipTrigger>
`,
  'TooltipTrigger'
);

testSubset(
  'Should update ActionGroup related components provided to --components option',
  `
import {ActionGroup, Item} from '@adobe/react-spectrum';

<ActionGroup onAction={onAction}>
  <Item key="add">Add</Item>
  <Item key="delete">Delete</Item>
  <Item key="edit">Edit</Item>
</ActionGroup>
`,
  'ActionGroup'
);
