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
import {ActionBar} from '../src';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Example} from './Example';
import React from 'react';
import {useViewportSize} from '@react-aria/utils';

export default {
  title: 'ActionBar',
  component: ActionBar,
  args: {
    onAction: action('onAction')
  },
  argTypes: {
    onAction: {
      table: {
        disable: true
      }
    },
    isEmphasized: {
      control: 'boolean'
    },
    buttonLabelBehavior: {
      control: 'select',
      options: ['show', 'hide', 'collapse']
    }
  }
} as ComponentMeta<typeof ActionBar>;

export type ActionBarStory = ComponentStoryObj<any>;

export const Default: ActionBarStory = {
  render: (args) => <Example {...args} />,
  parameters: {
    a11y: {
      config: {
        // Fails due to TableView's known issue, ignoring here since it isn't pertinent to the story
        rules: [{id: 'aria-required-children', selector: '*:not([role="grid"])'}]
      }
    }
  }
};

export const FullWidthStory: ActionBarStory = {
  ...Default,
  render: (args) => <FullWidth {...args} />
};

function FullWidth(props) {
  let viewport = useViewportSize();
  return <Example tableWidth="100vw" containerHeight={viewport.height} isQuiet {...props} />;
}

export const DisabledKeysStory: ActionBarStory = {
  ...Default,
  render: (args) => <DisabledKeys {...args} />
};

function DisabledKeys(props) {
  return <Example disabledKeys={['edit']} {...props} />;
}
