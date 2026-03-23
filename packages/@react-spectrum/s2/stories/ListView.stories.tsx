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

import {action} from 'storybook/actions';
import {ActionBar} from '../src/ActionBar';
import {ActionButton} from '../src/ActionButton';
import {ActionButtonGroup} from '../src/ActionButtonGroup';
import {ActionMenu} from '../src/ActionMenu';
import {Breadcrumb, Breadcrumbs} from '../src/Breadcrumbs';
import {categorizeArgTypes} from './utils';
import {chain} from 'react-aria/private/utils/chain';
import {Content, Heading, Text} from '../src/Content';
import Copy from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import File from '../s2wf-icons/S2_Icon_File_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import {IllustratedMessage} from '../src/IllustratedMessage';
import {Image} from '../src/Image';
import {Key} from '@react-types/shared';
import {ListView, ListViewItem} from '../src/ListView';
import {MenuItem} from '../src/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactNode, useState} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useAsyncList} from 'react-stately/useAsyncList';
import {useDragAndDrop} from 'react-aria-components/useDragAndDrop';
import {useListData} from 'react-stately/useListData';

const meta: Meta<typeof ListView> = {
  component: ListView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onSelectionChange']),
    children: {table: {disable: true}}
  },
  title: 'ListView',
  args: {
    styles: style({height: 320})
  },
  decorators: [
    (Story, context) => {
      let {disableDecorator} = context.parameters;
      if (disableDecorator) {
        return <Story />;
      }

      return (
        <div style={{width: '300px', resize: 'both', height: '320px', minHeight: '320px'}}>
          <Story />
        </div>
      );
    }
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

function NavigationExample(props) {
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
        onSelectionChange={chain(setSelectedKeys, action('onSelectionChange'))}
        items={children}
        onAction={chain(onAction, action('onAction'))}
        styles={style({height: 280, minHeight: 280})}
        {...props}>
        {(item: Item) => (
          <ListViewItem textValue={item.name} hasChildItems={item.type === 'folder'}>
            {item.type === 'folder' ? <Folder /> : null}
            <Text>{item.name}</Text>
          </ListViewItem>
        )}
      </ListView>
    </div>
  );
}

export const Navigation: Story = {
  render: (args) => <NavigationExample {...args} />,
  name: 'hasChildItems navigation'
};

function ActionBarExample(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>());

  return (
    <ListView
      aria-label="Files with action bar"
      selectionMode="multiple"
      selectionStyle="checkbox"
      selectedKeys={selectedKeys}
      onSelectionChange={chain(setSelectedKeys, action('onSelectionChange'))}
      items={items}
      renderActionBar={(keys) => {
        let selection = keys === 'all' ? 'all' : [...keys].join(', ');
        return (
          <ActionBar>
            <ActionButton aria-label="Edit" onPress={() => action('edit')(selection)}>
              <Edit />
            </ActionButton>
            <ActionButton aria-label="Copy" onPress={() => action('copy')(selection)}>
              <Copy />
            </ActionButton>
            <ActionButton aria-label="Delete" onPress={() => action('delete')(selection)}>
              <Delete />
            </ActionButton>
          </ActionBar>
        );
      }}
      styles={style({height: 320})}
      {...props}>
      {(item: Item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : <File />}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  );
}

export const WithActionBar: Story = {
  render: (args) => <ActionBarExample {...args} />,
  args: {
    'aria-label': 'Files with action bar'
  },
  name: 'with ActionBar'
};

function ActionBarEmphasizedExample(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set<Key>());

  return (
    <ListView
      aria-label="Files with emphasized action bar"
      selectionMode="multiple"
      selectionStyle="checkbox"
      selectedKeys={selectedKeys}
      onSelectionChange={chain(setSelectedKeys, action('onSelectionChange'))}
      items={items}
      renderActionBar={(keys) => {
        let selection = keys === 'all' ? 'all' : [...keys].join(', ');
        return (
          <ActionBar isEmphasized>
            <ActionButton aria-label="Edit" onPress={() => action('edit')(selection)}>
              <Edit />
            </ActionButton>
            <ActionButton aria-label="Copy" onPress={() => action('copy')(selection)}>
              <Copy />
            </ActionButton>
            <ActionButton aria-label="Delete" onPress={() => action('delete')(selection)}>
              <Delete />
            </ActionButton>
          </ActionBar>
        );
      }}
      styles={style({height: 320})}
      {...props}>
      {(item: Item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : <File />}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  );
}

export const WithActionBarEmphasized: Story = {
  render: (args) => <ActionBarEmphasizedExample {...args} />,
  args: {
    'aria-label': 'Files with emphasized action bar'
  },
  name: 'with ActionBar (emphasized)'
};

let reorderItems: Item[] = [
  {id: 'a', name: 'Adobe Photoshop', type: 'file'},
  {id: 'b', name: 'Adobe XD', type: 'file'},
  {id: 'c', name: 'Documents', type: 'folder'},
  {id: 'd', name: 'Adobe InDesign', type: 'file'},
  {id: 'e', name: 'Utilities', type: 'folder'},
  {id: 'f', name: 'Adobe AfterEffects', type: 'file'},
  {id: 'g', name: 'Adobe Illustrator', type: 'file'},
  {id: 'h', name: 'Adobe Lightroom', type: 'file'},
  {id: 'i', name: 'Adobe Premiere Pro', type: 'file'},
  {id: 'j', name: 'Adobe Fresco', type: 'file'},
  {id: 'k', name: 'Adobe Dreamweaver', type: 'file'},
  {id: 'l', name: 'Adobe Connect', type: 'file'},
  {id: 'm', name: 'Pictures', type: 'folder'},
  {id: 'n', name: 'Adobe Acrobat', type: 'file'},
  {id: 'o', name: 'Really really really really really long name', type: 'file'}
];

