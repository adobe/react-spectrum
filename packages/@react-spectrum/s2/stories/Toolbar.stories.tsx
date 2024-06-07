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

import {Toolbar} from '../src/Toolbar';
import {
  Button,
  Checkbox,
  Group,
  Separator,
  ToggleButton
} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => (
  <Toolbar aria-label="Text formatting" {...args}>
    <Group aria-label="Style">
      <ToggleButton aria-label="Bold">
        <b>B</b>
      </ToggleButton>
      <ToggleButton aria-label="Italic">
        <i>I</i>
      </ToggleButton>
      <ToggleButton aria-label="Underline">
        <u>U</u>
      </ToggleButton>
    </Group>
    <Separator orientation="vertical" />
    <Group aria-label="Clipboard">
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Button>Cut</Button>
    </Group>
    <Separator orientation="vertical" />
    <Checkbox>
      <div className="checkbox">
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <polyline points="1 9 7 14 15 4" />
        </svg>
      </div>
      Night Mode
    </Checkbox>
  </Toolbar>
);
