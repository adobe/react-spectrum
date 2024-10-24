/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Header, Heading, Image, Keyboard, Menu, MenuItem, MenuSection, MenuTrigger, SubmenuTrigger, Text} from '../src';
import {categorizeArgTypes} from './utils';
import ClockPendingIcon from '../s2wf-icons/S2_Icon_ClockPending_20_N.svg';
import {CombinedMenu} from '../src/Menu';
import CommentTextIcon from '../s2wf-icons/S2_Icon_CommentText_20_N.svg';
import CommunityIcon from '../s2wf-icons/S2_Icon_Community_20_N.svg';
import CopyIcon from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import DeviceDesktopIcon from '../s2wf-icons/S2_Icon_DeviceDesktop_20_N.svg';
import DeviceTabletIcon from '../s2wf-icons/S2_Icon_DeviceTablet_20_N.svg';
import ImgIcon from '../s2wf-icons/S2_Icon_Image_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import More from '../s2wf-icons/S2_Icon_More_20_N.svg';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {Selection} from 'react-aria-components';
import {useState} from 'react';

const meta: Meta<typeof CombinedMenu> = {
  component: CombinedMenu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onAction', 'onClose', 'onOpenChange', 'onScroll', 'onSelectionChange'])
  },
  title: 'Menu'
};

export default meta;
type Story = StoryObj<typeof CombinedMenu>;

export const Example: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Actions for selected resource"><NewIcon /></Button>
        <Menu {...menuProps}>
          <MenuItem>Favorite</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Delete</MenuItem>
          <SubmenuTrigger>
            <MenuItem>Share</MenuItem>
            <Menu>
              <MenuItem>SMS</MenuItem>
              <MenuItem>Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>
    );
  }
};

Example.parameters = {
  docs: {
    source: {
      transform: () => {
        return `<MenuTrigger>
  <Button aria-label="Actions for selected resource"><NewIcon /></Button>
  <Menu>
    <MenuItem>Favorite</MenuItem>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Delete</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Share</MenuItem>
      <Menu>
        <MenuItem>SMS</MenuItem>
        <MenuItem>Email</MenuItem>
      </Menu>
    </SubmenuTrigger>
  </Menu>
</MenuTrigger>`;
      }
    }
  }
};

export const KeyboardShortcuts: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Menu {...menuProps} disabledKeys={['copy']}>
          <MenuItem id="cut" textValue="Cut"><Text slot="label">Cut</Text><Keyboard>⌘ Cmd + X</Keyboard></MenuItem>
          <MenuItem id="copy" textValue="Copy"><Text slot="label">Copy</Text><Keyboard>⌘ Cmd + C</Keyboard></MenuItem>
          <MenuItem id="paste" textValue="Paste"><Text slot="label">Paste</Text><Keyboard>⌘ Cmd + V</Keyboard></MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }
};

export const PublishAndExport: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button variant="accent">Publish</Button>
        <Menu {...menuProps}>
          <MenuSection>
            <Header>
              <Heading>Publish and export</Heading>
              <Text slot="description">Social media, other formats</Text>
            </Header>
            <MenuItem id="quick-export" textValue="quick export">
              <ImgIcon />
              <Text slot="label">Quick Export</Text>
              <Text slot="description">Share a low-res snapshot.</Text>
            </MenuItem>
            <SubmenuTrigger>
              <MenuItem id="open-in" textValue="open a copy">
                <CopyIcon />
                <Text slot="label">Open a copy</Text>
                <Text slot="description">Illustrator for iPad or desktop</Text>
              </MenuItem>
              <Menu selectionMode="single">
                <MenuSection>
                  <Header>
                    <Heading>Open a copy in</Heading>
                  </Header>
                  <MenuItem id="ipad" textValue="illustrator for ipad">
                    <DeviceTabletIcon />
                    <Text slot="label">Illustrator for iPad</Text>
                  </MenuItem>
                  <MenuItem id="desktop" textValue="illustrator for desktop">
                    <DeviceDesktopIcon />
                    <Text slot="label">Illustrator for desktop</Text>
                  </MenuItem>
                </MenuSection>
              </Menu>
            </SubmenuTrigger>
          </MenuSection>
          <MenuSection>
            <Header>
              <Heading>Menu section header</Heading>
              <Text slot="description">Menu section description</Text>
            </Header>
            <MenuItem id="share" href="https://adobe.com/" target="_blank" textValue="share link">
              <CommentTextIcon />
              <Text slot="label">Share link</Text>
              <Text slot="description">Enable comments and downloads</Text>
            </MenuItem>
            <MenuItem id="preview" textValue="preview timelapse">
              <ClockPendingIcon />
              <Text slot="label">Preview Timelapse</Text>
            </MenuItem>
            <MenuItem id="livestream" textValue="start streaming">
              <CommunityIcon />
              <Text slot="label">Livestream</Text>
              <Text slot="description">Start streaming</Text>
            </MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    );
  },
  args: {
    selectionMode: 'none',
    selectedKeys: ['quick-export'],
    disabledKeys: ['livestream']
  }
};

