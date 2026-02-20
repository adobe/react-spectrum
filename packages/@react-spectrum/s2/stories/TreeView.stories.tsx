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

import {action} from '@storybook/addon-actions';
import {
  ActionMenu,
  Collection,
  Content,
  Heading,
  IllustratedMessage,
  Link,
  MenuItem,
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  TreeViewItemProps,
  TreeViewLoadMoreItem,
  TreeViewLoadMoreItemProps,
  TreeViewProps
} from '../src';
import {categorizeArgTypes, getActionArgs} from './utils';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useCallback, useState} from 'react';
import {useAsyncList, useListData} from 'react-stately';

let onActionFunc = action('onAction');
let noOnAction = null;
const onActionOptions = {onActionFunc, noOnAction};
const events = ['onSelectionChange', 'onAction'];

const meta: Meta<typeof TreeView> = {
  component: TreeView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}},
    onAction: {
      options: Object.keys(onActionOptions), // An array of serializable values
      mapping: onActionOptions, // Maps serializable option values to complex arg values
      control: {
        type: 'select', // Type 'select' is automatically inferred when 'options' is defined
        labels: {
          // 'labels' maps option values to string labels
          onActionFunc: 'onAction enabled',
          noOnAction: 'onAction disabled'
        }
      },
      table: {category: 'Events'}
    }
  }
};

export default meta;

const TreeExampleStatic = (args: TreeViewProps<any>): ReactElement => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
    <TreeView
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
      <TreeViewItem id="Photos" textValue="Photos">
        <TreeViewItemContent>
          <Text>Photos</Text>
          <Folder />
          <ActionMenu onAction={action('onActionGroup action')}>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
      </TreeViewItem>
      <TreeViewItem id="projects" textValue="Projects">
        <TreeViewItemContent>
          <Text>Projects</Text>
          <Folder />
          <ActionMenu onAction={action('onActionGroup action')}>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <TreeViewItem id="projects-1" textValue="Projects-1">
          <TreeViewItemContent>
            <Text>Projects-1</Text>
            <Folder />
            <ActionMenu onAction={action('onActionGroup action')}>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
          <TreeViewItem id="projects-1A" textValue="Projects-1A">
            <TreeViewItemContent>
              <Text>Projects-1A</Text>
              <FileTxt />
              <ActionMenu onAction={action('onActionGroup action')}>
                <MenuItem id="edit">
                  <Edit />
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Delete />
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="projects-2" textValue="Projects-2">
          <TreeViewItemContent>
            <Text>Projects-2</Text>
            <FileTxt />
            <ActionMenu onAction={action('onActionGroup action')}>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects-3" textValue="Projects-3">
          <TreeViewItemContent>
            <Text>Projects-3</Text>
            <FileTxt />
            <ActionMenu onAction={action('onActionGroup action')}>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

