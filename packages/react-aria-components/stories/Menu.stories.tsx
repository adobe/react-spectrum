/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {Button, Header, Heading, Input, Keyboard, Label, Menu, MenuSection, MenuTrigger, Popover, Separator, SubmenuTrigger, SubmenuTriggerProps, Text, TextField} from 'react-aria-components';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {MyMenuItem} from './utils';
import React, {JSX} from 'react';
import styles from '../example/index.css';
import './styles.css';

export default {
  title: 'React Aria Components/Menu',
  component: Menu
} as Meta<typeof Menu>;

export type MenuStory = StoryFn<typeof Menu>;

export const MenuExample: MenuStory = () => (
  <MenuTrigger>
    <Button aria-label="Menu">☰</Button>
    <Popover>
      <Menu className={styles.menu} onAction={action('onAction')}>
        <MenuSection className={styles.group} aria-label={'Section 1'}>
          <MyMenuItem>Foo</MyMenuItem>
          <MyMenuItem>Bar</MyMenuItem>
          <MyMenuItem>Baz</MyMenuItem>
          <MyMenuItem href="https://google.com">Google</MyMenuItem>
        </MenuSection>
        <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
        <MenuSection className={styles.group}>
          <Header style={{fontSize: '1.2em'}}>Section 2</Header>
          <MyMenuItem>Foo</MyMenuItem>
          <MyMenuItem>Bar</MyMenuItem>
          <MyMenuItem>Baz</MyMenuItem>
        </MenuSection>
      </Menu>
    </Popover>
  </MenuTrigger>
);

export const MenuComplex: MenuStory = () => (
  <MenuTrigger>
    <Button aria-label="Menu">☰</Button>
    <Popover>
      <Menu className={styles.menu}>
        <MyMenuItem>
          <Text slot="label">Copy</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘C</Keyboard>
        </MyMenuItem>
        <MyMenuItem>
          <Text slot="label">Cut</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘X</Keyboard>
        </MyMenuItem>
        <MyMenuItem>
          <Text slot="label">Paste</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘V</Keyboard>
        </MyMenuItem>
      </Menu>
    </Popover>
  </MenuTrigger>
);

export const MenuScrollPaddingExample: MenuStory = () => (
  <MenuTrigger>
    <Button aria-label="Menu">☰</Button>
    <Popover>
      <Menu
        className={styles.menu}
        onAction={action('onAction')}
        style={{
          maxHeight: 200,
          position: 'relative',
          scrollPaddingTop: '25px',
          scrollPaddingBottom: '25px',
          paddingBottom: '25px' // needed due to absolute-positioned footer
        }}>
        <Header
          style={{
            fontSize: '1.2em',
            position: 'sticky',
            top: 0,
            height: '25px',
            background: 'lightgray',
            borderBottom: '1px solid gray'
          }}>
          Section 1
        </Header>
        {Array.from({length: 30}).map((_, i) => (
          <MyMenuItem key={i}>Item {i + 1}</MyMenuItem>
        ))}
      </Menu>
      {/* Menu doesn't have a footer, so have to put one outside to
        and position it absolutely to demo scroll padding bottom support. */}
      <div
        style={{
          fontSize: '1.2em',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '24px', // with the border it'll be 25px
          borderTop: '1px solid gray',
          background: 'lightgray'
        }}>
        A footer
      </div>
    </Popover>
  </MenuTrigger>
);

