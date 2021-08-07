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

import {Card} from '../';
import {
  Default,
  LongContent
} from './Card.stories';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumCardProps} from '@react-types/cards';


const meta: Meta<SpectrumCardProps> = {
  title: 'Card/horizontal',
  component: Card
};

export default meta;


const Template = (): Story<SpectrumCardProps> => (args) => (
  <div style={{width: '350px'}}>
    <Card {...args} />
  </div>
);

export const Horizontal = Template().bind({});
Horizontal.args = {...Default.args, orientation: 'horizontal'};

export const HorizontalLongDescription = Template().bind({});
HorizontalLongDescription.args = {...LongContent.args, orientation: 'horizontal'};

