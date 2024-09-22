// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static - Renames Item to MenuItem, Section to MenuSection', `
import {Menu, MenuTrigger, Item, SubmenuTrigger, Button, Section, Header, Heading} from '@adobe/react-spectrum';
<div>
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
      <Section title="Section heading">
        <Item>Save</Item>
      </Section>
    </Menu>
  </MenuTrigger>
</div>
`);

test('Static - Renames key to id', `
import {Menu, MenuTrigger, Item, SubmenuTrigger, Button, Section, Header, Heading} from '@adobe/react-spectrum';
<div>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu>
      <Item key="cut">Cut</Item>
      <Item key="copy">Copy</Item>
      <Item key="paste">Paste</Item>
      <SubmenuTrigger>
        <Item key="share">Share</Item>
        <Menu>
          <Item key="sms">SMS</Item>
          <Item key="email">Email</Item>
        </Menu>
      </SubmenuTrigger>
      <Section title="Section heading">
        <Item key="save">Save</Item>
      </Section>
    </Menu>
  </MenuTrigger>
</div>
`);

test('Dynamic - Renames Item to MenuItem with Submenu, Section to MenuSection', `
import {Menu, MenuTrigger, Item, SubmenuTrigger, Button, Section} from '@adobe/react-spectrum';
const items = [
  { id: 'copy', name: 'Copy' },
  { id: 'cut', name: 'Cut' },
  { id: 'paste', name: 'Paste' },
  {
    id: 'share', name: 'Share',
    children: [
      { id: 'email', name: 'Email' },
      { id: 'SMS', name: 'SMS' }
    ]
  },
  {
    id: 'save', name: 'Save', isSection: true,
    children: [
      {id: 'folder', name: 'Folder'},
      {id: 'file', name: 'File'}
    ]
  }
];
<div>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu items={items}>
      {function renderSubmenu(item) {
        if (item.children) {
          if (item.isSection) {
            return (
              <Section items={item.children}>
                {(item) => {
                  if (item.children) {
                    return (
                      <SubmenuTrigger>
                        <Item>{item.name}</Item>
                        <Menu items={item.children}>
                          {(item) => renderSubmenu(item)}
                        </Menu>
                      </SubmenuTrigger>
                    )
                  } else {
                    return <Item>{item.name}</Item>
                  }
                }}
              </Section>
            )
          } else {
            return (
              <SubmenuTrigger>
                <Item>{item.name}</Item>
                <Menu items={item.children}>
                  {(item) => renderSubmenu(item)}
                </Menu>
              </SubmenuTrigger>
            )
          }
        } else {
          return <Item>{item.name}</Item>
        }
      }}
    </Menu>
  </MenuTrigger>
</div>
`);

test('Dynamic - Renames key to id', `
import {Menu, MenuTrigger, Item, SubmenuTrigger, Button} from '@adobe/react-spectrum';
const items = [
  { key: 'copy', name: 'Copy' },
  { key: 'cut', name: 'Cut' },
  { key: 'paste', name: 'Paste' },
  {
    key: 'share', name: 'Share',
    children: [
      { key: 'email', name: 'Email' },
      { key: 'sms', name: 'SMS' }
    ]
  }
];
<div>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu items={items}>
      {function renderSubmenu(item) {
        if (item.children) {
          return (
            <SubmenuTrigger>
              <Item key={item.key}>{item.name}</Item>
              <Menu items={item.children}>
                {(item) => renderSubmenu(item)}
              </Menu>  
            </SubmenuTrigger>
          )
        } else {
          return <Item key={item.key}>{item.name}</Item>
        }
      }}
    </Menu>
  </MenuTrigger>
</div>
`);


test('Leaves comment if no parent component detected for an Item', `
import {Menu, MenuTrigger, Item, Button} from '@adobe/react-spectrum';

const items = [
  { key: 'copy', name: 'Copy' },
  { key: 'cut', name: 'Cut' },
  { key: 'paste', name: 'Paste' }
].map(item => <Item key={item.key}>{item.name}</Item>);

<div>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu>
      {items}
    </Menu>
  </MenuTrigger>
</div>
`);

test('Leaves comment if no parent component detected for a Section', `
import {Menu, MenuTrigger, Item, Button, Section} from '@adobe/react-spectrum';

const sections = [
  { key: 'copy', name: 'Copy', children: [{key: 'item', name: 'Item'}] },
  { key: 'cut', name: 'Cut', children: [] },
  { key: 'paste', name: 'Paste', children: [] }
].map(section => (
  <Section key={section.key}>
    {section.children.map(item => <Item key={item.key}>{item.name}</Item>)}
  </Section>
));

<div>
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu>
      {items}
    </Menu>
  </MenuTrigger>
</div>
`);
