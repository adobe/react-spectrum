/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import {Content, View} from '@react-spectrum/view';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Item, ListView} from '../';
import {Meta, Story} from '@storybook/react';
import React from 'react';

let flatOptions = [
  {name: 'row 1'},
  {name: 'row 2'},
  {name: 'row 3'}
];

let withButtons = [
  {name: 'row 1', button: 'Button 1'},
  {name: 'row 2', button: 'Button 2'},
  {name: 'row 3', button: 'Button 3'}
];

const meta: Meta = {
  title: 'ListView',
  component: ListView,
  parameters: {
    // noticed a small shifting before final layout, delaying so chromatic doesn't hit that
    chromatic: {delay: 600}
  }
};

export default meta;

const Template = (): Story => (args) => (
  <ListView {...args} width="size-3400" items={flatOptions}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </ListView>
);

const TemplateWithButtons = (): Story => (args) => (
  <ListView {...args} width="size-3400" items={withButtons}>
    {(item) => (
      <Item key={item.name}>
        <Flex alignItems="center">
          <View flexGrow={1}>{item.name}</View>
          <ActionButton>{item.button}</ActionButton>
        </Flex>
      </Item>
    )}
  </ListView>
);

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

const TemplateEmptyState = (): Story => () => (
  <ListView width="size-3400" height="size-6000" renderEmptyState={renderEmptyState}>
    {[]}
  </ListView>
);

export const Default = Template().bind({});
Default.storyName = 'default';

export const WithButtons = TemplateWithButtons().bind({});
WithButtons.storyName = 'with buttons';

export const Empty = TemplateEmptyState().bind({});
Empty.storyName = 'empty state';
