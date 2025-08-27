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

import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Meter} from '../';
import {NumberFormatOptions} from '@internationalized/number';
import React from 'react';

type MeterStory = ComponentStoryObj<typeof Meter>;

const formatOptions = {
  style: 'currency',
  currency: 'JPY'
} satisfies NumberFormatOptions;

export default {
  title: 'Meter',
  component: Meter,
  args: {
    variant: 'informative'
  },
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    },
    variant: {
      control: {
        type: 'radio',
        options: ['informative', 'positive', 'warning', 'critical']
      }
    },
    size: {
      control: {
        type: 'radio',
        options: ['S', 'L']
      }
    },
    showValueLabel: {
      control: 'boolean'
    },
    labelPosition: {
      control: 'radio',
      options: ['top', 'side']
    }
  }
}as ComponentMeta<typeof Meter>;

export const Default: MeterStory = {
  args: {label: 'Meter', value: 50},
  name: 'value: 50',
  parameters: {
    a11y: {
      config: {
        // Erroring attributes work for meter and/or progressbar, but combined role confuses aXe
        rules: [{id: 'aria-allowed-attr', selector: '*:not([role="meter progressbar"])'}]
      }
    }
  }
};

export const ValueLabel1Of4: MeterStory = {
  ...Default,
  args: {...Default.args, value: 25, valueLabel: '1 of 4'},
  name: 'valueLabel: 1 of 4'
};

export const UsingNumberFormatOptionsWithCurrencyStyle: MeterStory = {
  ...Default,
  args: {...Default.args, showValueLabel: true, formatOptions},
  name: 'Using number formatOptions with currency style'
};

export const NoVisibleLabel: MeterStory = {
  ...Default,
  args: {...Default.args, label: null, 'aria-label': 'Meter'},
  name: 'no visible label'
};

export const ParentWidth100: MeterStory = {
  ...Default,
  args: {...Default.args, value: 32},
  decorators: [
    (Story) => (
      <span style={{width: '100%'}}>
        <Story />
      </span>
    )
  ],
  name: 'parent width 100%'
};

export const ParentWidth100Px: MeterStory = {
  ...Default,
  args: {...Default.args, value: 32},
  decorators: [
    (Story) => (
      <span style={{width: '100px'}}>
        <Story />
      </span>
    )
  ],
  name: 'parent width 100px'
};

export const Width300Px: MeterStory = {
  ...Default,
  args: {...Default.args, value: 32, width: '300px'},
  name: 'width: 300px'
};

export const Width30Px: MeterStory = {
  ...Default,
  args: {...Default.args, value: 32, width: '30px'},
  name: 'width: 30px'
};

export const UsingRawValuesForMinValueMaxValueAndValue: MeterStory = {
  ...Default,
  args: {...Default.args, showValueLabel: true, labelPosition: 'top', maxValue: 2147483648, value: 715827883},
  name: 'Using raw values for minValue, maxValue, and value'
};

export const UsingRawValuesWithNumberFormatter: MeterStory = {
  ...Default,
  args: {...Default.args, showValueLabel: true, labelPosition: 'top', maxValue: 2147483648, value: 715827883, formatOptions},
  name: 'Using raw values with number formatter'
};
