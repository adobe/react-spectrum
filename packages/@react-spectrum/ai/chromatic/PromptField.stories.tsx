/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {AttachFileMenuItem, InsertMenuButton, PromptFieldVoiceButton} from '../src/PromptField';
import {Button} from '@react-spectrum/s2/Button';
import {
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Text
} from '@react-spectrum/s2/Menu';
import Keyboard from '@react-spectrum/s2/icons/Keyboard';
import {LinkButton} from '@react-spectrum/s2/LinkButton';
import ListMultiSelect from '@react-spectrum/s2/icons/ListMultiSelect';
import type {Meta, StoryObj} from '@storybook/react';
import {
  PromptField,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptTokenField
} from '@react-spectrum/ai';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';

const meta: Meta = {
  parameters: {
    chromaticProvider: {
      disableAnimations: true,
      colorSchemes: ['light', 'dark'],
      locales: ['en-US']
    }
  },
  title: 'AI Chromatic/PromptField'
};

export default meta;

type Story = StoryObj<typeof meta>;

function ToolbarButtons() {
  return (
    <div className={style({display: 'flex', gap: 8})}>
      <ToggleButton isQuiet size="S">
        <ListMultiSelect />
        <Text>Plan mode</Text>
      </ToggleButton>
      <MenuTrigger>
        <ActionButton isQuiet size="S">
          <Keyboard />
          <Text>Normal</Text>
        </ActionButton>
        <Menu>
          <MenuSection>
            <Header>
              <Heading>Transcript view</Heading>
            </Header>
            <MenuItem>Normal</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
      <Button size="S" fillStyle="outline">
        Model
      </Button>
      <LinkButton size="S" fillStyle="outline" href="#">
        Terms and conditions
      </LinkButton>
    </div>
  );
}

export const ToolbarButtonsStory: Story = {
  render: () => (
    <div className={style({width: 800, maxWidth: '90vw', marginX: 'auto'})}>
      <PromptField>
        <PromptTokenField />
        <PromptFieldToolbar>
          <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
            <InsertMenuButton>
              <AttachFileMenuItem />
            </InsertMenuButton>
            <ToolbarButtons />
          </div>
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <PromptFieldVoiceButton />
            <PromptFieldSubmitButton />
          </div>
        </PromptFieldToolbar>
      </PromptField>
      <PromptField variant="prominent">
        <PromptTokenField />
        <PromptFieldToolbar>
          <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
            <InsertMenuButton>
              <AttachFileMenuItem />
            </InsertMenuButton>
            <ToolbarButtons />
          </div>
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <PromptFieldVoiceButton />
            <PromptFieldSubmitButton />
          </div>
        </PromptFieldToolbar>
      </PromptField>
      <PromptField variant="subtle">
        <PromptTokenField />
        <PromptFieldToolbar>
          <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
            <InsertMenuButton>
              <AttachFileMenuItem />
            </InsertMenuButton>
            <ToolbarButtons />
          </div>
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <PromptFieldVoiceButton />
            <PromptFieldSubmitButton />
          </div>
        </PromptFieldToolbar>
      </PromptField>
    </div>
  )
};
