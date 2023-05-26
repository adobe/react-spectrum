import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import {ActionMenu} from '@react-spectrum/menu';
import Add from '@spectrum-icons/workflow/Add';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import Folder from '@spectrum-icons/illustrations/Folder';
import Info from '@spectrum-icons/workflow/Info';
import {Item, ListView} from '../';
import React from 'react';
import RemoveCircle from '@spectrum-icons/workflow/RemoveCircle';
import {Text} from '@react-spectrum/text';
import {useListData} from '@react-stately/data';

export default {
  title: 'ListView/Actions',
  component: ListView,
  excludeStories: [
    'FocusExample'
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
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionStyle: {
      control: {
        type: 'radio',
        options: ['checkbox', 'highlight']
      }
    },
    isQuiet: {
      control: {type: 'boolean'}
    },
    density: {
      control: {
        type: 'select',
        options: ['compact', 'regular', 'spacious']
      }
    },
    overflowMode: {
      control: {
        type: 'radio',
        options: ['truncate', 'wrap']
      }
    },
    disabledBehavior: {
      control: {
        type: 'radio',
        options: ['selection', 'all']
      }
    }
  }
} as ComponentMeta<typeof ListView>;

export type ListViewStory = ComponentStoryObj<typeof ListView>;

export const ActionButtons: ListViewStory = {
  render: (args) => renderActionsExample(props => <ActionButton {...props}><Copy /></ActionButton>, args),
  name: 'ActionButton'
};

export const ActionGroups: ListViewStory = {
  render: (args) => renderActionsExample(() => (
    <ActionGroup buttonLabelBehavior="hide" onAction={action('actionGroupAction')}>
      <Item key="add">
        <Add />
        <Text>Add</Text>
      </Item>
      <Item key="delete">
        <Delete />
        <Text>Delete</Text>
      </Item>
    </ActionGroup>
  ), args),
  name: 'ActionGroup'
};

export const ActionMenus: ListViewStory = {
  render: (args) => renderActionsExample(() => (
    <ActionMenu onAction={action('actionMenuAction')}>
      <Item key="add">
        <Add />
        <Text>Add</Text>
      </Item>
      <Item key="delete">
        <Delete />
        <Text>Delete</Text>
      </Item>
    </ActionMenu>
  ), args),
  name: 'ActionMenu'
};

export const ActionMenusGroup: ListViewStory = {
  render: (args) => renderActionsExample(() => (
    <>
      <ActionGroup buttonLabelBehavior="hide" onAction={action('actionGroupAction')}>
        <Item key="info">
          <Info />
          <Text>Info</Text>
        </Item>
      </ActionGroup>
      <ActionMenu onAction={action('actionMenuACtion')}>
        <Item key="add">
          <Add />
          <Text>Add</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionMenu>
    </>
  ), args),
  name: 'ActionGroup + ActionMenu'
};

export const Focus: ListViewStory = {
  render: (args) => <FocusExample {...args} />,
  name: 'Restore focus after item removal (disabledBehavior: "selection")'
};

function renderActionsExample(renderActions, props?) {
  return (
    <ListView width="300px" selectionMode="single" {...props} onAction={action('onAction')} onSelectionChange={action('onSelectionChange')} aria-label="render actions ListView">
      <Item key="a" textValue="Utilities" hasChildItems>
        <Folder />
        <Text>Utilities</Text>
        <Text slot="description">16 items</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="b" textValue="Adobe Photoshop">
        <Text>Adobe Photoshop</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="c" textValue="Adobe Illustrator">
        <Text>Adobe Illustrator</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
      <Item key="d" textValue="Adobe XD">
        <Text>Adobe XD</Text>
        <Text slot="description">Application</Text>
        {renderActions({onPress: action('actionPress')})}
      </Item>
    </ListView>
  );
}

export const FocusExample = (args) => {
  const items = [
    {id: 1, name: 'Adobe Photoshop'},
    {id: 2, name: 'Adobe XD'},
    {id: 3, name: 'Adobe InDesign'},
    {id: 4, name: 'Adobe AfterEffects'},
    {id: 5, name: 'Adobe Flash', isDisabled: true},
    {id: 6, name: 'Adobe Illustrator'},
    {id: 7, name: 'Adobe Lightroom'},
    {id: 8, name: 'Adobe Premiere Pro'},
    {id: 9, name: 'Adobe Fresco'},
    {id: 10, name: 'Adobe Dreamweaver'}
  ];

  const list = useListData({
    initialItems: items,
    initialSelectedKeys: []
  });

  return (
    <ListView aria-label="listview with removable items" width="250px" items={list.items} disabledKeys={['5']} {...args}>
      {(item: any) => (
        <Item key={item.id} textValue={item.name}>
          <Text>{item.name}</Text>
          <ActionButton aria-label={`Remove ${item.name}`} isQuiet onPress={() => list.remove(item.id)} isDisabled={item.isDisabled}>
            <RemoveCircle />
          </ActionButton>
        </Item>
      )}
    </ListView>
  );
};
