/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {ActionButton} from '@react-spectrum/button';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, Menu, MenuTrigger, Section} from '../';
import {Keyboard, Text} from '@react-spectrum/typography';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {storiesOf} from '@storybook/react';

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross', children: [
      {name: 'Tests', children: [
        {name: 'blah'}
      ]}
    ]}
  ]}
];

storiesOf('MenuTrigger', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'single selected key (controlled)',
    () => render({}, {selectedKeys: ['Kangaroo'], selectionMode: 'single'})
  )
  .add(
    'single default selected key (uncontrolled)',
    () => render({}, {defaultSelectedKeys: ['Kangaroo'], selectionMode: 'single'})
  )
  .add(
    'multiple selected key (controlled)',
    () => render({}, {selectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'})
  )
  .add(
    'multiple default selected key (uncontrolled)',
    () => render({}, {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'})
  )
  .add(
    'align="end"',
    () => render({align: 'end'})
  )
  .add(
    'direction="top"',
    () => render({direction: 'top'})
  )
  .add(
    'shouldFlip',
    () => render({shouldFlip: true})
  )
  .add(
    'isOpen',
    () => render({isOpen: true})
  )
  .add(
    'defaultOpen',
    () => render({defaultOpen: true})
  )
  .add(
    'disabled button',
    () => render({isDisabled: true})
  )
  .add(
    'multiselect menu',
    () => render({}, {selectionMode: 'multiple'})
  )
  .add(
    'no selection allowed menu',
    () => render({}, {selectionMode: 'none'})
  )
  .add(
    'closeOnSelect=false',
    () => render({closeOnSelect: false}, {})
  )
  .add(
    'menu with semantic elements',
    () => (
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button
          </ActionButton>
          <Menu onAction={action('action')}>
            <Section title="Section 1">
              <Item>
                <Copy size="S" />
                <Text>Copy</Text>
                <Keyboard>⌘C</Keyboard>
              </Item>
              <Item>
                <Cut size="S" />
                <Text>Cut</Text>
                <Keyboard>⌘X</Keyboard>
              </Item>
              <Item>
                <Paste size="S" />
                <Text>Paste</Text>
                <Keyboard>⌘V</Keyboard>
              </Item>
            </Section>
            <Section title="Section 2">
              <Item>
                <AlignLeft size="S" />
                <Text>Puppy</Text>
                <Text slot="description">Puppy description super long as well geez</Text>
              </Item>
              <Item>
                <AlignCenter size="S" />
                <Text>Doggo with really really really long long long text</Text>
                <Text slot="end">Value</Text>
                <ChevronRightMedium slot="keyboard" />
              </Item>
              <Item>
                <AlignRight size="S" />
                <Text>Floof</Text>
              </Item>
              <Item>
                Basic Item
              </Item>
            </Section>
          </Menu>
        </MenuTrigger>
      </div>
    )
  )
  .add(
    'menu closes on scroll',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', background: 'antiquewhite'}}>
          <div style={{height: 200}}>
            <div>Scrolling here will close the Menu</div>
            <MenuTrigger onOpenChange={action('onOpenChange')} defaultOpen>
              <ActionButton
                onPress={action('press')}
                onPressStart={action('pressstart')}
                onPressEnd={action('pressend')}>
                  Menu Button
              </ActionButton>
              <Menu items={withSection} itemKey="name" onAction={action('action')}>
                {item => (
                  <Section items={item.children} title={item.name}>
                    {item => <Item childItems={item.children}>{item.name}</Item>}
                  </Section>
                )}
              </Menu>
            </MenuTrigger>
          </div>
        </div>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1, background: 'grey'}}>
          <div style={{height: 200}}>
            Scrolling here won't close the Menu
          </div>
        </div>
      </div>
    )
  )
  .add(
    'menu closes on blur',
    () => (
      <>
        <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
          <input placeholder="Shift tab here" />
          <MenuTrigger onOpenChange={action('onOpenChange')}>
            <ActionButton
              onPress={action('press')}
              onPressStart={action('pressstart')}
              onPressEnd={action('pressend')}>
                Menu Button
            </ActionButton>
            <Menu items={withSection} itemKey="name" onAction={action('action')} disabledKeys={['Snake', 'Ross']}>
              {item => (
                <Section items={item.children} title={item.name}>
                  {item => <Item childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
          <input placeholder="Tab here" />
        </div>
      </>
    )
  );

function render({isDisabled, ...props}: any = {}, menuProps = {}) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
      <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
        <ActionButton
          isDisabled={isDisabled}
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
            Menu Button
        </ActionButton>
        <Menu items={withSection} itemKey="name" onAction={action('action')} disabledKeys={['Snake', 'Ross']} {...menuProps}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </MenuTrigger>
    </div>
  );
}
