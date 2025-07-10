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
import {Content, Footer} from '@react-spectrum/view';
import {ContextualHelpTrigger, Item, Menu, MenuTrigger, Section} from '../';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Dialog} from '@react-spectrum/dialog';
import {Heading, Keyboard, Text} from '@react-spectrum/text';
import {Link} from '@react-spectrum/link';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import Paste from '@spectrum-icons/workflow/Paste';
import React, {JSX, useState} from 'react';
import {ToggleButton} from '@adobe/react-spectrum';
import {TranslateMenu} from './../chromatic/MenuTriggerLanguages.stories';

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

let withSectionManyItems = [
  {id: 'section1', name: 'Section 1', children: Array(50).fill({name: 'Item'}).map((item, i) => ({id: i.toString(), name: `Item ${i}`}))},
  {id: 'section2', name: 'Section 2', children: Array(50).fill({name: 'Item'}).map((item, i) => ({id: (i + 50).toString(), name: `Item ${i + 50}`}))}
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
  title: 'MenuTrigger',
  excludeStories: ['render']
} as Meta<typeof MenuTrigger>;

export type MenuTriggerStoryFn = StoryFn<typeof MenuTrigger>;
export type MenuTriggerStory = StoryObj<typeof MenuTrigger>;

export const DefaultMenuStatic: MenuTriggerStoryFn = () =>
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

export const DefaultMenuGenerative: MenuTriggerStoryFn = () =>
  render(
    <Menu items={flatMenu} onAction={action('onAction')}>
      {(item) => <Item key={item.name}>{item.name}</Item>}
    </Menu>
  );

DefaultMenuGenerative.story = {
  name: 'default menu (generative)'
};

export const DefaultMenuWSectionStatic: MenuTriggerStoryFn = () =>
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

export const DefaultMenuWSectionGenerative: MenuTriggerStoryFn = () => render(defaultMenu);

DefaultMenuWSectionGenerative.story = {
  name: 'default menu w/ section (generative)'
};

export const DefaultMenuWSectionGenerativeManyItems: MenuTriggerStoryFn = () => render(manyItemsMenu);

DefaultMenuWSectionGenerativeManyItems.story = {
  name: 'default menu w/ section (generative), many items per section'
};

export const DefaultMenuWTitlelessSectionsStatic: MenuTriggerStoryFn = () =>
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

export const DefaultMenuWTitlelessSectionsGenerative: MenuTriggerStoryFn = () =>
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

export const WithFalsyItemKeys: MenuTriggerStoryFn = () =>
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

export const SingleSelectedKeyControlledStatic: MenuTriggerStoryFn = () =>
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

export const SingleSelectedKeyControlledGenerative: MenuTriggerStoryFn = () =>
  render(defaultMenu, {}, {selectedKeys: ['Kangaroo'], selectionMode: 'single'});

SingleSelectedKeyControlledGenerative.story = {
  name: 'single selected key (controlled, generative)'
};

export const SingleDefaultSelectedKeyUncontrolledStatic: MenuTriggerStoryFn = () =>
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

export const SingleDefaultSelectedKeyUncontrolledGenerative: MenuTriggerStoryFn = () =>
  render(defaultMenu, {}, {defaultSelectedKeys: ['Kangaroo'], selectionMode: 'single'});

SingleDefaultSelectedKeyUncontrolledGenerative.story = {
  name: 'single default selected key (uncontrolled, generative)'
};

export const MultipleDefaultSelectedKeyControlledStatic: MenuTriggerStoryFn = () =>
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

