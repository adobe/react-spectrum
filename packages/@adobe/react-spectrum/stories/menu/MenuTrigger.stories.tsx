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

import {action} from 'storybook/actions';
import {ActionButton} from '../../src/button/ActionButton';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import {Content} from '../../src/view/Content';
import {ContextualHelpTrigger} from '../../src/menu/ContextualHelpTrigger';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Dialog} from '../../src/dialog/Dialog';
import {Footer} from '../../src/view/Footer';
import {Heading} from '../../src/text/Heading';
import {Item} from 'react-stately/Item';
import {Keyboard} from '../../src/text/Keyboard';
import {Link} from '../../src/link/Link';
import {Menu} from '../../src/menu/Menu';
import {MenuTrigger} from '../../src/menu/MenuTrigger';
import {Meta, StoryObj} from '@storybook/react';
import Paste from '@spectrum-icons/workflow/Paste';
import React, {JSX, useState} from 'react';
import {Section} from 'react-stately/Section';
import {Text} from '../../src/text/Text';
import {ToggleButton} from '../../src/button/ToggleButton';
import {TranslateMenu} from './../../chromatic/menu/MenuTriggerLanguages.stories';

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
  {
    name: 'Section 1',
    children: [
      {name: 'Copy', icon: 'Copy', shortcut: '⌘C'},
      {name: 'Cut', icon: 'Cut', shortcut: '⌘X'},
      {name: 'Paste', icon: 'Paste', shortcut: '⌘V'}
    ]
  },
  {
    name: 'Section 2',
    children: [
      {name: 'Puppy', icon: 'AlignLeft', shortcut: '⌘P'},
      {name: 'Doggo', icon: 'AlignCenter', shortcut: '⌘D'},
      {name: 'Floof', icon: 'AlignRight', shortcut: '⌘F'},
      {
        name: 'hasChildren',
        children: [
          {name: 'Thailand', icon: 'Blower', shortcut: '⌘T'},
          {name: 'Germany', icon: 'Book', shortcut: '⌘G'}
        ]
      }
    ]
  }
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
  {name: 'Animals', children: [{name: 'Aardvark'}, {name: 'Kangaroo'}, {name: 'Snake'}]},
  {
    name: 'People',
    children: [
      {name: 'Danni'},
      {name: 'Devon'},
      {name: 'Ross', children: [{name: 'Tests', children: [{name: 'blah'}]}]}
    ]
  }
];

let withSectionManyItems = [
  {
    id: 'section1',
    name: 'Section 1',
    children: Array(50)
      .fill({name: 'Item'})
      .map((item, i) => ({id: i.toString(), name: `Item ${i}`}))
  },
  {
    id: 'section2',
    name: 'Section 2',
    children: Array(50)
      .fill({name: 'Item'})
      .map((item, i) => ({id: (i + 50).toString(), name: `Item ${i + 50}`}))
  }
];

let itemsWithFalsyId = [
  {
    id: 1,
    name: 'Animals',
    children: [
      {id: 0, name: 'id=0'},
      {id: 2, name: 'Snake'}
    ]
  },
  {
    id: 3,
    name: 'People',
    children: [
      {id: 4, name: 'Danni'},
      {id: 5, name: 'Devon'},
      {id: 6, name: 'Ross', children: [{id: 7, name: 'Tests', children: [{id: 8, name: 'blah'}]}]}
    ]
  }
];

export default {
  title: 'MenuTrigger',
  excludeStories: ['render']
} as Meta<typeof MenuTrigger>;

export type MenuTriggerStoryFn = StoryObj<typeof MenuTrigger>;
export type MenuTriggerStory = StoryObj<typeof MenuTrigger>;

export const DefaultMenuStatic: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu onAction={action('onAction')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Menu>
    ),
  name: 'default menu (static)'
};

export const DefaultMenuGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu items={flatMenu} onAction={action('onAction')}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Menu>
    ),
  name: 'default menu (generative)'
};

export const DefaultMenuWSectionStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'default menu w/ section (static)'
};

export const DefaultMenuWSectionGenerative: MenuTriggerStoryFn = {
  render: () => render(defaultMenu),
  name: 'default menu w/ section (generative)'
};

export const DefaultMenuWSectionGenerativeManyItems: MenuTriggerStoryFn = {
  render: () => render(manyItemsMenu),
  name: 'default menu w/ section (generative), many items per section'
};

export const DefaultMenuWTitlelessSectionsStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'default menu w/ titleless sections (static)'
};

export const DefaultMenuWTitlelessSectionsGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu items={withSection} onAction={action('onAction')}>
        {item => (
          <Section key={item.name} items={item.children} aria-label={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    ),
  name: 'default menu w/ titleless sections (generative)'
};

export const WithFalsyItemKeys: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu items={itemsWithFalsyId} onAction={action('onAction')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    ),
  name: 'with falsy item keys'
};

export const SingleSelectedKeyControlledStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'single selected key (controlled, static)'
};

export const SingleSelectedKeyControlledGenerative: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {selectedKeys: ['Kangaroo'], selectionMode: 'single'}),
  name: 'single selected key (controlled, generative)'
};

export const SingleDefaultSelectedKeyUncontrolledStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'single default selected key (uncontrolled, static)'
};

export const SingleDefaultSelectedKeyUncontrolledGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(defaultMenu, {}, {defaultSelectedKeys: ['Kangaroo'], selectionMode: 'single'}),
  name: 'single default selected key (uncontrolled, generative)'
};

export const MultipleDefaultSelectedKeyControlledStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'multiple default selected key (controlled, static)'
};

export const MultipleSelectedKeyControlledGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(defaultMenu, {}, {selectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'}),
  name: 'multiple selected key (controlled, generative)'
};

export const MultipleDefaultSelectedKeyUncontrolledStatic: MenuTriggerStoryFn = {
  render: () =>
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
    ),
  name: 'multiple default selected key (uncontrolled, static)'
};

export const MultipleDefaultSelectedKeyUncontrolledGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(
      defaultMenu,
      {},
      {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'}
    ),
  name: 'multiple default selected key (uncontrolled, generative)'
};

export const MenuWithAutoFocusTrue: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {autoFocus: true}),
  name: 'Menu with autoFocus=true'
};

export const MenuWithAutoFocusFalse: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {autoFocus: false}),
  name: 'Menu with autoFocus=false'
};

export const MenuWithAutoFocusTrueDefaultSelectedKeyUncontrolledSelectionModeSingle: MenuTriggerStoryFn =
  {
    render: () =>
      render(
        defaultMenu,
        {},
        {autoFocus: true, selectionMode: 'single', defaultSelectedKeys: ['Kangaroo']}
      ),
    name: 'Menu with autoFocus=true, default selected key (uncontrolled), selectionMode single'
  };

export const MenuWithAutoFocusFirst: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {autoFocus: 'first'}),
  name: 'Menu with autoFocus="first"'
};

export const MenuWithAutoFocusLast: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {autoFocus: 'last'}),
  name: 'Menu with autoFocus="last"'
};

export const MenuWithKeyboardSelectionWrappingFalse: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {shouldFocusWrap: false}),
  name: 'Menu with keyboard selection wrapping false'
};

export const AlignEnd: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu onAction={action('onAction')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Menu>,
      {align: 'end'}
    ),
  name: 'align="end"'
};

export const DirectionTop: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'top'}),
  name: 'direction="top"'
};

export const DirectionBottom: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'bottom'}),
  name: 'direction="bottom"'
};

export const DirectionStart: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'start'}),
  name: 'direction="start"'
};

export const DirectionStartAlignEnd: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'start', align: 'end'}),
  name: 'direction="start", align="end"'
};

export const DirectionEnd: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'end'}),
  name: 'direction="end"'
};

export const DirectionEndAlignEnd: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'end', align: 'end'}),
  name: 'direction="end", align="end"'
};

export const DirectionLeft: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'left'}),
  name: 'direction="left"'
};

export const DirectionLeftAlignEnd: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'left', align: 'end'}),
  name: 'direction="left", align="end"'
};

export const DirectionRight: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'right'}),
  name: 'direction="right"'
};

export const DirectionRightAlignEnd: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {direction: 'right', align: 'end'}),
  name: 'direction="right", align="end"'
};

export const ShouldFlip: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {shouldFlip: true}),
  name: 'shouldFlip'
};

export const IsOpen: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {isOpen: true}),
  name: 'isOpen'
};

export const DefaultOpen: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {defaultOpen: true}),
  name: 'defaultOpen'
};

export const DisabledButton: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {isDisabled: true}),
  name: 'disabled button'
};

export const MultiselectMenu: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {selectionMode: 'multiple'}),
  name: 'multiselect menu'
};

export const NoSelectionAllowedMenu: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {}, {selectionMode: 'none'}),
  name: 'no selection allowed menu'
};

export const CloseOnSelectFalse: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {closeOnSelect: false}, {}),
  name: 'closeOnSelect=false'
};

export const CloseOnSelectTrueMultiselectMenu: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {closeOnSelect: true}, {selectionMode: 'multiple'}),
  name: 'closeOnSelect=true, multiselect menu'
};

export const MenuWithSemanticElementsStatic: MenuTriggerStoryFn = {
  render: () => (
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
  ),
  name: 'menu with semantic elements (static)'
};

export const MenuWithSemanticElementsGenerative: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu items={hardModeProgrammatic} onAction={action('onAction')}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => customMenuItem(item)}
          </Section>
        )}
      </Menu>
    ),
  name: 'menu with semantic elements (generative)'
};

