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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {LogicButton} from '../';
import React from 'react';

export type LogicButtonStory = ComponentStoryObj<typeof LogicButton>;

export default {
  title: 'Button/LogicButton',
  component: LogicButton,
  args: {
    onPress: action('press'),
    onPressStart: action('pressstart'),
    onPressEnd: action('pressend')
  },
  argTypes: {
    onPress: {
      table: {
        disable: true
      }
    },
    onPressStart: {
      table: {
        disable: true
      }
    },
    onPressEnd: {
      table: {
        disable: true
      }
    },
    autoFocus: {
      control: 'boolean'
    },
    variant: {
      control: 'select',
      options: ['and', 'or'],
      defaultValue: 'and'
    }
  }
} as ComponentMeta<typeof LogicButton>;

export const Default: LogicButtonStory = {
  render: (args) => render(args)
};

function render(props: any = {}) {
  return (
    <div>
      <LogicButton
        {...props}>
        Default
      </LogicButton>
      <LogicButton
        marginStart="10px"
        isDisabled
        {...props}>
        Disabled
      </LogicButton>
    </div>
  );
}