export const MultipleSelectedKeyControlledGenerative: MenuTriggerStoryFn = () =>
  render(defaultMenu, {}, {selectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'});

MultipleSelectedKeyControlledGenerative.story = {
  name: 'multiple selected key (controlled, generative)'
};

export const MultipleDefaultSelectedKeyUncontrolledStatic: MenuTriggerStoryFn = () =>
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

export const MultipleDefaultSelectedKeyUncontrolledGenerative: MenuTriggerStoryFn = () =>
  render(
    defaultMenu,
    {},
    {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'}
  );

MultipleDefaultSelectedKeyUncontrolledGenerative.story = {
  name: 'multiple default selected key (uncontrolled, generative)'
};

export const MenuWithAutoFocusTrue: MenuTriggerStoryFn = () => render(defaultMenu, {}, {autoFocus: true});

MenuWithAutoFocusTrue.story = {
  name: 'Menu with autoFocus=true'
};

export const MenuWithAutoFocusFalse: MenuTriggerStoryFn = () => render(defaultMenu, {}, {autoFocus: false});

MenuWithAutoFocusFalse.story = {
  name: 'Menu with autoFocus=false'
};

export const MenuWithAutoFocusTrueDefaultSelectedKeyUncontrolledSelectionModeSingle: MenuTriggerStoryFn = () =>
  render(
    defaultMenu,
    {},
    {autoFocus: true, selectionMode: 'single', defaultSelectedKeys: ['Kangaroo']}
  );

MenuWithAutoFocusTrueDefaultSelectedKeyUncontrolledSelectionModeSingle.story = {
  name: 'Menu with autoFocus=true, default selected key (uncontrolled), selectionMode single'
};

export const MenuWithAutoFocusFirst: MenuTriggerStoryFn = () => render(defaultMenu, {}, {autoFocus: 'first'});

MenuWithAutoFocusFirst.story = {
  name: 'Menu with autoFocus="first"'
};

export const MenuWithAutoFocusLast: MenuTriggerStoryFn = () => render(defaultMenu, {}, {autoFocus: 'last'});

MenuWithAutoFocusLast.story = {
  name: 'Menu with autoFocus="last"'
};

export const MenuWithKeyboardSelectionWrappingFalse: MenuTriggerStoryFn = () =>
  render(defaultMenu, {}, {shouldFocusWrap: false});

MenuWithKeyboardSelectionWrappingFalse.story = {
  name: 'Menu with keyboard selection wrapping false'
};

export const AlignEnd: MenuTriggerStoryFn = () =>
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

export const DirectionTop: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'top'});

DirectionTop.story = {
  name: 'direction="top"'
};

export const DirectionBottom: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'bottom'});

DirectionBottom.story = {
  name: 'direction="bottom"'
};

export const DirectionStart: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'start'});

DirectionStart.story = {
  name: 'direction="start"'
};

export const DirectionStartAlignEnd: MenuTriggerStoryFn = () =>
  render(defaultMenu, {direction: 'start', align: 'end'});

DirectionStartAlignEnd.story = {
  name: 'direction="start", align="end"'
};

export const DirectionEnd: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'end'});

DirectionEnd.story = {
  name: 'direction="end"'
};

export const DirectionEndAlignEnd: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'end', align: 'end'});

DirectionEndAlignEnd.story = {
  name: 'direction="end", align="end"'
};

export const DirectionLeft: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'left'});

DirectionLeft.story = {
  name: 'direction="left"'
};

export const DirectionLeftAlignEnd: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'left', align: 'end'});

DirectionLeftAlignEnd.story = {
  name: 'direction="left", align="end"'
};

export const DirectionRight: MenuTriggerStoryFn = () => render(defaultMenu, {direction: 'right'});

DirectionRight.story = {
  name: 'direction="right"'
};

export const DirectionRightAlignEnd: MenuTriggerStoryFn = () =>
  render(defaultMenu, {direction: 'right', align: 'end'});

DirectionRightAlignEnd.story = {
  name: 'direction="right", align="end"'
};

export const ShouldFlip: MenuTriggerStoryFn = () => render(defaultMenu, {shouldFlip: true});

ShouldFlip.story = {
  name: 'shouldFlip'
};

export const IsOpen: MenuTriggerStoryFn = () => render(defaultMenu, {isOpen: true});

IsOpen.story = {
  name: 'isOpen'
};

