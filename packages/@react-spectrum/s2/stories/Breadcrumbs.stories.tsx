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

import {action} from '@storybook/addon-actions';
import {Breadcrumb, Breadcrumbs} from '../src';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
    // TODO: remove this once we get intl strings for breadcrumbs and thus the story won't crash in ar-AE
    chromaticProvider: {locales: ['en-US']}
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['M', 'L']
    },
    isDisabled: {
      control: {type: 'boolean'}
    },
    onAction: {
      table: {category: 'Events'}
    }
  },
  tags: ['autodocs'],
  title: 'Breadcrumbs'
};

export default meta;

export const Example = (args: any) => (
  <Breadcrumbs {...args}>
    <Breadcrumb href="/">
      Home
    </Breadcrumb>
    <Breadcrumb href="/react-aria">
      React Aria
    </Breadcrumb>
    <Breadcrumb href="/breadcrumbs">
      Breadcrumbs
    </Breadcrumb>
  </Breadcrumbs>
);

let items = [
  {id: 'home', name: 'Home'},
  {id: 'react-aria', name: 'React Aria'},
  {id: 'breadcrumbs', name: 'Breadcrumbs'}
];
export const WithActions = (args: any) => (
  <Breadcrumbs onAction={action('onAction')} items={items} {...args}>
    {item => (
      <Breadcrumb href={item.href}>
        {item.name}
      </Breadcrumb>
    )}
  </Breadcrumbs>
);

let manyItems = [
  {id: 'Folder 1', name: 'The quick brown fox jumps over'},
  {id: 'Folder 2', name: 'My Documents'},
  {id: 'Folder 3', name: 'Kangaroos jump high'},
  {id: 'Folder 4', name: 'Koalas are very cute'},
  {id: 'Folder 5', name: "Wombat's noses"},
  {id: 'Folder 6', name: 'Wattle trees'},
  {id: 'Folder 7', name: 'April 7'}
];

export const Many = (args: any) => (
  <div style={{width: '400px', resize: 'horizontal', overflow: 'hidden', padding: '4px'}}>
    <Breadcrumbs items={manyItems} {...args}>
      {item => (
        <Breadcrumb>
          {item.name}
        </Breadcrumb>
      )}
    </Breadcrumbs>
  </div>
);

let manyItemsWithLinks = [
  {id: 'Folder 1', name: 'The quick brown fox jumps over', href: '/folder1'},
  {id: 'Folder 2', name: 'My Documents', href: '/folder2'},
  {id: 'Folder 3', name: 'Kangaroos jump high', href: '/folder3'},
  {id: 'Folder 4', name: 'Koalas are very cute', href: '/folder4'},
  {id: 'Folder 5', name: "Wombat's noses", href: '/folder5'},
  {id: 'Folder 6', name: 'Wattle trees', href: '/folder6'},
  {id: 'Folder 7', name: 'April 7', href: '/folder7'}
];

export const ManyWithLinks = (args: any) => (
  <div style={{width: '400px', resize: 'horizontal', overflow: 'hidden', padding: '4px'}}>
    <Breadcrumbs items={manyItemsWithLinks} {...args}>
      {item => (
        <Breadcrumb href={item.href}>
          {item.name}
        </Breadcrumb>
      )}
    </Breadcrumbs>
  </div>
);
