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
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, Menu, MenuTrigger, Section} from '../';
import {Keyboard, Text} from '@react-spectrum/text';
import Paste from '@spectrum-icons/workflow/Paste';
import React, {useState} from 'react';

let iconMap = {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blower,
  Book,
  Copy,
  Cut,
  Paste
};

let hardModeProgrammatic = [
  {name: 'Section 1', children: [
    {name: 'Copy', icon: 'Copy', shortcut: '⌘C'},
    {name: 'Cut', icon: 'Cut', shortcut: '⌘X'},
    {name: 'Paste', icon: 'Paste', shortcut: '⌘V'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Puppy', icon: 'AlignLeft', shortcut: '⌘P'},
    {name: 'Doggo', icon: 'AlignCenter', shortcut: '⌘D'},
    {name: 'Floof', icon: 'AlignRight', shortcut: '⌘F'},
    {name: 'hasChildren', children: [
      {name: 'Thailand', icon: 'Blower', shortcut: '⌘T'},
      {name: 'Germany', icon: 'Book', shortcut: '⌘G'}
    ]}
  ]}
];

let flatMenu = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'},
  {name: 'Danni'},
  {name: 'Devon'},
  {name: 'Ross'},
  {name: 'Puppy'},
  {name: 'Doggo'},
  {name: 'Floof'}
];

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

let itemsWithFalsyId = [
  {id: 1, name: 'Animals', children: [
    {id: 0, name: 'id=0'},
    {id: 2, name: 'Snake'}
  ]},
  {id: 3, name: 'People', children: [
    {id: 4, name: 'Danni'},
    {id: 5, name: 'Devon'},
    {id: 6, name: 'Ross', children: [
      {id: 7, name: 'Tests', children: [
        {id: 8, name: 'blah'}
      ]}
    ]}
  ]}
];

export default {
  title: 'MenuTrigger'
};

export const DefaultMenuStatic = () =>
  render(
    <Menu onAction={action('onAction')}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Menu>
  );

DefaultMenuStatic.story = {
  name: 'default menu (static)'
};

export const DefaultMenuGenerative = () =>
  render(
    <Menu items={flatMenu} onAction={action('onAction')}>
      {(item) => <Item key={item.name}>{item.name}</Item>}
    </Menu>
  );

DefaultMenuGenerative.story = {
  name: 'default menu (generative)'
};

export const DefaultMenuWSectionStatic = () =>
  render(
    <Menu onAction={action('onAction')}>
      <Section title="Section 1">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Section>
      <Section title="Section 2">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Section>
    </Menu>
  );

DefaultMenuWSectionStatic.story = {
  name: 'default menu w/ section (static)'
};

export const DefaultMenuWSectionGenerative = () => render(defaultMenu);

DefaultMenuWSectionGenerative.story = {
  name: 'default menu w/ section (generative)'
};

export const DefaultMenuWTitlelessSectionsStatic = () =>
  render(
    <Menu onAction={action('onAction')}>
      <Section aria-label="Section 1">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Section>
      <Section aria-label="Section 2">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Section>
    </Menu>
  );

DefaultMenuWTitlelessSectionsStatic.story = {
  name: 'default menu w/ titleless sections (static)'
};

export const DefaultMenuWTitlelessSectionsGenerative = () =>
  render(
    <Menu items={withSection} onAction={action('onAction')}>
      {(item) => (
        <Section key={item.name} items={item.children} aria-label={item.name}>
          {(item) => <Item key={item.name}>{item.name}</Item>}
        </Section>
      )}
    </Menu>
  );

DefaultMenuWTitlelessSectionsGenerative.story = {
  name: 'default menu w/ titleless sections (generative)'
};

export const WithFalsyItemKeys = () =>
  render(
    <Menu items={itemsWithFalsyId} onAction={action('onAction')}>
      {(item) => (
        <Section items={item.children} title={item.name}>
          {(item) => <Item>{item.name}</Item>}
        </Section>
      )}
    </Menu>
  );

WithFalsyItemKeys.story = {
  name: 'with falsy item keys'
};

export const SingleSelectedKeyControlledStatic = () =>
  render(
    <Menu selectionMode="single" onAction={action('onAction')} selectedKeys={['2']}>
      <Section title="Section 1">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Section>
      <Section title="Section 2">
        <Item key="4">Four</Item>
        <Item key="5">Five</Item>
        <Item key="6">Six</Item>
        <Item key="7">Seven</Item>
      </Section>
    </Menu>
  );