export const DefaultOpen: MenuTriggerStoryFn = () => render(defaultMenu, {defaultOpen: true});

DefaultOpen.story = {
  name: 'defaultOpen'
};

export const DisabledButton: MenuTriggerStoryFn = () => render(defaultMenu, {isDisabled: true});

DisabledButton.story = {
  name: 'disabled button'
};

export const MultiselectMenu: MenuTriggerStoryFn = () => render(defaultMenu, {}, {selectionMode: 'multiple'});

MultiselectMenu.story = {
  name: 'multiselect menu'
};

export const NoSelectionAllowedMenu: MenuTriggerStoryFn = () => render(defaultMenu, {}, {selectionMode: 'none'});

NoSelectionAllowedMenu.story = {
  name: 'no selection allowed menu'
};

export const CloseOnSelectFalse: MenuTriggerStoryFn = () => render(defaultMenu, {closeOnSelect: false}, {});

CloseOnSelectFalse.story = {
  name: 'closeOnSelect=false'
};

export const CloseOnSelectTrueMultiselectMenu: MenuTriggerStoryFn = () =>
  render(defaultMenu, {closeOnSelect: true}, {selectionMode: 'multiple'});

CloseOnSelectTrueMultiselectMenu.story = {
  name: 'closeOnSelect=true, multiselect menu'
};