export const MenuShouldPreventScrolling: MenuTriggerStoryFn = {
  render: () => (
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
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => (
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
  ),
  name: 'menu should prevent scrolling'
};

export const MenuClosesOnBlur: MenuTriggerStoryFn = {
  render: () => (
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
            {item => (
              <Section key={item.name} items={item.children} title={item.name}>
                {item => (
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
  ),
  name: 'menu closes on blur'
};

export const WithFalsyKey: MenuTriggerStoryFn = {
  render: () =>
    render(
      <Menu onAction={action('onAction')}>
        <Item key="1">One</Item>
        <Item key="">Two</Item>
        <Item key="3">Three</Item>
      </Menu>
    ),
  name: 'with falsy key'
};

export const MenuTriggerWithTriggerLongPress: MenuTriggerStoryFn = {
  render: () => render(defaultMenu, {trigger: 'longPress'}),
  name: 'MenuTrigger with trigger="longPress"'
};

export const ControlledIsOpen: MenuTriggerStoryFn = {
  render: () => <ControlledOpeningMenuTrigger />,
  name: 'controlled isOpen'
};

export const WithTranslations: MenuTriggerStoryFn = {
  render: () => <TranslateMenu />,
  name: 'with translations',
  parameters: {
    description: {
      data: 'Translations included for: Arabic, English, Hebrew, Japanese, Korean, Simplified Chinese, and Traditional Chinese.'
    }
  }
};

let customMenuItem = item => {
  let Icon = iconMap[item.icon];
  return (
    <Item childItems={item.children} textValue={item.name} key={item.name}>
      {item.icon && <Icon />}
      <Text>{item.name}</Text>
      {item.shortcut && <Keyboard>{item.shortcut}</Keyboard>}
    </Item>
  );
};

export function render(
  menu: React.ReactElement,
  {isDisabled, ...props}: any = {},
  menuProps = {}
): JSX.Element {
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
        {(item: any) => (
          <Item key={item.name} childItems={item.children}>
            {item.name}
          </Item>
        )}
      </Section>
    )}
  </Menu>
);

let manyItemsMenu = (
  <Menu items={withSectionManyItems} onAction={action('action')}>
    {(item: any) => (
      <Section key={item.name} items={item.children} title={item.name}>
        {(item: any) => (
          <Item key={item.name} childItems={item.children}>
            {item.name}
          </Item>
        )}
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
  render: () =>
    render(
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
            <Footer>
              <Link>Learn more</Link>
            </Footer>
          </Dialog>
        </ContextualHelpTrigger>
        <Item key="5">Five</Item>
      </Menu>
    )
};

export let MenuItemUnavailableWithSelection: StoryObj<typeof Menu> = {
  render: () =>
    render(
      <Menu selectionMode="multiple">
        <Item key="1">One</Item>
        <ContextualHelpTrigger isUnavailable>
          <Item key="foo">Two</Item>
          <Dialog>
            <Heading>hello</Heading>
            <Content>Is it me you're looking for?</Content>
          </Dialog>
        </ContextualHelpTrigger>
        <ContextualHelpTrigger isUnavailable={false}>
          <Item key="baz">Two point five</Item>
          <Dialog>
            <Heading>hello</Heading>
            <Content>Is it me you're looking for?</Content>
          </Dialog>
        </ContextualHelpTrigger>
        <Item key="3">Three</Item>
        <ContextualHelpTrigger isUnavailable={false}>
          <Item key="bar" textValue="Four">
            <Text>Four</Text>
            <Text slot={'description'}>Shut the door</Text>
          </Item>
          <Dialog>
            <Heading>hello</Heading>
            <Content>Is it me you're looking for?</Content>
            <Footer>
              <Link>Learn more</Link>
            </Footer>
          </Dialog>
        </ContextualHelpTrigger>
        <Item key="5">Five</Item>
      </Menu>
    )
};

export let MenuItemUnavailableDynamic: StoryObj<typeof Menu> = {
  render: () =>
    render(
      <Menu items={flatMenu} onAction={action('onAction')}>
        {item => {
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
      <ToggleButton isSelected={isUnavailable} onChange={setIsUnavailable}>
        Toggle item 2
      </ToggleButton>
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
          <ActionButton>Menu Button</ActionButton>
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
                <Footer>
                  <Link>Learn more</Link>
                </Footer>
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

export const MenuWithLinks: StoryObj<typeof Menu> = {
  render: props =>
    render(
      <Menu {...props} onAction={action('onAction')}>
        <Item href="https://adobe.com">Adobe</Item>
        <Item href="https://google.com">Google</Item>
        <Item href="https://apple.com">Apple</Item>
      </Menu>
    ),
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
