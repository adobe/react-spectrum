import {MenuItem, MenuTrigger, Menu, MenuSection, CombinedMenu, SubmenuTrigger} from '../src/Menu'; // should MenuTrigger just come from RAC?
import {Button} from '../src/Button';
import ImgIcon from '../src/wf-icons/Image';
import NewIcon from '../src/wf-icons/New';
import CopyIcon from '../src/wf-icons/Copy';
import CommentTextIcon from '../src/wf-icons/CommentText';
import ClockPendingIcon from '../src/wf-icons/ClockPending';
import CommunityIcon from '../src/wf-icons/Community';
import DeviceTabletIcon from '../src/wf-icons/DeviceTablet';
import DeviceDesktopIcon from '../src/wf-icons/DeviceDesktop';
import {Header, Heading, Text, Image, Keyboard} from '../src/Content';

import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof CombinedMenu> = {
  component: CombinedMenu,
  parameters: {
    layout: 'centered'
  }
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
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Menu {...menuProps}>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }
};

export const KeyboardShortcuts: Story = {
  render: (args) => {
    let {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen,
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Menu {...menuProps} disabledKeys={['copy']}>
          <MenuItem id="cut"><Text slot="label">Cut</Text><Keyboard>⌘ Cmd + X</Keyboard></MenuItem>
          <MenuItem id="copy"><Text slot="label">Copy</Text><Keyboard>⌘ Cmd + C</Keyboard></MenuItem>
          <MenuItem id="paste"><Text slot="label">Paste</Text><Keyboard>⌘ Cmd + V</Keyboard></MenuItem>
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
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Menu {...menuProps}>
          <MenuSection>
            <Header slot="header">
              <Heading>Publish and export</Heading>
              <Text slot="section-description">Social media, other formats</Text>
            </Header>
            <MenuItem id={'quick-export'}>
              <ImgIcon slot="icon" />
              <Text slot="label">Quick Export</Text>
              <Text slot="description">Share a low-res snapshot</Text>
            </MenuItem>
            <SubmenuTrigger>
              <MenuItem>
                <CopyIcon slot="icon" />
                <Text slot="label">Open a copy</Text>
                <Text slot="description">Illustrator for iPad or desktop</Text>
              </MenuItem>
              <Menu selectionMode="single">
                <MenuSection>
                  <Header slot="header">
                    <Heading>Open a copy in</Heading>
                  </Header>
                  <MenuItem>
                    <DeviceTabletIcon slot="icon" />
                    <Text slot="label">Illustrator for iPad</Text>
                  </MenuItem>
                  <MenuItem>
                    <DeviceDesktopIcon slot="icon" />
                    <Text slot="label">Illustrator for desktop</Text>
                  </MenuItem>
                </MenuSection>
              </Menu>
            </SubmenuTrigger>
          </MenuSection>
          <MenuSection>
            <Header slot="header">
              <Heading>Menu section header</Heading>
              <Text slot="section-description">Menu section description</Text>
            </Header>
            <MenuItem href="https://adobe.com/" target="_blank">
              <CommentTextIcon slot="icon" />
              <Text slot="label">Share link</Text>
              <Text slot="description">Enable comments and downloads</Text>
            </MenuItem>
            <MenuItem>
              <ClockPendingIcon slot="icon" />
              <Text slot="label">Preview Timelapse</Text>
            </MenuItem>
            <MenuItem id="livestream">
              <CommunityIcon slot="icon" />
              <Text slot="label">Livestream</Text>
              <Text slot="description">Start streaming</Text>
            </MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    );
  },
  args: {
    selectionMode: 'multiple',
    selectedKeys: ['quick-export'],
    disabledKeys: ['livestream']
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
      ...menuProps
    } = args;
    let triggerProps = {
      trigger,
      isOpen,
      onOpenChange,
      defaultOpen
    };
    return (
      <MenuTrigger {...triggerProps}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Menu {...menuProps}>
          <MenuItem>
            <Image src={normalUrl.href} />
            <Text slot="label">Normal</Text>
            <Text slot="description">No effect applied.</Text>
          </MenuItem>
          <MenuItem>
            <Image src={multiplyUrl.href} />
            <Text slot="label">Multiply</Text>
            <Text slot="description"><div style={{maxWidth: '150px'}}>Add contrast, detail, and darken shadows.</div></Text>
          </MenuItem>
          <MenuItem>
            <Image src={screenUrl.href} />
            <Text slot="label">Screen</Text>
            <Text slot="description">Reduce contrast and brighten details.</Text>
          </MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }
};