export const MenuWithSemanticElementsStatic: MenuTriggerStoryFn = () => (
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
            <Copy />
            <Text>Copy</Text>
            <Keyboard>⌘C</Keyboard>
          </Item>
          <Item textValue="Cut">
            <Cut />
            <Text>Cut</Text>
            <Keyboard>⌘X</Keyboard>
          </Item>
          <Item textValue="Paste">
            <Paste />
            <Text>Paste</Text>
            <Keyboard>⌘V</Keyboard>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item textValue="Puppy">
            <AlignLeft />
            <Text>Puppy</Text>
            <Text slot="description">Puppy description super long as well geez</Text>
          </Item>
          <Item textValue="Doggo with really really really long long long text">
            <AlignCenter />
            <Text>Doggo with really really really long long long text</Text>
            <Text slot="end">Value</Text>
          </Item>
          <Item textValue="Floof">
            <AlignRight />
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

export const MenuWithSemanticElementsGenerative: MenuTriggerStoryFn = () =>
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

export const MenuShouldPreventScrolling: MenuTriggerStoryFn = () => (
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

export const MenuClosesOnBlur: MenuTriggerStoryFn = () => (
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

export const WithFalsyKey: MenuTriggerStoryFn = () =>
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

export const MenuTriggerWithTriggerLongPress: MenuTriggerStoryFn = () => render(defaultMenu, {trigger: 'longPress'});

MenuTriggerWithTriggerLongPress.story = {
  name: 'MenuTrigger with trigger="longPress"'
};

export const ControlledIsOpen: MenuTriggerStoryFn = () => <ControlledOpeningMenuTrigger />;

ControlledIsOpen.story = {
  name: 'controlled isOpen'
};

export const WithTranslations: MenuTriggerStoryFn = () => <TranslateMenu />;

WithTranslations.story = {
  name: 'with translations',
  parameters: {description: {data: 'Translations included for: Arabic, English, Hebrew, Japanese, Korean, Simplified Chinese, and Traditional Chinese.'}}
};

let customMenuItem = (item) => {
  let Icon = iconMap[item.icon];
  return (
    <Item childItems={item.children} textValue={item.name} key={item.name}>
      {item.icon && <Icon />}
      <Text>{item.name}</Text>
      {item.shortcut && <Keyboard>{item.shortcut}</Keyboard>}
    </Item>
  );
};

export function render(menu: React.ReactElement, {isDisabled, ...props}: any = {}, menuProps = {}): JSX.Element {
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

let manyItemsMenu = (
  <Menu items={withSectionManyItems} onAction={action('action')}>
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

export let MenuItemUnavailable: StoryObj<typeof Menu> = {
  render: () => render(
    <Menu onAction={action('onAction')}>
      <Item key="1">One</Item>
      <ContextualHelpTrigger isUnavailable>
        <Item key="foo">Two</Item>
        <Dialog>
          <Heading>hello</Heading>
          <Content>Is it me you're looking for?</Content>
        </Dialog>
      </ContextualHelpTrigger>
      <ContextualHelpTrigger isUnavailable>
        <Item key="baz">Two point five</Item>
        <Dialog>
          <Heading>hello</Heading>
          <Content>Is it me you're looking for?</Content>
        </Dialog>
      </ContextualHelpTrigger>
      <Item key="3">Three</Item>
      <ContextualHelpTrigger isUnavailable>
        <Item key="bar" textValue="Four">
          <Text>Four</Text>
          <Text slot={'description'}>Shut the door</Text>
        </Item>
        <Dialog>
          <Heading>hello</Heading>
          <Content>Is it me you're looking for?</Content>
          <Footer><Link>Learn more</Link></Footer>
        </Dialog>
      </ContextualHelpTrigger>
      <Item key="5">Five</Item>
    </Menu>
  )
};

export let MenuItemUnavailableDynamic: StoryObj<typeof Menu> = {
  render: () => render(
    <Menu items={flatMenu} onAction={action('onAction')}>
      {(item) => {
        if (item.name === 'Kangaroo') {
          return (
            <ContextualHelpTrigger isUnavailable>
              <Item key={item.name}>{item.name}</Item>
              <Dialog>
                <Heading>hello</Heading>
                <Content>Is it me you're looking for?</Content>
              </Dialog>
            </ContextualHelpTrigger>
          );
        }
        return <Item key={item.name}>{item.name}</Item>;
      }}
    </Menu>
  )
};

export let MenuItemUnavailableToggling: StoryObj<typeof Menu> = {
  render: () => <MenuWithUnavailableSometimes />
};

function MenuWithUnavailableSometimes(props) {
  let [isUnavailable, setIsUnavailable] = useState(false);
  return (
    <>
      <ToggleButton isSelected={isUnavailable} onChange={setIsUnavailable}>Toggle item 2</ToggleButton>
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
          <ActionButton>
            Menu Button
          </ActionButton>
          <Menu onAction={action('onAction')}>
            <Item key="1">One</Item>
            <ContextualHelpTrigger isUnavailable={isUnavailable}>
              <Item key="foo">Two</Item>
              <Dialog>
                <Heading>hello</Heading>
                <Content>Is it me you're looking for?</Content>
              </Dialog>
            </ContextualHelpTrigger>
            <ContextualHelpTrigger isUnavailable>
              <Item key="baz">Two point five</Item>
              <Dialog>
                <Heading>hello</Heading>
                <Content>Is it me you're looking for?</Content>
              </Dialog>
            </ContextualHelpTrigger>
            <Item key="3">Three</Item>
            <ContextualHelpTrigger isUnavailable>
              <Item key="bar" textValue="Four">
                <Text>Four</Text>
                <Text slot={'description'}>Shut the door</Text>
              </Item>
              <Dialog>
                <Heading>hello</Heading>
                <Content>Is it me you're looking for?</Content>
                <Footer><Link>Learn more</Link></Footer>
              </Dialog>
            </ContextualHelpTrigger>
            <Item key="5">Five</Item>
          </Menu>
        </MenuTrigger>
      </div>
      <input />
    </>
  );
}

export const MenuWithLinks: StoryFn<typeof Menu> = (props) =>
  render(
    <Menu {...props} onAction={action('onAction')}>
      <Item href="https://adobe.com">Adobe</Item>
      <Item href="https://google.com">Google</Item>
      <Item href="https://apple.com">Apple</Item>
    </Menu>
  );

MenuWithLinks.story = {
  args: {
    selectionMode: 'none'
  },
  argTypes: {
    selectionMode: {
      control: {
        type: 'inline-radio',
        options: ['none', 'single', 'multiple']
      }
    }
  }
};
