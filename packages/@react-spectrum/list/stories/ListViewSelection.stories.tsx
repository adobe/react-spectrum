import {action} from '@storybook/addon-actions';
import {ActionMenu} from '@react-spectrum/menu';
import Add from '@spectrum-icons/workflow/Add';
import {Breadcrumbs} from '@react-spectrum/breadcrumbs';
import {chain} from '@react-aria/utils';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import Delete from '@spectrum-icons/workflow/Delete';
import Folder from '@spectrum-icons/illustrations/Folder';
import {Item, ListView} from '../';
import {items} from './ListView.stories';
import React, {useState} from 'react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'ListView/Selection',
  component: ListView,
  excludeStories: [
  ],
  args: {
    isQuiet: false,
    density: 'regular',
    selectionMode: 'multiple',
    selectionStyle: 'checkbox',
    overflowMode: 'truncate',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionStyle: {
      control: 'radio',
      options: ['checkbox', 'highlight']
    },
    isQuiet: {
      control: 'boolean'
    },
    density: {
      control: 'select',
      options: ['compact', 'regular', 'spacious']
    },
    overflowMode: {
      control: 'radio',
      options: ['truncate', 'wrap']
    },
    disabledBehavior: {
      control: 'radio',
      options: ['selection', 'all']
    }
  }
} as ComponentMeta<typeof ListView>;

export type ListViewStory = ComponentStoryObj<typeof ListView>;

export const Default: ListViewStory = {
  render: (args) => (
    <ListView aria-label="default selection ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  ),
  name: 'default'
};

export const DisableFolders: ListViewStory = {
  render: (args) => (
    <ListView aria-label="disabled folders ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} disabledKeys={['c', 'e', 'm']} {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  ),
  name: 'disable folders'
};

export const DisableFolderSelection: ListViewStory = {
  render: (args) => (
    <ListView aria-label="disabled folder selection ListView" width="250px" height={400} onSelectionChange={action('onSelectionChange')} items={items} disabledKeys={['c', 'e', 'm']} disabledBehavior="selection" {...args}>
      {(item: any) => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : null}
          <Text>{item.name}</Text>
          <ActionMenu>
            <Item key="add">
              <Add />
              <Text>Add</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionMenu>
        </Item>
      )}
    </ListView>
  ),
  name: 'disable folders selection'
};

export const Links = (args) => {
  return (
    <ListView aria-label="ListView with links" width="250px" height={400} onSelectionChange={action('onSelectionChange')} {...args}>
      <Item key="https://adobe.com/" href="https://adobe.com/">Adobe</Item>
      <Item key="https://google.com/" href="https://google.com/">Google</Item>
      <Item key="https://apple.com/" href="https://apple.com/">Apple</Item>
      <Item key="https://nytimes.com/" href="https://nytimes.com/">New York Times</Item>
    </ListView>
  );
};

export const OnAction: ListViewStory = {
  render: (args) => (
    <NavigationExample {...args} />
  ),
  name: 'onAction'
};

export const OnActionDisableFolders: ListViewStory = {
  render: (args) => (
    <NavigationExample disabledType="folder" disabledBehavior="selection" {...args} />
  ),
  name: 'onAction, disable folder selection'
};

export const onActionDisableFoldersRowActions: ListViewStory = {
  render: (args) => (
    <NavigationExample disabledType="folder" disabledBehavior="selection" showActions {...args} />
  ),
  name: 'onAction, disable folder selection, with row action'
};

export const onActionDisableFiles: ListViewStory = {
  render: (args) => (
    <NavigationExample disabledType="file" {...args} />
  ),
  name: 'onAction, disable files'
};

export const onActionDisableFilesRowActions: ListViewStory = {
  render: (args) => (
    <NavigationExample disabledType="file" showActions {...args} />
  ),
  name: 'onAction, disable files, with row actions'
};

function NavigationExample(props) {
  let [selectedKeys, setSelectedKeys] = useState(new Set());
  let [breadcrumbs, setBreadcrumbs] = useState([
    {
      key: 'root',
      name: 'Root',
      type: 'folder',
      children: items
    }
  ]);

  let {name, children} = breadcrumbs[breadcrumbs.length - 1];

  let onAction = key => {
    let item = children.find(item => item.key === key);
    if (item.type === 'folder') {
      setBreadcrumbs([...breadcrumbs, item]);
      setSelectedKeys(new Set());
    }
  };

  let onBreadcrumbAction = key => {
    let index = breadcrumbs.findIndex(item => item.key === key);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setSelectedKeys(new Set());
  };

  return (
    <div>
      <Breadcrumbs onAction={onBreadcrumbAction}>
        {breadcrumbs.map(item => <Item key={item.key}>{item.name}</Item>)}
      </Breadcrumbs>
      <ListView
        aria-label={name}
        width="250px"
        height={400}
        onSelectionChange={chain(setSelectedKeys, action('onSelectionChange'))}
        selectionMode="multiple"
        selectionStyle="checkbox"
        selectedKeys={selectedKeys}
        items={children}
        disabledKeys={props.disabledType ? children.filter(item => item.type === props.disabledType).map(item => item.key) : null}
        onAction={chain(onAction, action('onAction'))}
        {...props}>
        {(item: any) => (
          <Item hasChildItems={item.type === 'folder'} textValue={item.name}>
            {item.type === 'folder' ? <Folder /> : null}
            <Text>{item.name}</Text>
            {props.showActions &&
              <ActionMenu>
                <Item key="add">
                  <Add />
                  <Text>Add</Text>
                </Item>
                <Item key="delete">
                  <Delete />
                  <Text>Delete</Text>
                </Item>
              </ActionMenu>
            }
          </Item>
        )}
      </ListView>
    </div>
  );
}