SingleSelectedKeyControlledStatic.story = {
  name: 'single selected key (controlled, static)'
};

export const SingleSelectedKeyControlledGenerative = () =>
  render(defaultMenu, {}, {selectedKeys: ['Kangaroo'], selectionMode: 'single'});

SingleSelectedKeyControlledGenerative.story = {
  name: 'single selected key (controlled, generative)'
};

export const SingleDefaultSelectedKeyUncontrolledStatic = () =>
  render(
    <Menu selectionMode="single" onAction={action('onAction')} defaultSelectedKeys={['2']}>
      <Section title="Section 1">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Section>
      <Section title="Section 2">
        <Item key="4">Four</Item>
        <Item key="5">Five</Item>
        <Item key="6">Six</Item>
        <Item key="7">Seven</Item>
      </Section>
    </Menu>
  );

SingleDefaultSelectedKeyUncontrolledStatic.story = {
  name: 'single default selected key (uncontrolled, static)'
};

export const SingleDefaultSelectedKeyUncontrolledGenerative = () =>
  render(defaultMenu, {}, {defaultSelectedKeys: ['Kangaroo'], selectionMode: 'single'});

SingleDefaultSelectedKeyUncontrolledGenerative.story = {
  name: 'single default selected key (uncontrolled, generative)'
};

export const MultipleDefaultSelectedKeyControlledStatic = () =>
  render(
    <Menu
      onAction={action('onAction')}
      selectionMode="multiple"
      selectedKeys={['2', '5']}
      disabledKeys={['1', '3']}>
      <Section title="Section 1">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Section>
      <Section title="Section 2">
        <Item key="4">Four</Item>
        <Item key="5">Five</Item>
        <Item key="6">Six</Item>
      </Section>
    </Menu>
  );

MultipleDefaultSelectedKeyControlledStatic.story = {
  name: 'multiple default selected key (controlled, static)'
};

