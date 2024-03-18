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

import {action} from '@storybook/addon-actions';
import {Checkbox} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import {Link} from '@react-spectrum/link';
import React from 'react';

export type CheckboxStory = ComponentStoryObj<typeof Checkbox>;

export default {
  title: 'Checkbox',
  component: Checkbox,
  args: {
    onChange: action('onChange')
  },
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    defaultSelected: {
      control: 'boolean'
    },
    isSelected: {
      control: 'boolean'
    },
    isIndeterminate: {
      control: 'boolean'
    },
    isEmphasized: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    },
    isInvalid: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof Checkbox>;

export const Default: CheckboxStory = {
  render: (args) => render(args)
};

export const CustomLabel: CheckboxStory = {
  render: (args) => renderCustomLabel(args)
};

export const LongLabel: CheckboxStory = {
  render: (args) => (
    <Checkbox
      {...args}>
      Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris. Italiam, fato profugus, Laviniaque venit.
    </Checkbox>
  )
};

export const NoLabel: CheckboxStory = {
  render: (args) => renderNoLabel(args)
};

export const WHCM: CheckboxStory = {
  render: () => (
    <Flex direction="column" gap="size-200">
      <Flex gap="size-200">Shows the different states from <Link><a href="https://spectrum.adobe.com/static/Windows-High-Contrast-Kits/Checkbox-WindowsHighContrast.xd">spectrum</a></Link></Flex>
      {renderRow()}
      {renderRow({isSelected: true, isEmphasized: true})}
      {renderRow({isIndeterminate: true, isEmphasized: true})}
      {renderRow({isSelected: true, isEmphasized: false})}
      {renderRow({isIndeterminate: true, isEmphasized: false})}
      {renderRow({isInvalid: true})}
      {renderRow({isSelected: true, isInvalid: true})}
    </Flex>
  )
};

function render(props = {}) {
  return (
    <Checkbox {...props}>
      Checkbox Label
    </Checkbox>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Checkbox {...props}>
      <span><i>Italicized</i> Checkbox Label</span>
    </Checkbox>
  );
}

function renderNoLabel(props = {}) {
  return (
    <Checkbox aria-label="checkbox with no visible label" {...props} />
  );
}

function renderRow(props = {}) {
  return (
    <Flex gap="size-200">
      <Checkbox {...props}>
        Option
      </Checkbox>
      <Checkbox isDisabled {...props}>
        Option
      </Checkbox>
    </Flex>
  );
}
