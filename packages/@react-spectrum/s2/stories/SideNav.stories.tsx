/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from 'storybook/actions';
import {ActionMenu} from '../src/ActionMenu';
import {Avatar} from '../src/Avatar';
import {categorizeArgTypes, getActionArgs} from './utils';
import {Collection} from 'react-aria/Collection';
import Copy from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import Cut from '../s2wf-icons/S2_Icon_Cut_20_N.svg';
import {Divider} from '../src/Divider';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import {Heading, Keyboard, Text} from '../src/Content';
import {MenuItem} from '../src/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import Paste from '../s2wf-icons/S2_Icon_Paste_20_N.svg';
import React, {ReactElement, ReactNode, useRef, useState} from 'react';
import {RouterProvider} from 'react-aria-components';
import {SearchField} from '../src/SearchField';
import {
  SideNav,
  SideNavHeader,
  SideNavItem,
  SideNavItemContent,
  SideNavItemLink,
  SideNavProps,
  SideNavSection
} from '../src/SideNav';
import {style} from '../style' with {type: 'macro'};
import {useLandmark} from 'react-aria';

const events = ['onSelectionChange'];

const meta: Meta<typeof SideNav> = {
  component: SideNav,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', [...events]),
    children: {table: {disable: true}}
  }
};

export default meta;

type SideNavStoryObj = StoryObj<typeof SideNav>;

// Treats the SideNav as navigation: activating a link is intercepted by the RouterProvider so the
// page doesn't actually navigate, and the activated href drives the controlled selected key. Any
// non-link selection (e.g. keyboard or items without a link) flows through onSelectionChange.
function RoutedSideNav(props: SideNavProps<unknown> & {children: ReactNode}) {
  let {children, ...args} = props;
  let [selectedRoute, setSelectedRoute] = useState<string>(props.selectedRoute ?? '/Photos');

  let updateSelection = (href: string) => {
    setSelectedRoute(href);
  };

  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
      <RouterProvider navigate={updateSelection}>
        <SideNav
          {...args}
          selectedRoute={selectedRoute}
          disabledKeys={['projects-1']}
          aria-label="test static tree"
          onExpandedChange={action('onExpandedChange')}>
          {children}
        </SideNav>
      </RouterProvider>
    </div>
  );
}

const SideNavExampleStatic = args => (
  <RoutedSideNav {...args}>
    <SideNavItem href="/Photos" textValue="Your files">
      <SideNavItemContent>
        <SideNavItemLink>
          <Text>Your files</Text>
          <Folder />
        </SideNavItemLink>
      </SideNavItemContent>
    </SideNavItem>
    <SideNavItem href="/projects" textValue="Your libraries">
      <SideNavItemContent>
        <SideNavItemLink>
          <Text>Your libraries</Text>
        </SideNavItemLink>
      </SideNavItemContent>
      <SideNavItem href="/projects-1" id="projects-1" textValue="Projects-1">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Projects-1</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem href="/projects-1A" textValue="Projects-1A">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects-1A</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
      <SideNavItem href="/projects-2" textValue="Projects-2">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Projects-2</Text>
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem href="/projects-3" textValue="Projects-3">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Projects-3</Text>
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
    </SideNavItem>
  </RoutedSideNav>
);

export const Example: SideNavStoryObj = {
  render: SideNavExampleStatic,
  args: {}
};

const SideNavSectionsExample = args => (
  <RoutedSideNav {...args} selectedRoute="/projects">
    <SideNavSection>
      <SideNavHeader>Photography</SideNavHeader>
      <SideNavItem href="/Photos" textValue="Photos">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your files</Text>
            <Folder />
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
    </SideNavSection>
    <SideNavSection>
      <SideNavHeader>Work</SideNavHeader>
      <SideNavItem href="/projects" textValue="Projects">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your libraries</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem href="/projects-1" id="projects-1" textValue="Projects-1">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects-1</Text>
            </SideNavItemLink>
          </SideNavItemContent>
          <SideNavItem href="/projects-1A" textValue="Projects-1A">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Projects-1A</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
        <SideNavItem href="/projects-2" textValue="Projects-2">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects-2</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem href="/projects-3" textValue="Projects-3">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects-3</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
    </SideNavSection>
  </RoutedSideNav>
);

export const SideNavSections = {
  render: SideNavSectionsExample,
  args: {
    selectionMode: 'single'
  }
};

interface SideNavItemType {
  id: string;
  name: string;
  href?: string;
  childItems?: SideNavItemType[];
}