export const Example: StoryObj<typeof TreeExampleStatic> = {
  render: TreeExampleStatic,
  args: {
    selectionMode: 'multiple'
  },
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
<div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
  <TreeView
    disabledKeys={['projects-1']}
    aria-label="test static tree">
    <TreeViewItem id="Photos" textValue="Photos">
      <TreeViewItemContent>
        <Text>Photos</Text>
        <Folder />
        <ActionMenu>
          <MenuItem id="edit">
            <Edit />
            <Text>Edit</Text>
          </MenuItem>
          <MenuItem id="delete">
            <Delete />
            <Text>Delete</Text>
          </MenuItem>
        </ActionMenu>
      </TreeViewItemContent>
    </TreeViewItem>
    <TreeViewItem id="projects" textValue="Projects">
      <TreeViewItemContent>
        <Text>Projects</Text>
        <Folder />
        <ActionMenu>
          <MenuItem id="edit">
            <Edit />
            <Text>Edit</Text>
          </MenuItem>
          <MenuItem id="delete">
            <Delete />
            <Text>Delete</Text>
          </MenuItem>
        </ActionMenu>
      </TreeViewItemContent>
      <TreeViewItem id="projects-1" textValue="Projects-1">
        <TreeViewItemContent>
          <Text>Projects-1</Text>
          <Folder />
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <TreeViewItem id="projects-1A" textValue="Projects-1A">
          <TreeViewItemContent>
            <Text>Projects-1A</Text>
            <FileTxt />
            <ActionMenu>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem id="projects-2" textValue="Projects-2">
        <TreeViewItemContent>
          <Text>Projects-2</Text>
          <FileTxt />
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
      </TreeViewItem>
      <TreeViewItem id="projects-3" textValue="Projects-3">
        <TreeViewItemContent>
          <Text>Projects-3</Text>
          <FileTxt />
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
      </TreeViewItem>
    </TreeViewItem>
  </TreeView>
</div>
          `;
        }
      }
    }
  }
};

const TreeExampleStaticNoActions = (args: TreeViewProps<any>): ReactElement => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
    <TreeView
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
      <TreeViewItem id="Photos" textValue="Photos">
        <TreeViewItemContent>
          <Text>Photos</Text>
          <Folder />
        </TreeViewItemContent>
      </TreeViewItem>
      <TreeViewItem id="projects" textValue="Projects">
        <TreeViewItemContent>
          <Text>Projects</Text>
          <Folder />
        </TreeViewItemContent>
        <TreeViewItem id="projects-1" textValue="Projects-1">
          <TreeViewItemContent>
            <Text>Projects-1</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="projects-1A" textValue="Projects-1A">
            <TreeViewItemContent>
              <Text>Projects-1A</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="projects-2" textValue="Projects-2">
          <TreeViewItemContent>
            <Text>Projects-2</Text>
            <FileTxt />
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects-3" textValue="Projects-3">
          <TreeViewItemContent>
            <Text>Projects-3</Text>
            <FileTxt />
          </TreeViewItemContent>
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

export const ExampleNoActions: StoryObj<typeof TreeExampleStaticNoActions> = {
  render: TreeExampleStaticNoActions,
  args: {
    selectionMode: 'multiple'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

interface TreeViewItemType {
  id?: string,
  name: string,
  icon?: ReactElement,
  childItems?: TreeViewItemType[]
}

let rows: TreeViewItemType[] = [
  {id: 'projects', name: 'Projects', icon: <Folder />, childItems: [
    {id: 'project-1', name: 'Project 1 Level 1', icon: <FileTxt />},
    {id: 'project-2', name: 'Project 2 Level 1', icon: <Folder />, childItems: [
      {id: 'project-2A', name: 'Project 2A Level 2', icon: <FileTxt />},
      {id: 'project-2B', name: 'Project 2B Level 2', icon: <FileTxt />},
      {id: 'project-2C', name: 'Project 2C Level 3', icon: <FileTxt />}
    ]},
    {id: 'project-3', name: 'Project 3', icon: <FileTxt />},
    {id: 'project-4', name: 'Project 4', icon: <FileTxt />},
    {id: 'project-5', name: 'Project 5', icon: <Folder />, childItems: [
      {id: 'project-5A', name: 'Project 5A', icon: <FileTxt />},
      {id: 'project-5B', name: 'Project 5B', icon: <FileTxt />},
      {id: 'project-5C', name: 'Project 5C', icon: <FileTxt />}
    ]}
  ]},
  {id: 'reports', name: 'Reports', icon: <Folder />, childItems: [
    {id: 'reports-1', name: 'Reports 1', icon: <Folder />, childItems: [
      {id: 'reports-1A', name: 'Reports 1A', icon: <Folder />, childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', icon: <Folder />, childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC', icon: <FileTxt />}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B', icon: <FileTxt />},
      {id: 'reports-1C', name: 'Reports 1C', icon: <FileTxt />}
    ]},
    {id: 'reports-2', name: 'Reports 2', icon: <FileTxt />},
    ...Array.from({length: 100}, (_, i) => ({id: `reports-repeat-${i}`, name: `Reports ${i}`, icon: <FileTxt />}))
  ]}
];

const DynamicTreeItem = (props: Omit<TreeViewItemProps, 'children'> & TreeViewItemType & TreeViewLoadMoreItemProps): ReactElement => {
  let {childItems, name, icon = <FileTxt />, loadingState, onLoadMore} = props;
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {icon}
          <ActionMenu onAction={action('onActionGroup action')}>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item) => (
            <DynamicTreeItem
              id={item.id || item.name}
              icon={item.icon}
              childItems={item.childItems}
              textValue={item.name}
              name={item.name}
              href={props.href} />
          )}
        </Collection>
        {onLoadMore && loadingState && <TreeViewLoadMoreItem loadingState={loadingState} onLoadMore={onLoadMore} /> }
      </TreeViewItem>
    </>
  );
};

const TreeExampleDynamic = (args: TreeViewProps<TreeViewItemType>): ReactElement => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
    <TreeView disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')} {...args}>
      {(item) => (
        <DynamicTreeItem
          id={item.id}
          icon={item.icon}
          childItems={item.childItems}
          textValue={item.name}
          name={item.name} />
      )}
    </TreeView>
  </div>
);

export const Dynamic: StoryObj<typeof TreeExampleDynamic> = {
  render: TreeExampleDynamic,
  args: {
    ...Example.args,
    disabledKeys: ['project-2C', 'project-5']
  },
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
const DynamicTreeItem = (props: Omit<TreeViewItemProps, 'children'> & TreeViewItemType & TreeViewLoadMoreItemProps): ReactElement => {
  let {childItems, name, icon = <FileTxt />, loadingState, onLoadMore} = props;
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {icon}
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item) => (
            <DynamicTreeItem
              id={item.id || item.name}
              icon={item.icon}
              childItems={item.childItems}
              textValue={item.name}
              name={item.name}
              href={props.href} />
          )}
        </Collection>
        {onLoadMore && loadingState && <TreeViewLoadMoreItem loadingState={loadingState} onLoadMore={onLoadMore} /> }
      </TreeViewItem>
    </>
  );
};

<div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
  <TreeView disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows}>
    {(item) => (
      <DynamicTreeItem
        id={item.id}
        icon={item.icon}
        childItems={item.childItems}
        textValue={item.name}
        name={item.name} />
    )}
  </TreeView>
</div>
          `;
        }
      }
    }
  }
};

