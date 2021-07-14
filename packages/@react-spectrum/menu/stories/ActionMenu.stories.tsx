import {action} from '@storybook/addon-actions';
import {ActionMenu} from '..';
import {Item} from '../';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumActionMenuProps} from '@react-types/menu';


const meta: Meta<SpectrumActionMenuProps<object>> = {
  title: 'ActionMenu',
  component: ActionMenu
};

export default meta;

const Template = <T extends object>(): Story<SpectrumActionMenuProps<T>> => (args) => (
  <ActionMenu onAction={action('action')} {...args}>
    <Item key="one">One</Item>
    <Item key="two">Two</Item>
    <Item key="three">Three</Item>
  </ActionMenu>
);

export const Default = Template().bind({});
Default.args = {};

export const AriaLabel = Template().bind({});
AriaLabel.args = {'aria-label': 'Some more actions'};

export const DOMId = Template().bind({});
DOMId.args = {id: 'my-action-menu'};