let dynamicItems: SideNavItemType[] = [
  {id: 'Photos', name: 'Your files', href: '/Photos'},
  {
    id: 'projects',
    name: 'Projects',
    href: '/projects',
    childItems: [
      {id: 'projects-1', name: 'Projects-1', href: '/projects-1'},
      {
        id: 'projects-2',
        name: 'Projects-2',
        childItems: [
          {id: 'projects-2A', name: 'Projects-2A', href: '/projects-2A'},
          {id: 'projects-2B', name: 'Projects-2B', href: '/projects-2B'},
          {id: 'projects-2C', name: 'Projects-2C', href: '/projects-2C'},
          {id: 'projects-2D', name: 'Projects-2D', href: '/projects-2D'},
          {id: 'projects-2E', name: 'Projects-2E', href: '/projects-2E'},
          {id: 'projects-2F', name: 'Projects-2F', href: '/projects-2F'}
        ]
      }
    ]
  },
  {
    id: 'reports',
    name: 'Reports',
    href: '/reports',
    childItems: [{id: 'reports-1', name: 'Reports-1', href: '/reports-1'}]
  }
];

const DynamicSideNavItem = (props: SideNavItemType): ReactElement => {
  let {id, name, href, childItems} = props;
  return (
    <SideNavItem id={id} href={href} textValue={name}>
      <SideNavItemContent>
        {href && href.length > 0 && (
          <SideNavItemLink>
            <Text>{name}</Text>
          </SideNavItemLink>
        )}
        {(!href || href.length === 0) && <Text>{name}</Text>}
      </SideNavItemContent>
      <Collection items={childItems}>
        {(item: SideNavItemType) => <DynamicSideNavItem {...item} />}
      </Collection>
    </SideNavItem>
  );
};

const SideNavDynamicExample = (args: SideNavProps<SideNavItemType>): ReactElement => {
  let [selectedRoute, setSelectedRoute] = useState<string>('/Photos');
  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
      <RouterProvider navigate={setSelectedRoute}>
        <SideNav
          {...args}
          aria-label="dynamic side nav"
          items={dynamicItems}
          selectedRoute={selectedRoute}
          defaultExpandedKeys={['projects', 'projects-2']}
          onExpandedChange={action('onExpandedChange')}>
          {(item: SideNavItemType) => <DynamicSideNavItem {...item} />}
        </SideNav>
      </RouterProvider>
    </div>
  );
};
type SideNavDynamicStoryObj = StoryObj<typeof SideNavDynamicExample>;

export const SideNavDynamic: SideNavDynamicStoryObj = {
  render: args => <SideNavDynamicExample {...args} />,
  args: {}
};

const DynamicWithActionsSideNavItem = (props: SideNavItemType): ReactElement => {
  let {id, name, href, childItems} = props;
  return (
    <SideNavItem id={id} href={href} textValue={name}>
      <SideNavItemContent>
        {href && href.length > 0 && (
          <SideNavItemLink>
            <Text>{name}</Text>
          </SideNavItemLink>
        )}
        {(!href || href.length === 0) && <Text>{name}</Text>}
        <ActionMenu>
          <MenuItem textValue="Copy" onAction={() => alert('copy')}>
            <Copy />
            <Text slot="label">Copy</Text>
            <Text slot="description">Copy the selected text</Text>
            <Keyboard>⌘C</Keyboard>
          </MenuItem>
          <MenuItem textValue="Cut" onAction={() => alert('cut')}>
            <Cut />
            <Text slot="label">Cut</Text>
            <Text slot="description">Cut the selected text</Text>
            <Keyboard>⌘X</Keyboard>
          </MenuItem>
          <MenuItem textValue="Paste" onAction={() => alert('paste')}>
            <Paste />
            <Text slot="label">Paste</Text>
            <Text slot="description">Paste the copied text</Text>
            <Keyboard>⌘V</Keyboard>
          </MenuItem>
        </ActionMenu>
      </SideNavItemContent>
      <Collection items={childItems}>
        {(item: SideNavItemType) => <DynamicWithActionsSideNavItem {...item} />}
      </Collection>
    </SideNavItem>
  );
};

const SideNavDynamicWithActionsExample = (args: SideNavProps<SideNavItemType>): ReactElement => {
  let [selectedRoute, setSelectedRoute] = useState<string>('/Photos');
  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
      <RouterProvider navigate={setSelectedRoute}>
        <SideNav
          {...args}
          aria-label="dynamic side nav"
          items={dynamicItems}
          selectedRoute={selectedRoute}
          defaultExpandedKeys={['projects', 'projects-2']}
          onExpandedChange={action('onExpandedChange')}>
          {(item: SideNavItemType) => <DynamicWithActionsSideNavItem {...item} />}
        </SideNav>
      </RouterProvider>
    </div>
  );
};
type SideNavDynamicWithActionsStoryObj = StoryObj<typeof SideNavDynamicWithActionsExample>;

export const SideNavDynamicWithActions: SideNavDynamicWithActionsStoryObj = {
  render: args => <SideNavDynamicWithActionsExample {...args} />,
  args: {},
  name: 'WithActions'
};

