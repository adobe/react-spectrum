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
import React from 'react';
import {
  SideNav,
  SideNavCategory,
  SideNavHeader,
  SideNavItem,
  SideNavItemContent,
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

const SideNavExampleStatic = args => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
    <SideNav
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
      <SideNavItem id="Photos" textValue="Your files" href="https://www.adobe.com">
        <SideNavItemContent>
          <Text>Your files</Text>
          <Folder />
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="projects" textValue="Your libraries" href="https://www.google.com">
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
      </SideNavItem>
    </SideNav>
  </div>
);

export const Example: SideNavStoryObj = {
  render: SideNavExampleStatic,
  args: {}
};

const SideNavSectionsExample = args => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
    <SideNav
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
      <SideNavSection>
        <SideNavHeader>Photography</SideNavHeader>
        <SideNavItem id="Photos" textValue="Photos">
          <SideNavItemContent>
            <Text>Your files</Text>
            <Folder />
          </SideNavItemContent>
        </SideNavItem>
      </SideNavSection>
      <SideNavSection>
        <SideNavHeader>Work</SideNavHeader>
        <SideNavItem id="projects" textValue="Projects" counter={10}>
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
        </SideNavItem>
      </SideNavSection>
    </SideNav>
  </div>
);

export const SideNavSections = {
  render: SideNavSectionsExample,
  args: {
    selectionMode: 'single'
  }
};

const SideNavExampleCategory = args => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'visible'}}>
    <SideNav
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
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
    </SideNav>
  </div>
);

export const Category = {
  render: SideNavExampleCategory,
  args: {
    selectionMode: 'single'
  }
};