PublishAndExport.parameters = {
  docs: {
    source: {
      transform: () => {
        return `<MenuTrigger {...triggerProps}>
  <Button aria-label="Share menu"><NewIcon /></Button>
  <Menu>
    <MenuSection>
      <Header>
        <Heading>Publish and export</Heading>
        <Text slot="description">Social media, other formats</Text>
      </Header>
      <MenuItem id="quick-export" textValue="quick export">
        <ImgIcon />
        <Text slot="label">Quick Export</Text>
        <Text slot="description">Share a low-res snapshot.</Text>
      </MenuItem>
      <SubmenuTrigger>
        <MenuItem id="open-in" textValue="open a copy">
          <CopyIcon />
          <Text slot="label">Open a copy</Text>
          <Text slot="description">Illustrator for iPad or desktop</Text>
        </MenuItem>
        <Menu selectionMode="single">
          <MenuSection>
            <Header>
              <Heading>Open a copy in</Heading>
            </Header>
            <MenuItem id="ipad" textValue="illustrator for ipad">
              <DeviceTabletIcon />
              <Text slot="label">Illustrator for iPad</Text>
            </MenuItem>
            <MenuItem id="desktop" textValue="illustrator for desktop">
              <DeviceDesktopIcon />
              <Text slot="label">Illustrator for desktop</Text>
            </MenuItem>
          </MenuSection>
        </Menu>
      </SubmenuTrigger>
    </MenuSection>
    <MenuSection>
      <Header>
        <Heading>Menu section header</Heading>
        <Text slot="description">Menu section description</Text>
      </Header>
      <MenuItem id="share" href="https://adobe.com/" target="_blank" textValue="share link">
        <CommentTextIcon />
        <Text slot="label">Share link</Text>
        <Text slot="description">Enable comments and downloads</Text>
      </MenuItem>
      <MenuItem id="preview" textValue="preview timelapse">
        <ClockPendingIcon />
        <Text slot="label">Preview Timelapse</Text>
      </MenuItem>
      <MenuItem id="livestream" textValue="start streaming">
        <CommunityIcon />
        <Text slot="label">Livestream</Text>
        <Text slot="description">Start streaming</Text>
      </MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>`;
      }
    }
  }
};

const normalUrl = new URL(
  './assets/normal.png?as=png',
  import.meta.url
);

const multiplyUrl = new URL(
  './assets/multiply.png?as=png',
  import.meta.url
);

const screenUrl = new URL(
  './assets/screen.png?as=png',
  import.meta.url
);

