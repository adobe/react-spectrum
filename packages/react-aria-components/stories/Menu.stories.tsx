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
import {Button, Header, Keyboard, Menu, MenuTrigger, Popover, Section, Separator, Text} from 'react-aria-components';
import {MyMenuItem} from './utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const MenuExample = () => (
  <MenuTrigger>
    <Button aria-label="Menu">☰</Button>
    <Popover>
      <Menu className={styles.menu} onAction={action('onAction')}>
        <Section className={styles.group}>
          <Header style={{fontSize: '1.2em'}}>Section 1</Header>
          <MyMenuItem>Foo</MyMenuItem>
          <MyMenuItem>Bar</MyMenuItem>
          <MyMenuItem>Baz</MyMenuItem>
          <MyMenuItem href="https://google.com">Google</MyMenuItem>
        </Section>
        <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
        <Section className={styles.group}>
          <Header style={{fontSize: '1.2em'}}>Section 2</Header>
          <MyMenuItem>Foo</MyMenuItem>
          <MyMenuItem>Bar</MyMenuItem>
          <MyMenuItem>Baz</MyMenuItem>
        </Section>
      </Menu>
    </Popover>
  </MenuTrigger>
);

export const MenuComplex = () => (
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
