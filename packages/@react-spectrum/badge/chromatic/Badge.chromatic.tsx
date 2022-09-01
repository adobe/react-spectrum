/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Badge} from '../';
import CheckmarkCircle from '@spectrum-icons/workflow/src/CheckmarkCircle';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {SpectrumBadgeProps} from '@react-types/badge';
import {Text} from '@react-spectrum/text';

let variants: SpectrumBadgeProps['variant'][] =
  ['positive', 'info', 'negative', 'neutral', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'magenta', 'purple'];

type BadgeStory = ComponentStoryObj<typeof Badge>;

export default {
  title: 'Badge',
  component: Badge
} as ComponentMeta<typeof Badge>;

const renderVariants = (args) => (
  <Flex wrap gap={8}>
    {variants.map((variant) => <Badge {...args} variant={variant} />)}
  </Flex>
);

export const TextOnly: BadgeStory = {
  args: {children: 'Badge text'},
  render: renderVariants
};

export const IconOnly: BadgeStory = {
  args: {children: <CheckmarkCircle />},
  render: renderVariants
};

export const IconText: BadgeStory = {
  name: 'Icon & text',
  args: {children: <><CheckmarkCircle /><Text>Badge text</Text></>},
  render: renderVariants
};