export const BlendModes: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Choose blend mode"><NewIcon /></Button>
        <Menu {...menuProps}>
          <MenuItem id="normal" textValue="normal">
            <Image src={normalUrl.href} alt="normal hot airballoon photo" />
            <Text slot="label">Normal</Text>
            <Text slot="description">No effect applied.</Text>
          </MenuItem>
          <MenuItem id="multiply" textValue="multiply">
            <Image src={multiplyUrl.href} alt="hot airballoon photo blend mode multiply" />
            <Text slot="label">Multiply</Text>
            <Text slot="description"><div style={{maxWidth: '150px'}}>Add contrast, detail, and darken shadows.</div></Text>
          </MenuItem>
          <MenuItem id="screen" textValue="screen">
            <Image src={screenUrl.href} alt="hot airballoon photo blend mode screen" />
            <Text slot="label">Screen</Text>
            <Text slot="description">Reduce contrast and brighten details.</Text>
          </MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }
};

interface IExampleItem {
  id: string,
  label: string,
  children?: IExampleItem[]
}
let items: IExampleItem[] = [
  {id: 'view', label: 'View', children: [
    {id: 'grid', label: 'Grid'},
    {id: 'rulers', label: 'Rulers'},
    {id: 'tasks', label: 'Contextual task bar'},
    {id: 'snap', label: 'Snap'}
  ]},
  {id: 'export', label: 'Export as...'},
  {id: 'import', label: 'Import...'}
];
export const DynamicExample: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      align,
      direction,
      shouldFlip
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Actions"><More /></Button>
        <Menu {...menuProps}>
          {function renderItem(arg) {
            let item = arg as IExampleItem;
            if (item.children) {
              return (
                <SubmenuTrigger>
                  <MenuItem>{item.label}</MenuItem>
                  <Menu items={item.children} selectionMode="multiple">{renderItem}</Menu>
                </SubmenuTrigger>
              );
            } else {
              return <MenuItem>{item.label}</MenuItem>;
            }
          }}
        </Menu>
      </MenuTrigger>
    );
  },
  args: {
    items
  }
};

DynamicExample.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let items = [
  {id: 'view', label: 'View', children: [
    {id: 'grid', label: 'Grid'},
    {id: 'rulers', label: 'Rulers'},
    {id: 'tasks', label: 'Contextual task bar'},
    {id: 'snap', label: 'Snap'}
  ]},
  {id: 'export', label: 'Export as...'},
  {id: 'import', label: 'Import...'}
];

<MenuTrigger>
  <Button aria-label="Actions"><NewIcon /></Button>
  <Menu items={items}>
    {function renderItem(arg) {
      let item = arg;
      if (item.children) {
        return (
          <SubmenuTrigger>
            <MenuItem>{item.label}</MenuItem>
            <Menu items={item.children} selectionMode="multiple">{renderItem}</Menu>
          </SubmenuTrigger>
        );
      } else {
        return <MenuItem>{item.label}</MenuItem>;
      }
    }}
  </Menu>
</MenuTrigger>`;
      }
    }
  }
};

export const SelectionGroups = (args) => {
  let {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    align,
    direction,
    shouldFlip,
    ...menuProps
  } = args;
  let triggerProps = {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    align,
    direction,
    shouldFlip
  };
  let [group1, setGroup1] = useState<Selection>(new Set([1]));
  let [group2, setGroup2] = useState<Selection>(new Set());
  return (
    <MenuTrigger {...triggerProps}>
      <Button aria-label="Actions for selected resource"><NewIcon /></Button>
      <Menu {...menuProps}>
        <MenuSection>
          <Header>
            <Heading>Actions</Heading>
          </Header>
          <MenuItem>Action 1</MenuItem>
          <MenuItem>Action 2</MenuItem>
        </MenuSection>
        <MenuSection selectionMode="single" selectedKeys={group1} onSelectionChange={setGroup1}>
          <Header>
            <Heading>Single-select</Heading>
          </Header>
          <MenuItem id={1}>One</MenuItem>
          <MenuItem id={2}>Two</MenuItem>
          <MenuItem id={3}>Three</MenuItem>
        </MenuSection>
        <MenuSection selectionMode="multiple" selectedKeys={group2} onSelectionChange={setGroup2}>
          <Header>
            <Heading>Multi-select</Heading>
          </Header>
          <MenuItem id={4}>Four</MenuItem>
          <MenuItem id={5}>Five</MenuItem>
          <MenuItem id={6}>Siz</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
};
