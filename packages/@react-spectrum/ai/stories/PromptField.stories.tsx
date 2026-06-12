/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AttachFileMenuItem,
  InsertMenuButton,
  InsertTokenMenuItem,
  PromptField,
  PromptFieldAttachmentList,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptToken,
  PromptTokenField
} from '../src/PromptField';
import Brand from '@react-spectrum/s2/icons/Brand';
import {
  Collection,
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  SubmenuTrigger,
  Text
} from '@react-spectrum/s2/Menu';
import Data from '@react-spectrum/s2/icons/Data';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import LinkIcon from '@react-spectrum/s2/icons/Link';
import type {Meta} from '@storybook/react';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';

const meta: Meta<typeof PromptField> = {
  component: PromptField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AI/PromptField',
  decorators: [
    Story => (
      <div style={{width: '800px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;

const slashCommands = [
  {
    command: '/audience-explainer',
    type: 'skill',
    description: 'Explain an AEP audience in english'
  },
  {command: '/clear', type: 'command', description: 'Clear the context'},
  {command: '/compact', type: 'command', description: 'Summarize conversation history'},
  {command: '/dataset-usage', type: 'skill', description: 'Explain how to use a dataset'},
  {command: '/plan', type: 'command', description: 'Create a plan before executing'},
  {command: '/visual-artifact', type: 'skill', description: 'Generate a chart or graph'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'S'})} />,
  skill: <Plugin styles={iconStyle({size: 'S'})} />,
  audience: <UserGroup styles={iconStyle({size: 'S'})} />,
  campaign: <Brand styles={iconStyle({size: 'S'})} />,
  journey: <SocialNetwork styles={iconStyle({size: 'S'})} />,
  url: <LinkIcon styles={iconStyle({size: 'S'})} />
} as const;

const objects = [
  {
    section: 'Audiences',
    items: [
      {type: 'audience', title: 'New Customers'},
      {type: 'audience', title: 'Returning Customers'},
      {type: 'audience', title: 'Loyal Customers'},
      {type: 'audience', title: 'High-Value Customers'},
      {type: 'audience', title: 'Low-Value Customers'}
    ]
  },
  {
    section: 'Campaigns',
    items: [
      {type: 'campaign', title: 'Spring Launch 2026'},
      {type: 'campaign', title: 'Holiday Cheer'},
      {type: 'campaign', title: 'Back to School'},
      {type: 'campaign', title: 'Summer Adventure'},
      {type: 'campaign', title: 'Tech Trends Expo'}
    ]
  },
  {
    section: 'Journeys',
    items: [
      {type: 'journey', title: 'Welcome Flow'},
      {type: 'journey', title: 'Abandoned Cart Recovery'},
      {type: 'journey', title: 'Post-Purchase Follow-up'},
      {type: 'journey', title: 'Re-engagement Campaign'},
      {type: 'journey', title: 'Birthday Surprise Journey'}
    ]
  }
];

function renderCompletions(filterValue: string) {
  if (filterValue.startsWith('/')) {
    return slashCommands
      .filter(item => item.command.includes(filterValue.slice(1)))
      .map(item => (
        <MenuItem key={item.command} id={item.command} value={item}>
          {item.type === 'skill' ? <Plugin /> : <Prompt />}
          <Text slot="label">{item.command}</Text>
          <Text slot="description">{item.description}</Text>
        </MenuItem>
      ));
  } else if (filterValue.startsWith('@')) {
    return objects
      .map(section => {
        let matchingItems = section.items
          .filter(item => item.title.toLowerCase().includes(filterValue.slice(1).toLowerCase()))
          .map(item => (
            <MenuItem key={item.title} id={item.title} value={item}>
              {item.title}
            </MenuItem>
          ));

        if (matchingItems.length > 0) {
          return (
            <MenuSection key={section.section} id={section.section}>
              <Header>
                <Heading>{section.section}</Heading>
              </Header>
              {matchingItems}
            </MenuSection>
          );
        } else {
          return null;
        }
      })
      .filter(v => v != null);
  }
  return null;
}

export const Everything = () => (
  <PromptField acceptedAttachmentTypes={['image/*']}>
    <PromptFieldAttachmentList />
    <PromptTokenField completionTrigger={/(?<=^|\s)[@/]/} renderCompletions={renderCompletions}>
      {segment => (
        <PromptToken>
          {icons[segment.value?.type]}
          {segment.text}
        </PromptToken>
      )}
    </PromptTokenField>
    <PromptFieldToolbar>
      <InsertMenuButton>
        <AttachFileMenuItem />
        <SubmenuTrigger>
          <MenuItem>
            <Prompt />
            <Text>Commands</Text>
          </MenuItem>
          <Menu items={slashCommands.filter(item => item.type === 'command')}>
            {item => (
              <InsertTokenMenuItem id={item.command}>
                <Text slot="label">{item.command}</Text>
                <Text slot="description">{item.description}</Text>
              </InsertTokenMenuItem>
            )}
          </Menu>
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem>
            <Plugin />
            <Text>Skills</Text>
          </MenuItem>
          <Menu items={slashCommands.filter(item => item.type === 'skill')}>
            {item => (
              <InsertTokenMenuItem id={item.command}>
                <Text slot="label">{item.command}</Text>
                <Text slot="description">{item.description}</Text>
              </InsertTokenMenuItem>
            )}
          </Menu>
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem>
            <Data />
            <Text>Reference an object</Text>
          </MenuItem>
          <Menu items={objects}>
            {item => (
              <MenuSection>
                <Header>
                  <Heading>{item.section}</Heading>
                </Header>
                <Collection items={item.items}>
                  {item => <InsertTokenMenuItem id={item.title}>{item.title}</InsertTokenMenuItem>}
                </Collection>
              </MenuSection>
            )}
          </Menu>
        </SubmenuTrigger>
      </InsertMenuButton>
      <PromptFieldSubmitButton />
    </PromptFieldToolbar>
  </PromptField>
);

export const Basic = () => (
  <PromptField>
    <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
      <PromptTokenField />
      <PromptFieldSubmitButton />
    </div>
  </PromptField>
);

export const AsyncCompletions = () => (
  <PromptField>
    <div className={style({display: 'flex', gap: 16, alignItems: 'center'})}>
      <PromptTokenField
        completionTrigger={/(?<=^|\s)[@/]/}
        renderCompletions={async filterValue => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return renderCompletions(filterValue);
        }}>
        {segment => (
          <PromptToken>
            {icons[segment.value?.type]}
            {segment.text}
          </PromptToken>
        )}
      </PromptTokenField>
      <PromptFieldSubmitButton />
    </div>
  </PromptField>
);
