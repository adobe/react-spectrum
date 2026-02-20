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

import {action} from '@storybook/addon-actions';
import {ActionButton, ActionButtonGroup, ActionMenu, Breadcrumb, Breadcrumbs, Content, Heading, IllustratedMessage, Image, ListView, ListViewItem, MenuItem, Text} from '../';
import {categorizeArgTypes} from './utils';
import {chain} from '@react-aria/utils';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import File from '../s2wf-icons/S2_Icon_File_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import {Key} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactNode, useState} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useAsyncList} from 'react-stately';

const meta: Meta<typeof ListView> = {
  component: ListView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onSelectionChange'])
  },
  title: 'ListView',
  decorators: [
    (Story) => (
      <div style={{width: '300px', resize: 'both', height: '320px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ListView>;

export const Example: Story = {
  args: {
    'aria-label': 'Files',
    children: (
      <>
        <ListViewItem>
          Item 1
        </ListViewItem>
        <ListViewItem>
          Item 2
        </ListViewItem>
        <ListViewItem>
          Item 3
        </ListViewItem>
      </>
    )
  }
};

interface Item {
  id: Key,
  name: string,
  type?: 'file' | 'folder',
  children?: Item[]
}

const items: Item[] = [
  {id: 'a', name: 'Adobe Photoshop', type: 'file'},
  {id: 'b', name: 'Adobe XD', type: 'file'},
  {id: 'c', name: 'Documents', type: 'folder', children: [
    {id: 1, name: 'Sales Pitch'},
    {id: 2, name: 'Demo'},
    {id: 3, name: 'Taxes'}
  ]},
  {id: 'd', name: 'Adobe InDesign', type: 'file'},
  {id: 'e', name: 'Utilities', type: 'folder', children: [
    {id: 1, name: 'Activity Monitor'}
  ]},
  {id: 'f', name: 'Adobe AfterEffects', type: 'file'},
  {id: 'g', name: 'Adobe Illustrator', type: 'file'},
  {id: 'h', name: 'Adobe Lightroom', type: 'file'},
  {id: 'i', name: 'Adobe Premiere Pro', type: 'file'},
  {id: 'j', name: 'Adobe Fresco', type: 'file'},
  {id: 'k', name: 'Adobe Dreamweaver', type: 'file'},
  {id: 'l', name: 'Adobe Connect', type: 'file'},
  {id: 'm', name: 'Pictures', type: 'folder', children: [
    {id: 1, name: 'Yosemite'},
    {id: 2, name: 'Jackson Hole'},
    {id: 3, name: 'Crater Lake'}
  ]},
  {id: 'n', name: 'Adobe Acrobat', type: 'file'}
];

export const Dynamic: Story = {
  render: (args) => (
    <ListView {...args} items={items}>
      {(item) => (
        <ListViewItem>{item.name}</ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files'
  }
};

// taken from https://random.dog/
const itemsWithImages: Array<{id: string, title: string, url: string}> = [
  {id: '1', title: 'swimmer', url: 'https://random.dog/b2fe2172-cf11-43f4-9c7f-29bd19601712.jpg'},
  {id: '2', title: 'chocolate', url: 'https://random.dog/2032518a-eec8-4102-9d48-3dca5a26eb23.png'},
  {id: '3', title: 'good boi', url: 'https://random.dog/191091b2-7d69-47af-9f52-6605063f1a47.jpg'},
  {id: '4', title: 'polar bear', url: 'https://random.dog/c22c077e-a009-486f-834c-a19edcc36a17.jpg'},
  {id: '5', title: 'cold boi', url: 'https://random.dog/093a41da-e2c0-4535-a366-9ef3f2013f73.jpg'},
  {id: '6', title: 'pilot', url: 'https://random.dog/09f8ecf4-c22b-49f4-af24-29fb5c8dbb2d.jpg'},
  {id: '7', title: 'nerd', url: 'https://random.dog/1a0535a6-ca89-4059-9b3a-04a554c0587b.jpg'},
  {id: '8', title: 'audiophile', url: 'https://random.dog/32367-2062-4347.jpg'}
];

export const WithImages: Story = {
  render: (args) => (
    <ListView {...args} items={itemsWithImages}>
      {item => (
        <ListViewItem textValue={item.title}>
          <Text>{item.title}</Text>
          {item.url ? <Image src={item.url} alt={item.title} /> : null}
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files'
  }
};

const itemsWithIcons: Array<{id: string, title: string, icons: ReactNode}> = [
  {id: '0', title: 'folder of good bois', icons: <Folder />},
  {id: '1', title: 'swimmer', icons: <File />},
  {id: '2', title: 'chocolate', icons: <File />},
  {id: '3', title: 'good boi', icons: <File />},
  {id: '4', title: 'polar bear', icons: <File />},
  {id: '5', title: 'cold boi', icons: <File />},
  {id: '6', title: 'pilot', icons: <File />},
  {id: '8', title: 'audiophile', icons: <File />},
  {id: '9', title: 'file of great boi', icons: <File />},
  {id: '10', title: 'fuzzy boi', icons: <File />},
  {id: '11', title: 'i know what i am doing', icons: <File />},
  {id: '12', title: 'kisses', icons: <File />},
  {id: '13', title: 'belly rubs', icons: <File />},
  {id: '14', title: 'long boi', icons: <File />},
  {id: '15', title: 'floof', icons: <File />},
  {id: '16', title: 'german sheparpadom', icons: <File />}
];

export const WithIcons: Story = {
  render: (args) => (
    <ListView {...args} items={itemsWithIcons}>
      {item => (
        <ListViewItem textValue={item.title}>
          <Text>{item.title}</Text>
          {item.icons ? item.icons : null}
          <ActionButtonGroup>
            <ActionButton aria-label="Edit"><Edit /></ActionButton>
            <ActionButton aria-label="Delete"><Delete /></ActionButton>
          </ActionButtonGroup>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files'
  }
};

export const Selection: Story = {
  render: (args) => (
    <ListView {...args} items={items} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files',
    selectionMode: 'multiple',
    selectionStyle: 'checkbox'
  }
};

export const HighlightSelection: Story = {
  render: (args) => (
    <ListView {...args} items={items} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files',
    selectionMode: 'multiple',
    selectionStyle: 'highlight'
  }
};

export const DisabledItems: Story = {
  render: (args) => (
    <ListView {...args} items={items} disabledKeys={['a', 'c']} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  ),
  args: {
    'aria-label': 'Files',
    selectionMode: 'multiple'
  }
};

export const Links: Story = {
  render: (args) => (
    <ListView {...args}>
      <ListViewItem id="https://adobe.com/" href="https://adobe.com/" target="_blank">Adobe</ListViewItem>
      <ListViewItem id="https://google.com/" href="https://google.com/" target="_blank">Google</ListViewItem>
      <ListViewItem id="https://apple.com/" href="https://apple.com/" target="_blank">Apple</ListViewItem>
      <ListViewItem id="https://nytimes.com/" href="https://nytimes.com/" target="_blank">New York Times</ListViewItem>
    </ListView>
  ),
  args: {
    'aria-label': 'Bookmarks',
    selectionMode: 'none'
  }
};

export const WithActionMenu: Story = {
  render: (args) => (
    <ListView {...args} onAction={action('onAction')} onSelectionChange={action('onSelectionChange')}>
      <ListViewItem id="a" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
        <ActionMenu onAction={action('actionMenuAction')}>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
      <ListViewItem id="b" textValue="Adobe Photoshop">
        <Text>Adobe Photoshop</Text>
        <Text slot="description">Application</Text>
        <ActionMenu onAction={action('actionMenuAction')}>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
      <ListViewItem id="c" textValue="Adobe Illustrator">
        <Text>Adobe Illustrator</Text>
        <Text slot="description">Application</Text>
        <ActionMenu onAction={action('actionMenuAction')}>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
    </ListView>
  ),
  args: {
    'aria-label': 'Files',
    selectionMode: 'single'
  }
};

export const WithActionButtonGroupAndMenu: Story = {
  render: (args) => (
    <ListView {...args} onAction={action('onAction')} onSelectionChange={action('onSelectionChange')}>
      <ListViewItem id="a" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
        <ActionButtonGroup>
          <ActionButton aria-label="Edit" onPress={action('editPress')}><Edit /></ActionButton>
        </ActionButtonGroup>
        <ActionMenu onAction={action('actionMenuAction')}>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
      <ListViewItem id="b" textValue="Adobe Photoshop">
        <Text>Adobe Photoshop</Text>
        <Text slot="description">Application</Text>
        <ActionButtonGroup>
          <ActionButton aria-label="Edit" onPress={action('editPress')}><Edit /></ActionButton>
        </ActionButtonGroup>
        <ActionMenu onAction={action('actionMenuAction')}>
          <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
          <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
        </ActionMenu>
      </ListViewItem>
    </ListView>
  ),
  args: {
    'aria-label': 'Files',
    selectionMode: 'single'
  },
  name: 'With ActionButtonGroup and ActionMenu'
};

export const EmptyState: Story = {
  render: (args) => (
    <ListView
      {...args}
      renderEmptyState={() => (
        <IllustratedMessage>
          <FolderOpen />
          <Heading>No results</Heading>
          <Content>No results found.</Content>
        </IllustratedMessage>
      )}>
      {[]}
    </ListView>
  ),
  args: {
    'aria-label': 'Empty list'
  }
};

export const Loading: Story = {
  render: (args) => (
    <ListView {...args}>
      {[]}
    </ListView>
  ),
  args: {
    'aria-label': 'Loading list',
    loadingState: 'loading'
  }
};

export const LoadingMore: Story = {
  render: (args) => (
    <ListView {...args}>
      <ListViewItem id="a">Adobe Photoshop</ListViewItem>
      <ListViewItem id="b">Adobe Illustrator</ListViewItem>
      <ListViewItem id="c">Adobe XD</ListViewItem>
    </ListView>
  ),
  args: {
    'aria-label': 'Loading more list',
    loadingState: 'loadingMore',
    onLoadMore: action('onLoadMore')
  }
};

function AsyncListExample(props) {
  interface StarWarsChar {
    name: string,
    url: string
  }

  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ListView
      aria-label="Star Wars characters"
      items={list.items}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}
      selectionMode="multiple"
      {...props}>
      {(item: StarWarsChar) => (
        <ListViewItem id={item.name}>{item.name}</ListViewItem>
      )}
    </ListView>
  );
}

export const AsyncLoading: Story = {
  render: (args) => <AsyncListExample {...args} />
};

export const LongText: Story = {
  render: (args) => (
    <ListView {...args}>
      <ListViewItem id="a">
        This is a very very very very very very very very long title.
      </ListViewItem>
      <ListViewItem id="b" textValue="Short title, long description">
        <Text>Short title</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
      <ListViewItem id="c" textValue="Long title, long description">
        <Text>This is a very very very very very very very very long title.</Text>
        <Text slot="description">This is a very very very very very very very very long description.</Text>
      </ListViewItem>
    </ListView>
  ),
  args: {
    'aria-label': 'Long text examples'
  }
};

function NavigationExample(props: {disabledType?: 'file' | 'folder', showActions?: boolean}) {
  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>());
  let [breadcrumbs, setBreadcrumbs] = useState<Item[]>([
    {
      id: 'root',
      name: 'Root',
      type: 'folder',
      children: items
    }
  ]);

  let {name, children = []} = breadcrumbs[breadcrumbs.length - 1];

  let onAction = (key: Key) => {
    let item = children.find(item => item.id === key);
    if (item?.type === 'folder') {
      setBreadcrumbs([...breadcrumbs, item]);
      setSelectedKeys(new Set());
    }
  };

  let onBreadcrumbAction = (key: Key) => {
    let index = breadcrumbs.findIndex(item => item.id === key);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setSelectedKeys(new Set());
  };

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8, width: 'full', height: 'full'})}>
      <Breadcrumbs onAction={onBreadcrumbAction}>
        {breadcrumbs.map(item => <Breadcrumb key={item.id} id={item.id}>{item.name}</Breadcrumb>)}
      </Breadcrumbs>
      <ListView
        aria-label={name}
        selectionMode="multiple"
        selectionStyle="checkbox"
        selectedKeys={selectedKeys}
        onSelectionChange={chain(setSelectedKeys as any, action('onSelectionChange'))}
        items={children}
        disabledKeys={props.disabledType ? children.filter(item => item.type === props.disabledType).map(item => item.id) : undefined}
        onAction={chain(onAction, action('onAction'))}>
        {(item: Item) => (
          <ListViewItem textValue={item.name} hasChildItems={item.type === 'folder'}>
            {item.type === 'folder' ? <Folder /> : null}
            <Text>{item.name}</Text>
            {props.showActions && (
              <ActionMenu onAction={action('actionMenuAction')}>
                <MenuItem id="edit"><Edit /><Text>Edit</Text></MenuItem>
                <MenuItem id="delete"><Delete /><Text>Delete</Text></MenuItem>
              </ActionMenu>
            )}
          </ListViewItem>
        )}
      </ListView>
    </div>
  );
}

export const Navigation: Story = {
  render: () => <NavigationExample />,
  name: 'hasChildItems navigation'
};