function renderEmptyState(): ReactElement {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link href="https://adobe.com" onPress={action('linkPress')}>here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

export const Empty: StoryObj<typeof TreeExampleDynamic> = {
  render: TreeExampleDynamic,
  args: {
    renderEmptyState,
    items: []
  },
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
function renderEmptyState(): ReactElement {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link href="https://adobe.com" onPress={action('linkPress')}>here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

<div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
  <TreeView items={[]}>
    {(item) => (
      <DynamicTreeItem
        id={item.id}
        icon={item.icon}
        childItems={item.childItems}
        textValue={item.name}
        name={item.name} />
    )}
  </TreeView>
</div>
          `;
        }
      }
    }
  }
};

const TreeExampleWithLinks = (args: TreeViewProps<TreeViewItemType>): ReactElement => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
    <TreeView {...args} disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem
          id={item.id}
          icon={item.icon}
          childItems={item.childItems}
          textValue={item.name}
          name={item.name}
          href="https://adobe.com/" />
      )}
    </TreeView>
  </div>
);

export const WithLinks: StoryObj<typeof TreeExampleWithLinks> = {
  ...Dynamic,
  render: TreeExampleWithLinks,
  name: 'Tree with links',
  parameters: {
    description: {
      data: 'every tree item should link to adobe.com'
    },
    docs: {
      disable: true
    }
  }
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const AsyncTree = (args: TreeViewProps<any> & {delay: number}): ReactElement => {
  let root = [
    {id: 'photos-1', name: 'Photos 1'},
    {id: 'photos-2', name: 'Photos 2'},
    {id: 'photos-3', name: 'Photos 3'},
    {id: 'photos-4', name: 'Photos 4'},
    {id: 'photos-5', name: 'Photos 5'},
    {id: 'photos-6', name: 'Photos 6'}
  ];

  let rootData = useListData({
    initialItems: root
  });

  let starWarsList = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      action('starwars loading')();
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  let [isRootLoading, setRootLoading] = useState(false);
  let onRootLoadMore = useCallback(() => {
    if (!isRootLoading) {
      action('root loading')();
      setRootLoading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, name: string}[] = [];
        let rootLength = rootData.items.length;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `photos-${i + rootLength + 1}`, name: `Photos-${i + rootLength + 1}`});
        }
        rootData.append(...dataToAppend);
        setRootLoading(false);
      }, args.delay);
    }
  }, [isRootLoading, rootData, args.delay]);

  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
      <TreeView aria-label="async loading tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')} {...args}>
        <DynamicTreeItem
          id="starwars"
          icon={<Folder />}
          name="Star Wars"
          textValue="Star Wars"
          childItems={starWarsList.items}
          loadingState={starWarsList.loadingState}
          onLoadMore={starWarsList.loadMore} />
        <Collection items={rootData.items}>
          {(item: any) => (
            <DynamicTreeItem
              id={item.id}
              icon={<FileTxt />}
              name={item.name}
              textValue={item.name} />
          )}
        </Collection>
        <TreeViewLoadMoreItem loadingState={isRootLoading ? 'loading' : 'idle'} onLoadMore={onRootLoadMore} />
      </TreeView>
    </div>
  );
};

export const AsyncLoading: StoryObj<typeof AsyncTree> = {
  render: AsyncTree,
  name: 'Async loading',
  args: {
    selectionMode: 'multiple',
    delay: 500
  },
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
const DynamicTreeItem = (props: Omit<TreeViewItemProps, 'children'> & TreeViewItemType & TreeViewLoadMoreItemProps): ReactElement => {
  let {childItems, name, icon = <FileTxt />, loadingState, onLoadMore} = props;
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {icon}
          <ActionMenu onAction={action('onActionGroup action')}>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item) => (
            <DynamicTreeItem
              id={item.id || item.name}
              icon={item.icon}
              childItems={item.childItems}
              textValue={item.name}
              name={item.name}
              href={props.href} />
          )}
        </Collection>
        {onLoadMore && loadingState && <TreeViewLoadMoreItem loadingState={loadingState} onLoadMore={onLoadMore} /> }
      </TreeViewItem>
    </>
  );
};

<div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto'}}>
  <TreeView aria-label="async loading tree">
    <DynamicTreeItem
      id="starwars"
      icon={<Folder />}
      name="Star Wars"
      textValue="Star Wars"
      childItems={starWarsList.items}
      loadingState={starWarsList.loadingState}
      onLoadMore={starWarsList.loadMore} />
    <Collection items={rootList.items}>
      {(item: any) => (
        <DynamicTreeItem
          id={item.id}
          icon={<FileTxt />}
          name={item.name}
          textValue={item.name} />
      )}
    </Collection>
    <TreeViewLoadMoreItem loadingState={rootList.loadingState} onLoadMore={rootList.loadMore} />
  </TreeView>
</div>
          `;
        }
      }
    }
  }
};
