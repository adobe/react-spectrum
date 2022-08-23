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

import {Badge} from '../';
import CheckmarkCircle from '@spectrum-icons/workflow/src/CheckmarkCircle';
import {Flex} from '@react-spectrum/layout';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumBadgeProps} from '@react-types/badge';
import {Text} from '@react-spectrum/text';

let variants = ['positive', 'info', 'negative', 'neutral', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'magenta', 'purple'];

const meta: Meta<SpectrumBadgeProps> = {
  title: 'Badge',
  component: Badge
};

export default meta;

const Template = (): Story<SpectrumBadgeProps> => (args) => (
  <Flex wrap>
    {variants.map((variant: SpectrumBadgeProps['variant']) => (
      <Badge variant={variant} {...args} />
    ))}
  </Flex>
);

export const TextOnly = Template().bind({});
TextOnly.args = {children: 'Badge text'};

export const IconOnly = Template().bind({});
IconOnly.args = {children: <CheckmarkCircle />};

export const IconText = Template().bind({});
IconText.args = {children: <><CheckmarkCircle /><Text>Badge text</Text></>};