function ReorderExample(props) {
  let list = useListData({
    initialItems: reorderItems
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map(key => ({'text/plain': list.getItem(key)?.name ?? ''}));
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <ListView
      aria-label="reorderable gridlist"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      {...props}>
      {(item: Item) => (
        <ListViewItem textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : <File />}
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  );
}

export const Reorderable: Story = {
  render: (args) => <ReorderExample {...args} />,
  name: 'Drag and drop reordering'
};

let folderList1 = [
  {id: '1', type: 'file', name: 'Adobe Photoshop'},
  {id: '2', type: 'file', name: 'Adobe XD'},
  {id: '3', type: 'folder', name: 'Documents',  childNodes: [] as any[]},
  {id: '4', type: 'file', name: 'Adobe InDesign'},
  {id: '5', type: 'folder', name: 'Utilities',  childNodes: []},
  {id: '6', type: 'file', name: 'Adobe AfterEffects'}
];

let folderList2 = [
  {id: '7', type: 'folder', name: 'Pictures',  childNodes: [] as any[]},
  {id: '8', type: 'file', name: 'Adobe Fresco'},
  {id: '9', type: 'folder', name: 'Apps',  childNodes: []},
  {id: '10', type: 'file', name: 'Adobe Illustrator'},
  {id: '11', type: 'file', name: 'Adobe Lightroom'},
  {id: '12', type: 'file', name: 'Adobe Dreamweaver'},
  {id: '13', type: 'unique_type', name: 'invalid drag item'}
];

let itemProcessor = async (items, acceptedDragTypes) => {
  let processedItems: any[] = [];
  let text = '';
  for (let item of items) {
    for (let type of acceptedDragTypes) {
      if (item.kind === 'text' && item.types.has(type)) {
        text = await item.getText(type);
        processedItems.push(JSON.parse(text));
        break;
      } else if (item.types.size === 1 && item.types.has('text/plain')) {
        // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
        // Multiple drag items are contained in a single string so we need to split them out
        text = await item.getText('text/plain');
        processedItems = text.split('\n').map(val => JSON.parse(val));
        break;
      }
    }
  }
  return processedItems;
};

function BetweenLists(props) {
  let list1 = useListData({
    initialItems: folderList1
  });

  let list2 = useListData({
    initialItems: folderList2
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];

  // List 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dragAndDropHooks: dragAndDropHooksList1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key)!;
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': item.name
      };
    }),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list1.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list1.moveAfter(e.target.key, e.keys);
      }
    },
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...processedItems);
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list1.append(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list1.getItem(target.key)!;
      list1.update(target.key, {...targetItem, childNodes: [...(targetItem.childNodes || []), ...processedItems]});

      if (isInternal && dropOperation === 'move') {
        let keysToRemove = processedItems.map(item => item.id);
        list1.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList1')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key)!.childNodes
  });

// List 2 should allow reordering, on folder drops, and on root drops
  let {dragAndDropHooks: dragAndDropHooksList2} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list2.getItem(key)!;
      let dragItem = {};
      let itemString = JSON.stringify(item);
      dragItem[`${item.type}`] = itemString;
      if (item.type !== 'unique_type') {
        dragItem['text/plain'] = item.name;
      }

      return dragItem;
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorderList2')(e);

      let itemsToCopy: typeof folderList2 = [];
      if (dropOperation === 'copy') {
        for (let key of keys) {
          let item: typeof folderList2[0] = {...list2.getItem(key)!};
          item.id = Math.random().toString(36).slice(2);
          itemsToCopy.push(item);
        }
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          list2.moveBefore(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list2.moveAfter(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList2')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.prepend(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list2.getItem(target.key)!;
      list2.update(target.key, {...targetItem, childNodes: [...(targetItem.childNodes || []), ...processedItems]});

      if (isInternal && dropOperation === 'move') {
        let keysToRemove = processedItems.map(item => item.id);
        list2.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList2')(e);
      if (dropOperation === 'move' && !isInternal) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key)!.type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key)!.childNodes
  });

  return (
    <div style={{display: 'flex', gap: 16}}>
      <ListView
        aria-label="First ListView in drag between list example"
        items={list1.items}
        dragAndDropHooks={dragAndDropHooksList1}
        {...props}
        styles={style({height: 320, width: 320})}>
        {(item: any) => (
          <ListViewItem id={item.id} textValue={item.name}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
            {item.type === 'file' && <File />}
          </ListViewItem>
        )}
      </ListView>
      <ListView
        aria-label="Second ListView in drag between list example"
        items={list2.items}
        dragAndDropHooks={dragAndDropHooksList2}
        {...props}
        styles={style({height: 320, width: 320})}>
        {(item: any) => (
          <ListViewItem id={item.id} textValue={item.name}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
            {item.type === 'file' && <File />}
          </ListViewItem>
        )}
      </ListView>
    </div>
  );
}

export const DragBetweenLists: Story = {
  render: (args) => <BetweenLists {...args} />,
  name: 'Drag between lists',
  parameters: {
    disableDecorator: true
  }
};
