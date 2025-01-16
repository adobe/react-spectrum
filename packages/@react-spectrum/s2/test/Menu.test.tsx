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

import {AriaMenuTests} from '../../../react-aria-components/test/AriaMenu.test-util';
import {Button, Collection, Header, Heading, Menu, MenuItem, MenuSection, MenuTrigger, SubmenuTrigger} from '../src';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {Selection} from '@react-types/shared';

// better to accept items from the test? or just have the test have a requirement that you render a certain-ish structure?
// what about the button label?
// where and how can i define the requirements/assumptions for setup for the test?
let withSection = [
  {id: 'heading 1', name: 'Heading 1', children: [
    {id: 'foo', name: 'Foo'},
    {id: 'bar', name: 'Bar'},
    {id: 'baz', name: 'Baz'}
  ]}
];

let items = [
  {id: 'foo', name: 'Foo'},
  {id: 'bar', name: 'Bar'},
  {id: 'baz', name: 'Baz'}
];

function SelectionStatic(props)  {
  let {selectionMode = 'single'} = props;
  let [selected, setSelected] = React.useState<Selection>(new Set());
  return (
    <MenuTrigger>
      <Button variant="primary">Menu Button</Button>
      <Menu
        aria-label="Test"
        selectionMode={selectionMode}
        selectedKeys={selected}
        onSelectionChange={setSelected}>
        <MenuSection>
          <Header>Heading 1</Header>
          <MenuItem id="foo">Foo</MenuItem>
          <MenuItem id="bar">Bar</MenuItem>
          <MenuItem id="baz">Baz</MenuItem>
          <MenuItem id="fizz">Fizz</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}

AriaMenuTests({
  prefix: 'spectrum2-static',
  renderers: {
    standard: () => render(
      <MenuTrigger>
        <Button variant="primary">Menu Button</Button>
        <Menu aria-label="Test">
          <MenuSection>
            <Header><Heading>Heading 1</Heading></Header>
            <MenuItem>Foo</MenuItem>
            <MenuItem>Bar</MenuItem>
            <MenuItem>Baz</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    ),
    disabledTrigger: () => render(
      <MenuTrigger>
        <Button variant="primary" isDisabled>Menu Button</Button>
        <Menu aria-label="Test">
          <MenuSection>
            <Header><Heading>Heading 1</Heading></Header>
            <MenuItem>Foo</MenuItem>
            <MenuItem>Bar</MenuItem>
            <MenuItem>Baz</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    ),
    singleSelection: () => render(
      <SelectionStatic />
    ),
    multipleSelection: () => render(
      <SelectionStatic selectionMode="multiple" />
    ),
    submenus: () => render(
      <MenuTrigger>
        <Button variant="primary">Menu Button</Button>
        <Menu aria-label="Test">
          <MenuSection>
            <Header><Heading>Heading 1</Heading></Header>

            <MenuItem id="open">Open</MenuItem>
            <MenuItem id="rename">Rename…</MenuItem>
            <MenuItem id="duplicate">Duplicate</MenuItem>
            <SubmenuTrigger>
              <MenuItem id="share">Share…</MenuItem>
              <Menu>
                <MenuSection>
                  <Header><Heading>Subheading 1</Heading></Header>
                  <MenuItem id="email">Email…</MenuItem>
                  <SubmenuTrigger>
                    <MenuItem id="share">Share…</MenuItem>
                    <Menu>
                      <MenuSection>
                        <Header><Heading>Subheading 1</Heading></Header>
                        <MenuItem id="work">Work</MenuItem>
                        <MenuItem id="personal">Personal</MenuItem>
                      </MenuSection>
                    </Menu>
                  </SubmenuTrigger>
                  <MenuItem id="sms">SMS</MenuItem>
                  <MenuItem id="x">X</MenuItem>
                </MenuSection>
              </Menu>
            </SubmenuTrigger>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    )
  }
});

AriaMenuTests({
  prefix: 'spectrum2-dynamic',
  renderers: {
    standard: () => render(
      <MenuTrigger>
        <Button variant="primary">Menu Button</Button>
        <Menu aria-label="Test" items={withSection}>
          {(section) => {
            return (
              <MenuSection>
                <Header><Heading>{section.name}</Heading></Header>
                <Collection items={section.children}>
                  {item => {
                    return <MenuItem>{item.name}</MenuItem>;
                  }}
                </Collection>
              </MenuSection>
            );
          }}
        </Menu>
      </MenuTrigger>
    ),
    disabledTrigger: () => render(
      <MenuTrigger>
        <Button variant="primary" isDisabled>Menu Button</Button>
        <Menu aria-label="Test" items={withSection}>
          {(section) => {
            return (
              <MenuSection>
                <Header><Heading>{section.name}</Heading></Header>
                <Collection items={section.children}>
                  {item => {
                    return <MenuItem>{item.name}</MenuItem>;
                  }}
                </Collection>
              </MenuSection>
            );
          }}
        </Menu>
      </MenuTrigger>
    )
  }
});

AriaMenuTests({
  prefix: 'spectrum2-dynamic-no-section',
  renderers: {
    standard: () => render(
      <MenuTrigger>
        <Button variant="primary">Menu Button</Button>
        <Menu aria-label="Test" items={items}>
          {(item) =>
            <MenuItem>{item.name}</MenuItem>
          }
        </Menu>
      </MenuTrigger>
    )
  }
});
