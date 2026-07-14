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

import {Collection} from 'react-aria/Collection';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactElement} from 'react';
import {screen, userEvent} from 'storybook/test';
import {
  SideNav,
  SideNavHeader,
  SideNavItem,
  SideNavItemContent,
  SideNavItemLink,
  SideNavProps,
  SideNavSection
} from '../src/SideNav';
import {Text} from '../src/Content';

const meta: Meta<typeof SideNav> = {
  component: SideNav,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/SideNav'
};

export default meta;

function SideNavExample(props: SideNavProps<unknown>): ReactElement {
  return (
    <div style={{width: '300px', height: '320px'}}>
      <SideNav
        aria-label="test static side nav"
        selectedRoute="/projects-2"
        disabledKeys={['projects-1']}
        expandedKeys={['projects']}
        {...props}>
        <SideNavItem id="Photos" href="/Photos" textValue="Your files">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Your files</Text>
              <Folder />
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="projects" href="/projects" textValue="Your libraries">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Your libraries</Text>
            </SideNavItemLink>
          </SideNavItemContent>
          <SideNavItem id="projects-1" href="/projects-1" textValue="Projects-1">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Projects-1</Text>
              </SideNavItemLink>
            </SideNavItemContent>
            <SideNavItem id="projects-1A" href="/projects-1A" textValue="Projects-1A">
              <SideNavItemContent>
                <SideNavItemLink>
                  <Text>Projects-1A</Text>
                </SideNavItemLink>
              </SideNavItemContent>
            </SideNavItem>
          </SideNavItem>
          <SideNavItem id="projects-2" href="/projects-2" textValue="Projects-2">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Projects-2</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
          <SideNavItem id="projects-3" href="/projects-3" textValue="Projects-3">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Projects-3</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
      </SideNav>
    </div>
  );
}

export const Static: StoryObj<typeof SideNavExample> = {
  render: args => <SideNavExample {...args} />
};

// A nested item is selected while its collapsed ancestor shows the "has selected descendant"
// indicator (the parent row's selected state without the child being visible).
export const CollapsedSelectedAncestor: StoryObj<typeof SideNavExample> = {
  ...Static,
  args: {
    expandedKeys: [],
    selectedRoute: '/projects-2'
  }
};

function SideNavSectionsExample(props: SideNavProps<unknown>): ReactElement {
  return (
    <div style={{width: '300px', height: '320px'}}>
      <SideNav
        aria-label="test side nav with sections"
        selectedRoute="/projects"
        disabledKeys={['projects-1']}
        expandedKeys={['projects']}
        {...props}>
        <SideNavSection>
          <SideNavHeader>Photography</SideNavHeader>
          <SideNavItem id="Photos" href="/Photos" textValue="Your files">
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
          <SideNavItem id="projects" href="/projects" textValue="Your libraries">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Your libraries</Text>
              </SideNavItemLink>
            </SideNavItemContent>
            <SideNavItem id="projects-1" href="/projects-1" textValue="Projects-1">
              <SideNavItemContent>
                <SideNavItemLink>
                  <Text>Projects-1</Text>
                </SideNavItemLink>
              </SideNavItemContent>
            </SideNavItem>
            <SideNavItem id="projects-2" href="/projects-2" textValue="Projects-2">
              <SideNavItemContent>
                <SideNavItemLink>
                  <Text>Projects-2</Text>
                </SideNavItemLink>
              </SideNavItemContent>
            </SideNavItem>
          </SideNavItem>
        </SideNavSection>
      </SideNav>
    </div>
  );
}

export const Sections: StoryObj<typeof SideNavSectionsExample> = {
  render: args => <SideNavSectionsExample {...args} />
};

interface SideNavItemType {
  id: string;
  name: string;
  href?: string;
  childItems?: SideNavItemType[];
}

let rows: SideNavItemType[] = [
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
        href: '/projects-2',
        childItems: [
          {id: 'projects-2A', name: 'Projects-2A', href: '/projects-2A'},
          {id: 'projects-2B', name: 'Projects-2B', href: '/projects-2B'},
          {id: 'projects-2C', name: 'Projects-2C', href: '/projects-2C'}
        ]
      },
      {id: 'projects-3', name: 'Projects-3', href: '/projects-3'}
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
        <SideNavItemLink>
          <Text>{name}</Text>
        </SideNavItemLink>
      </SideNavItemContent>
      <Collection items={childItems}>
        {(item: SideNavItemType) => <DynamicSideNavItem {...item} />}
      </Collection>
    </SideNavItem>
  );
};

function SideNavDynamicExample(props: SideNavProps<SideNavItemType>): ReactElement {
  return (
    <div style={{width: '300px', height: '320px'}}>
      <SideNav
        aria-label="test dynamic side nav"
        items={rows}
        selectedRoute="/projects-2A"
        disabledKeys={['projects-3', 'reports']}
        expandedKeys={['projects', 'projects-2']}
        {...props}>
        {(item: SideNavItemType) => <DynamicSideNavItem {...item} />}
      </SideNav>
    </div>
  );
}

export const Dynamic: StoryObj<typeof SideNavDynamicExample> = {
  render: args => <SideNavDynamicExample {...args} />
};

// Hovering an item that has a link reveals the hover indicator bar to the left of the row.
// Rendered as a single instance (one color scheme + background) so the play function's role
// query resolves to exactly one SideNav.
export const Hovered: StoryObj<typeof SideNavExample> = {
  ...Static,
  play: async () => {
    // Hover a row that isn't the selected one (selectedRoute is /projects-2) so the hover
    // indicator is distinct from the selection indicator. Hover the row itself (not the inner
    // link): the row owns the useHover handlers, which use onPointerEnter/onMouseEnter and don't
    // bubble, so hovering a child wouldn't trigger them.
    let row = screen.getByRole('row', {name: 'Projects-3'});
    await userEvent.hover(row);
    // Give the hover state time to settle before the screenshot is captured.
    await new Promise(resolve => setTimeout(resolve, 100));
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};
