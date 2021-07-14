/*
 * Copyright 2021 Adobe. All rights reserved.
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

export const Quiet = Template().bind({});
Quiet.args = {direction: 'top', align: 'end', isQuiet: true};
