// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to Breadcrumb and adds import', `
import {Breadcrumbs, Item, Menu, MenuTrigger, SubmenuTrigger, Button, Section, Header, Heading} from '@adobe/react-spectrum';

<div>
  <Breadcrumbs>
    <Item key="home">Home</Item>
    <Item key="trendy">Trendy</Item>
    <Item key="march 2020 assets">March 2020 Assets</Item>
  </Breadcrumbs>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu>
      <Item>Cut</Item>
      <Item>Copy</Item>
      <Item>Paste</Item>
      <SubmenuTrigger>
        <Item>Share</Item>
        <Menu>
          <Item>SMS</Item>
          <Item>Email</Item>
        </Menu>
      </SubmenuTrigger>
      <Section>
        <Header>
          <Heading>Section heading</Heading>
        </Header>
        <Item>Save</Item>
      </Section>
    </Menu>
  </MenuTrigger>
</div>
`);

test('Does not affect unimplemented collections', `
import {Item, ActionBarContainer, ActionBar, ListView, ListBox} from '@adobe/react-spectrum';
import {SearchAutocomplete} from '@react-spectrum/autocomplete';
import {StepList} from '@react-spectrum/steplist';

<div>
  <SearchAutocomplete>
    <Item key="one">One</Item>
    <Item key="two">Two</Item>
    <Item key="three">Three</Item>
  </SearchAutocomplete>
  <ActionBarContainer height={300} maxWidth="size-6000">
    <ListView>
      <Item key="photoshop">Adobe Photoshop</Item>
      <Item key="illustrator">Adobe Illustrator</Item>
      <Item key="xd">Adobe XD</Item>
    </ListView>
    <ActionBar>
      <Item key="one">One</Item>
      <Item key="two">Two</Item>
      <Item key="three">Three</Item>
    </ActionBar>
  </ActionBarContainer>
  <StepList>
    <Item key="one">One</Item>
    <Item key="two">Two</Item>
    <Item key="three">Three</Item>
  </StepList>
  <ListBox>
    <Item key="one">One</Item>
    <Item key="two">Two</Item>
    <Item key="three">Three</Item>
  </ListBox>
</div>
`);