export const MultipleSelectedKeyControlledGenerative = () =>
  render(defaultMenu, {}, {selectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'});

MultipleSelectedKeyControlledGenerative.story = {
  name: 'multiple selected key (controlled, generative)'
};

export const MultipleDefaultSelectedKeyUncontrolledStatic = () =>
  render(
    <Menu
      onAction={action('onAction')}
      selectionMode="multiple"
      defaultSelectedKeys={['2', '5']}
      disabledKeys={['1', '3']}>
      <Section title="Section 1">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Section>
      <Section title="Section 2">
        <Item key="4">Four</Item>
        <Item key="5">Five</Item>
        <Item key="6">Six</Item>
      </Section>
    </Menu>
  );

MultipleDefaultSelectedKeyUncontrolledStatic.story = {
  name: 'multiple default selected key (uncontrolled, static)'
};

export const MultipleDefaultSelectedKeyUncontrolledGenerative = () =>
  render(
    defaultMenu,
    {},
    {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'}
  );

MultipleDefaultSelectedKeyUncontrolledGenerative.story = {
  name: 'multiple default selected key (uncontrolled, generative)'
};

export const MenuWithAutoFocusTrue = () => render(defaultMenu, {}, {autoFocus: true});

MenuWithAutoFocusTrue.story = {
  name: 'Menu with autoFocus=true'
};

export const MenuWithAutoFocusFalse = () => render(defaultMenu, {}, {autoFocus: false});

MenuWithAutoFocusFalse.story = {
  name: 'Menu with autoFocus=false'
};

export const MenuWithAutoFocusTrueDefaultSelectedKeyUncontrolledSelectionModeSingle = () =>
  render(
    defaultMenu,
    {},
    {autoFocus: true, selectionMode: 'single', defaultSelectedKeys: ['Kangaroo']}
  );

MenuWithAutoFocusTrueDefaultSelectedKeyUncontrolledSelectionModeSingle.story = {
  name: 'Menu with autoFocus=true, default selected key (uncontrolled), selectionMode single'
};

export const MenuWithAutoFocusFirst = () => render(defaultMenu, {}, {autoFocus: 'first'});

MenuWithAutoFocusFirst.story = {
  name: 'Menu with autoFocus="first"'
};

export const MenuWithAutoFocusLast = () => render(defaultMenu, {}, {autoFocus: 'last'});

MenuWithAutoFocusLast.story = {
  name: 'Menu with autoFocus="last"'
};

export const MenuWithKeyboardSelectionWrappingFalse = () =>
  render(defaultMenu, {}, {shouldFocusWrap: false});

MenuWithKeyboardSelectionWrappingFalse.story = {
  name: 'Menu with keyboard selection wrapping false'
};

export const AlignEnd = () =>
  render(
    <Menu onAction={action('onAction')}>
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </Menu>,
    {align: 'end'}
  );

AlignEnd.story = {
  name: 'align="end"'
};

export const DirectionTop = () => render(defaultMenu, {direction: 'top'});

DirectionTop.story = {
  name: 'direction="top"'
};

export const DirectionBottom = () => render(defaultMenu, {direction: 'bottom'});

DirectionBottom.story = {
  name: 'direction="bottom"'
};

export const DirectionStart = () => render(defaultMenu, {direction: 'start'});

DirectionStart.story = {
  name: 'direction="start"'
};

export const DirectionStartAlignEnd = () =>
  render(defaultMenu, {direction: 'start', align: 'end'});

DirectionStartAlignEnd.story = {
  name: 'direction="start", align="end"'
};

export const DirectionEnd = () => render(defaultMenu, {direction: 'end'});

DirectionEnd.story = {
  name: 'direction="end"'
};

export const DirectionEndAlignEnd = () => render(defaultMenu, {direction: 'end', align: 'end'});

DirectionEndAlignEnd.story = {
  name: 'direction="end", align="end"'
};

export const DirectionLeft = () => render(defaultMenu, {direction: 'left'});

DirectionLeft.story = {
  name: 'direction="left"'
};

export const DirectionLeftAlignEnd = () => render(defaultMenu, {direction: 'left', align: 'end'});

DirectionLeftAlignEnd.story = {
  name: 'direction="left", align="end"'
};

export const DirectionRight = () => render(defaultMenu, {direction: 'right'});

DirectionRight.story = {
  name: 'direction="right"'
};

export const DirectionRightAlignEnd = () =>
  render(defaultMenu, {direction: 'right', align: 'end'});

DirectionRightAlignEnd.story = {
  name: 'direction="right", align="end"'
};

export const ShouldFlip = () => render(defaultMenu, {shouldFlip: true});

ShouldFlip.story = {
  name: 'shouldFlip'
};

export const IsOpen = () => render(defaultMenu, {isOpen: true});

IsOpen.story = {
  name: 'isOpen'
};

export const DefaultOpen = () => render(defaultMenu, {defaultOpen: true});

DefaultOpen.story = {
  name: 'defaultOpen'
};

export const DisabledButton = () => render(defaultMenu, {isDisabled: true});

DisabledButton.story = {
  name: 'disabled button'
};

export const MultiselectMenu = () => render(defaultMenu, {}, {selectionMode: 'multiple'});

MultiselectMenu.story = {
  name: 'multiselect menu'
};

export const NoSelectionAllowedMenu = () => render(defaultMenu, {}, {selectionMode: 'none'});

NoSelectionAllowedMenu.story = {
  name: 'no selection allowed menu'
};

export const CloseOnSelectFalse = () => render(defaultMenu, {closeOnSelect: false}, {});

CloseOnSelectFalse.story = {
  name: 'closeOnSelect=false'
};

export const CloseOnSelectTrueMultiselectMenu = () =>
  render(defaultMenu, {closeOnSelect: true}, {selectionMode: 'multiple'});

CloseOnSelectTrueMultiselectMenu.story = {
  name: 'closeOnSelect=true, multiselect menu'
};

export const MenuWithSemanticElementsStatic = () => (
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
          <Item textValue="Copy">
            <Copy size="S" />
            <Text>Copy</Text>
            <Keyboard>⌘C</Keyboard>
          </Item>
          <Item textValue="Cut">
            <Cut size="S" />
            <Text>Cut</Text>
            <Keyboard>⌘X</Keyboard>
          </Item>
          <Item textValue="Paste">
            <Paste size="S" />
            <Text>Paste</Text>
            <Keyboard>⌘V</Keyboard>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item textValue="Puppy">
            <AlignLeft size="S" />
            <Text>Puppy</Text>
            <Text slot="description">Puppy description super long as well geez</Text>
          </Item>
          <Item textValue="Doggo with really really really long long long text">
            <AlignCenter size="S" />
            <Text>Doggo with really really really long long long text</Text>
            <Text slot="end">Value</Text>
          </Item>
          <Item textValue="Floof">
            <AlignRight size="S" />
            <Text>Floof</Text>
          </Item>
          <Item>Basic Item</Item>
        </Section>
      </Menu>
    </MenuTrigger>
  </div>
);

MenuWithSemanticElementsStatic.story = {
  name: 'menu with semantic elements (static)'
};

export const MenuWithSemanticElementsGenerative = () =>
  render(
    <Menu items={hardModeProgrammatic} onAction={action('onAction')}>
      {(item) => (
        <Section key={item.name} items={item.children} title={item.name}>
          {(item) => customMenuItem(item)}
        </Section>
      )}
    </Menu>
  );

MenuWithSemanticElementsGenerative.story = {
  name: 'menu with semantic elements (generative)'
};

export const MenuShouldPreventScrolling = () => (
  <div style={{height: 100, display: 'flex'}}>
    <div style={{paddingTop: 100, height: 100, overflow: 'auto', background: 'antiquewhite'}}>
      <div style={{height: 200}}>
        <div>Shouldn't be able to scroll here while Menu is open.</div>
        <MenuTrigger onOpenChange={action('onOpenChange')} defaultOpen>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
            Menu Button
          </ActionButton>
          <Menu items={withSection} onAction={action('action')}>
            {(item) => (
              <Section key={item.name} items={item.children} title={item.name}>
                {(item) => (
                  <Item key={item.name} childItems={item.children}>
                    {item.name}
                  </Item>
                )}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
      </div>
    </div>
    <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1, background: 'grey'}}>
      <div style={{height: 200}}>Also shouldn't be able to scroll here while Menu is open.</div>
    </div>
  </div>
);

MenuShouldPreventScrolling.story = {
  name: 'menu should prevent scrolling'
};

export const MenuClosesOnBlur = () => (
  <>
    <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
      <label htmlFor="focus-before">Focus before</label>
      <input id="focus-before" />
      <MenuTrigger onOpenChange={action('onOpenChange')}>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          Menu Button
        </ActionButton>
        <Menu items={withSection} onAction={action('action')} disabledKeys={['Snake', 'Ross']}>
          {(item) => (
            <Section key={item.name} items={item.children} title={item.name}>
              {(item) => (
                <Item key={item.name} childItems={item.children}>
                  {item.name}
                </Item>
              )}
            </Section>
          )}
        </Menu>
      </MenuTrigger>
      <label htmlFor="focus-after">Focus after</label>
      <input id="focus-after" />
    </div>
  </>
);

MenuClosesOnBlur.story = {
  name: 'menu closes on blur'
};

export const WithFalsyKey = () =>
  render(
    <Menu onAction={action('onAction')}>
      <Item key="1">One</Item>
      <Item key="">Two</Item>
      <Item key="3">Three</Item>
    </Menu>
  );

WithFalsyKey.story = {
  name: 'with falsy key'
};

export const MenuTriggerWithTriggerLongPress = () => render(defaultMenu, {trigger: 'longPress'});

MenuTriggerWithTriggerLongPress.story = {
  name: 'MenuTrigger with trigger="longPress"'
};

export const ControlledIsOpen = () => <ControlledOpeningMenuTrigger />;

ControlledIsOpen.story = {
  name: 'controlled isOpen'
};

let customMenuItem = (item) => {
  let Icon = iconMap[item.icon];
  return (
    <Item childItems={item.children} textValue={item.name} key={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
      {item.shortcut && <Keyboard>{item.shortcut}</Keyboard>}
    </Item>
  );
};

function render(menu, {isDisabled, ...props}: any = {}, menuProps = {}) {
  let menuRender = React.cloneElement(menu, menuProps);
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
        {menuRender}
      </MenuTrigger>
    </div>
  );
}

let defaultMenu = (
  <Menu items={withSection} onAction={action('action')} disabledKeys={['Snake', 'Ross']}>
    {(item: any) => (
      <Section key={item.name} items={item.children} title={item.name}>
        {(item: any) => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
      </Section>
    )}
  </Menu>
);

function ControlledOpeningMenuTrigger() {
  let [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
      <MenuTrigger onOpenChange={setIsOpen} isOpen={isOpen}>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          Menu Button
        </ActionButton>
        <Menu onAction={action('onAction')}>
          <Item key="1">One</Item>
          <Item key="">Two</Item>
          <Item key="3">Three</Item>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