function SubmenuExampleRender(args: Omit<SubmenuTriggerProps, 'children'> & {delay: number}): JSX.Element {
  return (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu className={styles.menu} onAction={action('onAction')}>
          <MyMenuItem id="Foo">Foo</MyMenuItem>
          <SubmenuTrigger {...args}>
            <MyMenuItem id="Bar">Bar</MyMenuItem>
            <Popover className={styles.popover}>
              <Menu className={styles.menu} onAction={action('onAction')}>
                <MyMenuItem id="Submenu Foo">Submenu Foo</MyMenuItem>
                <MyMenuItem id="Submenu Bar">Submenu Bar</MyMenuItem>
                <MyMenuItem id="Submenu Baz">Submenu Baz</MyMenuItem>
              </Menu>
            </Popover>
          </SubmenuTrigger>
          <MyMenuItem id="Baz">Baz</MyMenuItem>
          <MyMenuItem id="Google" href="https://google.com">Google</MyMenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
type SubmenuExampleStory = StoryObj<typeof SubmenuExampleRender>;
export const SubmenuExample: SubmenuExampleStory = {
  render: (args) => <SubmenuExampleRender {...args} />,
  args: {
    delay: 200
  },
  argTypes: {
    delay: {
      control: 'number'
    }
  }
};

export const SubmenuNestedExample: SubmenuExampleStory = {
  render: (args) => (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu className={styles.menu} onAction={action('onAction')}>
          <MyMenuItem id="Foo">Foo</MyMenuItem>
          <SubmenuTrigger {...args}>
            <MyMenuItem id="Bar">Bar</MyMenuItem>
            <Popover className={styles.popover}>
              <Menu className={styles.menu} onAction={action('onAction')}>
                <MyMenuItem id="Submenu Foo">Submenu Foo</MyMenuItem>
                <MyMenuItem id="Submenu Bar">Submenu Bar</MyMenuItem>
                <SubmenuTrigger {...args}>
                  <MyMenuItem id="Submenu Baz">Submenu Baz</MyMenuItem>
                  <Popover className={styles.popover}>
                    <Menu className={styles.menu} onAction={action('onAction')}>
                      <MyMenuItem id="Second Submenu Foo">Second Submenu Foo</MyMenuItem>
                      <MyMenuItem id="Second Submenu Bar">Second Submenu Bar</MyMenuItem>
                      <MyMenuItem id="Second Submenu Baz">Second Submenu Baz</MyMenuItem>
                    </Menu>
                  </Popover>
                </SubmenuTrigger>
              </Menu>
            </Popover>
          </SubmenuTrigger>
          <MyMenuItem id="Baz">Baz</MyMenuItem>
          <MyMenuItem id="Google" href="https://google.com">Google</MyMenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  ),
  args: {
    delay: 200
  },
  argTypes: {
    delay: {
      control: 'number'
    }
  }
};

let manyItemsSubmenu = [
  {id: 'Lvl 1 Item 1', name: 'Lvl 1 Item 1'},
  {id: 'Lvl 1 Item 2', name: 'Lvl 1 Item 2', children: [
    ...[...Array(30)].map((_, i) => ({id: `Lvl 2 Item ${i + 1}`, name: `Lvl 2 Item ${i + 1}`})),
    {id: 'Lvl 2 Item 31', name: 'Lvl 2 Item 31', children: [
      {id: 'Lvl 3 Item 1', name: 'Lvl 3 Item 1'},
      {id: 'Lvl 3 Item 2', name: 'Lvl 3 Item 2'},
      {id: 'Lvl 3 Item 3', name: 'Lvl 3 Item 3'}
    ]}
  ]},
  ...[...Array(30)].map((_, i) => ({id: `Lvl 1 Item ${i + 3}`, name: `Lvl 1 Item ${i + 3}`}))
];

let dynamicRenderFunc = (item, args) => {
  if (item.children) {
    return (
      <SubmenuTrigger {...args}>
        <MyMenuItem key={item.name}>{item.name}</MyMenuItem>
        <Popover className={styles.popover}>
          <Menu items={item.children} className={styles.menu} onAction={action('onAction')}>
            {(item) => dynamicRenderFunc(item, args)}
          </Menu>
        </Popover>
      </SubmenuTrigger>
    );
  } else {
    return <MyMenuItem key={item.name}>{item.name}</MyMenuItem>;
  }
};

export const SubmenuManyItemsExample: SubmenuExampleStory = {
  render: (args) => (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu items={manyItemsSubmenu} className={styles.menu} onAction={action('onAction')}>
          {(item) => dynamicRenderFunc(item, args)}
        </Menu>
      </Popover>
    </MenuTrigger>
  ),
  args: {
    delay: 200
  },
  argTypes: {
    delay: {
      control: 'number'
    }
  }
};

export const SubmenuDisabledExample: SubmenuExampleStory = {
  render: (args) => (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu className={styles.menu} onAction={action('onAction')} disabledKeys={['Bar']}>
          <MyMenuItem id="Foo">Foo</MyMenuItem>
          <SubmenuTrigger {...args}>
            <MyMenuItem id="Bar">Bar</MyMenuItem>
            <Popover className={styles.popover}>
              <Menu className={styles.menu} onAction={action('onAction')}>
                <MyMenuItem id="Submenu Foo">Submenu Foo</MyMenuItem>
                <MyMenuItem id="Submenu Bar">Submenu Bar</MyMenuItem>
                <MyMenuItem id="Submenu Baz">Submenu Baz</MyMenuItem>
              </Menu>
            </Popover>
          </SubmenuTrigger>
          <MyMenuItem id="Baz">Baz</MyMenuItem>
          <MyMenuItem id="Google" href="https://google.com">Google</MyMenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  ),
  args: {
    delay: 200
  },
  argTypes: {
    delay: {
      control: 'number'
    }
  }
};

export const SubmenuSectionsExample: SubmenuExampleStory = {
  render: (args) => (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu className={styles.menu} onAction={action('onAction')}>
          <MenuSection className={styles.group}>
            <Header style={{fontSize: '1.2em'}}>Section 1</Header>
            <MyMenuItem>Foo</MyMenuItem>
            <SubmenuTrigger {...args}>
              <MyMenuItem id="Bar">Bar</MyMenuItem>
              <Popover className={styles.popover}>
                <Menu className={styles.menu} onAction={action('onAction')}>
                  <MenuSection className={styles.group}>
                    <Header style={{fontSize: '1.2em'}}>Submenu Section 1</Header>
                    <MyMenuItem id="Submenu Foo">Submenu Foo</MyMenuItem>
                    <MyMenuItem id="Submenu Bar">Submenu Bar</MyMenuItem>
                    <MyMenuItem id="Submenu Baz">Submenu Baz</MyMenuItem>
                    <MyMenuItem href="https://google.com">Google</MyMenuItem>
                  </MenuSection>
                  <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
                  <MenuSection className={styles.group}>
                    <Header style={{fontSize: '1.2em'}}>Submenu Section 2</Header>
                    <MyMenuItem id="Submenu Foo 2">Submenu Foo</MyMenuItem>
                    <MyMenuItem id="Submenu Bar 2">Submenu Bar</MyMenuItem>
                    <MyMenuItem id="Submenu Baz 2">Submenu Baz</MyMenuItem>
                  </MenuSection>
                </Menu>
              </Popover>
            </SubmenuTrigger>
            <MyMenuItem>Baz</MyMenuItem>
            <MyMenuItem href="https://google.com">Google</MyMenuItem>
          </MenuSection>
          <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
          <MenuSection className={styles.group}>
            <Header style={{fontSize: '1.2em'}}>Section 2</Header>
            <MyMenuItem>Foo</MyMenuItem>
            <MyMenuItem>Bar</MyMenuItem>
            <MyMenuItem>Baz</MyMenuItem>
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  )
};

// TODO: figure out why it is autofocusing the Menu in the SubDialog
export const SubdialogExample: SubmenuExampleStory = {
  render: (args) => (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu className={styles.menu} onAction={action('onAction')}>
          <MyMenuItem id="Foo">Foo</MyMenuItem>
          <SubmenuTrigger {...args}>
            <MyMenuItem id="Bar">Bar</MyMenuItem>
            <Popover
              style={{
                background: 'Canvas',
                color: 'CanvasText',
                border: '1px solid gray',
                padding: 5
              }}>
              <form style={{display: 'flex', flexDirection: 'column'}}>
                <Heading slot="title">Sign up</Heading>
                <TextField autoFocus>
                  <Label>First Name: </Label>
                  <Input />
                </TextField>
                <TextField>
                  <Label>Last Name: </Label>
                  <Input />
                </TextField>
                <Menu>
                  <SubmenuTrigger {...args}>
                    <MyMenuItem>SubMenu</MyMenuItem>
                    <Popover
                      style={{
                        background: 'Canvas',
                        color: 'CanvasText',
                        border: '1px solid gray',
                        padding: 5
                      }}>
                      <Menu>
                        <MyMenuItem>1</MyMenuItem>
                        <MyMenuItem>2</MyMenuItem>
                        <MyMenuItem>3</MyMenuItem>
                      </Menu>
                    </Popover>
                  </SubmenuTrigger>
                  <SubmenuTrigger {...args}>
                    <MyMenuItem>SubDialog</MyMenuItem>
                    <Popover
                      style={{
                        background: 'Canvas',
                        color: 'CanvasText',
                        border: '1px solid gray',
                        padding: 5
                      }}>
                      <form style={{display: 'flex', flexDirection: 'column'}}>
                        <Heading slot="title">Contact</Heading>
                        <TextField autoFocus>
                          <Label>Email: </Label>
                          <Input />
                        </TextField>
                        <TextField>
                          <Label>Contact number: </Label>
                          <Input />
                        </TextField>
                        <Button style={{marginTop: 10}}>
                          Submit
                        </Button>
                      </form>
                    </Popover>
                  </SubmenuTrigger>
                  <MyMenuItem>C</MyMenuItem>
                </Menu>
                <Button style={{marginTop: 10}}>
                  Submit
                </Button>
              </form>
            </Popover>
          </SubmenuTrigger>
          <MyMenuItem id="Baz">Baz</MyMenuItem>
          <MyMenuItem id="Google" href="https://google.com">Google</MyMenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  ),
  args: {
    delay: 200
  },
  argTypes: {
    delay: {
      control: 'number'
    }
  }
};