// Landmark wrappers used only by the story. useLandmark is called here in the app shell rather than
// inside SideNav, so the consumer owns landmark registration. Each renders a semantic element and
// spreads landmarkProps (role + labels). Press F6 / Shift+F6 to cycle landmarks with the keyboard.
function Banner(props: {children: ReactNode}): ReactElement {
  let ref = useRef<HTMLElement>(null);
  let {landmarkProps} = useLandmark({...props, role: 'banner', 'aria-label': 'Global'}, ref);
  return (
    <header
      ref={ref}
      {...landmarkProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderBottom: '1px solid #d5d5d5'
      }}>
      {props.children}
    </header>
  );
}

function Navigation(props: {'aria-label'?: string; children: ReactNode}): ReactElement {
  let ref = useRef<HTMLElement>(null);
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return (
    <nav
      ref={ref}
      {...landmarkProps}
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: 8,
        borderInlineEnd: '1px solid #d5d5d5'
      }}>
      {props.children}
    </nav>
  );
}

function Main(props: {'aria-label'?: string; children: ReactNode}): ReactElement {
  let ref = useRef<HTMLElement>(null);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return (
    <main
      ref={ref}
      {...landmarkProps}
      style={{flex: 1, minWidth: 0, padding: 16, overflow: 'auto'}}>
      {props.children}
    </main>
  );
}

const AppLayoutExample = (args: SideNavProps<unknown>): ReactElement => {
  let [selectedRoute, setSelectedRoute] = useState<string>('/files');
  return (
    <RouterProvider navigate={setSelectedRoute}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 860,
          height: 520,
          boxSizing: 'border-box',
          border: '1px solid #d5d5d5',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
        <Banner>
          <Heading level={3} styles={style({font: 'title', margin: 0})}>
            Acme Cloud
          </Heading>
          <div style={{flex: 1, maxWidth: 320}}>
            <SearchField aria-label="Search" />
          </div>
          <Avatar alt="Your account" src="https://i.imgur.com/xIe7Wlb.png" />
        </Banner>
        <div style={{display: 'flex', flex: 1, minHeight: 0}}>
          <Navigation aria-label="Primary">
            <SideNav
              {...args}
              aria-label="Files and projects"
              selectedRoute={selectedRoute}
              defaultExpandedKeys={['projects']}
              onExpandedChange={action('onExpandedChange')}>
              <SideNavItem href="/home" textValue="Home">
                <SideNavItemContent>
                  <SideNavItemLink>
                    <Text>Home</Text>
                  </SideNavItemLink>
                </SideNavItemContent>
              </SideNavItem>
              <SideNavItem href="/files" textValue="Your files">
                <SideNavItemContent>
                  <SideNavItemLink>
                    <Text>Your files</Text>
                    <Folder />
                  </SideNavItemLink>
                </SideNavItemContent>
              </SideNavItem>
              <SideNavItem href="/shared" textValue="Shared with you">
                <SideNavItemContent>
                  <SideNavItemLink>
                    <Text>Shared with you</Text>
                  </SideNavItemLink>
                </SideNavItemContent>
              </SideNavItem>
              <SideNavItem href="/projects" id="projects" textValue="Projects">
                <SideNavItemContent>
                  <SideNavItemLink>
                    <Text>Projects</Text>
                  </SideNavItemLink>
                </SideNavItemContent>
                <SideNavItem href="/projects/website" textValue="Website redesign">
                  <SideNavItemContent>
                    <SideNavItemLink>
                      <Text>Website redesign</Text>
                    </SideNavItemLink>
                  </SideNavItemContent>
                </SideNavItem>
                <SideNavItem href="/projects/mobile" textValue="Mobile app">
                  <SideNavItemContent>
                    <SideNavItemLink>
                      <Text>Mobile app</Text>
                    </SideNavItemLink>
                  </SideNavItemContent>
                </SideNavItem>
              </SideNavItem>
              <SideNavItem href="/archive" textValue="Archive">
                <SideNavItemContent>
                  <SideNavItemLink>
                    <Text>Archive</Text>
                  </SideNavItemLink>
                </SideNavItemContent>
              </SideNavItem>
            </SideNav>
          </Navigation>
          <Main aria-label="Content">
            <Heading level={2} styles={style({font: 'heading', marginTop: 0})}>
              Workspace
            </Heading>
            <p style={{font: 'inherit', maxWidth: 520}}>
              This area is the main landmark and the side navigation on the left is wrapped in a
              navigation landmark. Press F6 (or Shift+F6) to move keyboard focus between the
              navigation, banner, and main landmarks.
            </p>
            <Divider styles={style({marginY: 16})} />
            <p style={{font: 'inherit'}}>Current route: {selectedRoute}</p>
          </Main>
        </div>
      </div>
    </RouterProvider>
  );
};
type AppLayoutStoryObj = StoryObj<typeof AppLayoutExample>;

export const WithLandmark: AppLayoutStoryObj = {
  render: args => <AppLayoutExample {...args} />,
  args: {},
  name: 'With Landmark',
  parameters: {
    layout: 'fullscreen'
  }
};
