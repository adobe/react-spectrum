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

import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SpectrumTooltipProps} from '@react-types/tooltip';
import {Tooltip} from '../';

const meta: Meta<SpectrumTooltipProps> = {
  title: 'Tooltip',
  component: Tooltip
};

export default meta;


const Template = (): Story<SpectrumTooltipProps> => (args) => (
  <div style={{display: 'inline-block'}}>
    <Tooltip
      {...args}
      isOpen>
      Tooltip content
    </Tooltip>
  </div>
);


export const Default = Template().bind({});
Default.args = {};

export const PlacementLeft = Template().bind({});
PlacementLeft.args = {...Default.args, placement: 'left'};

export const PlacementRight = Template().bind({});
PlacementRight.args = {...Default.args, placement: 'right'};

export const PlacementBottom = Template().bind({});
PlacementBottom.args = {...Default.args, placement: 'bottom'};

export const Info = Template().bind({});
Info.args = {...Default.args, variant: 'info'};

export const Positive = Template().bind({});
Positive.args = {...Default.args, variant: 'positive'};

export const Negative = Template().bind({});
Negative.args = {...Default.args, variant: 'negative'};
