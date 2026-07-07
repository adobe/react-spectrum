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
import {categorizeArgTypes, getActionArgs} from './utils';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactNode, useState} from 'react';
import {RouterProvider} from 'react-aria-components';
import {Selection} from '@react-types/shared';
import {
  SideNav,
  SideNavCategory,
  SideNavHeader,
  SideNavItem,
  SideNavItemContent,
  SideNavItemLink,
  SideNavProps,
  SideNavSection
} from '../src/SideNav';
import {Text} from '../src/Content';

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
  let {children, onSelectionChange, ...args} = props;
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['Photos']));

  let updateSelection = (keys: Selection) => {
    setSelectedKeys(keys);
    onSelectionChange?.(keys);
  };

  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
      <RouterProvider navigate={href => updateSelection(new Set([href.replace(/^\//, '')]))}>
        <SideNav
          {...args}
          selectedKeys={selectedKeys}
          onSelectionChange={updateSelection}
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
    <SideNavItem id="Photos" textValue="Your files">
      <SideNavItemContent>
        <SideNavItemLink href="/Photos">
          <Text>Your files</Text>
          <Folder />
        </SideNavItemLink>
      </SideNavItemContent>
    </SideNavItem>
    <SideNavItem id="projects" textValue="Your libraries">
      <SideNavItemContent>
        <SideNavItemLink href="/projects">
          <Text>Your libraries</Text>
        </SideNavItemLink>
      </SideNavItemContent>
      <SideNavItem id="projects-1" textValue="Projects-1">
        <SideNavItemContent>
          <Text>Projects-1</Text>
        </SideNavItemContent>
        <SideNavItem id="projects-1A" textValue="Projects-1A">
          <SideNavItemContent>
            <Text>Projects-1A</Text>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
      <SideNavItem id="projects-2" textValue="Projects-2">
        <SideNavItemContent>
          <Text>Projects-2</Text>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="projects-3" textValue="Projects-3">
        <SideNavItemContent>
          <Text>Projects-3</Text>
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
  <RoutedSideNav {...args}>
    <SideNavSection>
      <SideNavHeader>Photography</SideNavHeader>
      <SideNavItem id="Photos" textValue="Photos">
        <SideNavItemContent>
          <SideNavItemLink href="/Photos">
            <Text>Your files</Text>
            <Folder />
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
    </SideNavSection>
    <SideNavSection>
      <SideNavHeader>Work</SideNavHeader>
      <SideNavItem id="projects" textValue="Projects">
        <SideNavItemContent>
          <SideNavItemLink href="/projects">
            <Text>Your libraries</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem id="projects-1" textValue="Projects-1">
          <SideNavItemContent>
            <Text>Projects-1</Text>
          </SideNavItemContent>
          <SideNavItem id="projects-1A" textValue="Projects-1A">
            <SideNavItemContent>
              <Text>Projects-1A</Text>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
        <SideNavItem id="projects-2" textValue="Projects-2">
          <SideNavItemContent>
            <Text>Projects-2</Text>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="projects-3" textValue="Projects-3">
          <SideNavItemContent>
            <Text>Projects-3</Text>
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

const SideNavExampleCategory = args => (
  <RoutedSideNav {...args}>
    <SideNavItem id="Photos" textValue="Photos">
      <SideNavItemContent>
        <Text>Your files</Text>
        <Folder />
      </SideNavItemContent>
    </SideNavItem>
    <SideNavCategory id="projects" textValue="Projects" counter={10}>
      <SideNavItemContent>
        <Text>Your libraries</Text>
      </SideNavItemContent>
      <SideNavItem id="projects-1" textValue="Projects-1">
        <SideNavItemContent>
          <Text>Projects-1</Text>
        </SideNavItemContent>
        <SideNavItem id="projects-1A" textValue="Projects-1A">
          <SideNavItemContent>
            <Text>Projects-1A</Text>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
      <SideNavItem id="projects-2" textValue="Projects-2">
        <SideNavItemContent>
          <Text>Projects-2</Text>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="projects-3" textValue="Projects-3">
        <SideNavItemContent>
          <Text>Projects-3</Text>
        </SideNavItemContent>
      </SideNavItem>
    </SideNavCategory>
  </RoutedSideNav>
);

export const Category = {
  render: SideNavExampleCategory,
  args: {
    selectionMode: 'single'
  }
};
