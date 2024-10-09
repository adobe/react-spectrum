/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, ButtonGroup, Text} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof ButtonGroup> = {
  component: ButtonGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'ButtonGroup'
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;
export const Example: Story = {
  render: (args) => {
    let buttons = (
      <ButtonGroup {...args}>
        <Button>Press me</Button>
        <Button variant="accent"><NewIcon /><Text>Test</Text></Button>
        <Button aria-label="Press me"><NewIcon /></Button>
        <Button variant="negative" styles={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</Button>
        <Button variant="secondary" styles={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </Button>
      </ButtonGroup>
    );
    return buttons;
  },
  decorators: [(Story) => <div style={{minWidth: '100px', padding: '10px', resize: 'horizontal', overflow: 'auto'}}><Story /></div>]
};
