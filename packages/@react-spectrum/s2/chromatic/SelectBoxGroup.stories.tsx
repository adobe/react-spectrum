/*
 * Copyright 2025 Adobe. All rights reserved.
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
import type {Meta, StoryObj} from '@storybook/react';
import PaperAirplane from '../spectrum-illustrations/linear/Paperairplane';
import React from 'react';
import {SelectBox, SelectBoxGroup, Text} from '../src';
import Server from '../spectrum-illustrations/linear/Server';

const meta: Meta<typeof SelectBoxGroup> = {
  component: SelectBoxGroup,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/SelectBoxGroup'
};

export default meta;
type Story = StoryObj<typeof SelectBoxGroup>;

export const VerticalOrientation: Story = {
  render: () => (
    <div style={{width: 600}}>
      <SelectBoxGroup
        aria-label="Vertical"
        orientation="vertical"
        onSelectionChange={action('onSelectionChange')}>
        <SelectBox id="text-only" textValue="V: Text Only">
          <Text slot="label">V: Text Only</Text>
        </SelectBox>
        <SelectBox id="illustration-text" textValue="V: Illustration + Text">
          <Server />
          <Text slot="label">V: Illustration + Text</Text>
        </SelectBox>
        <SelectBox id="illustration-desc" textValue="Send">
          <PaperAirplane />
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

export const VerticalOrientationMultiSelect: Story = {
  render: () => (
    <div style={{width: 600}}>
      <SelectBoxGroup
        selectionMode="multiple"
        aria-label="Vertical"
        orientation="vertical"
        onSelectionChange={action('onSelectionChange')}>
        <SelectBox id="text-only" textValue="V: Text Only">
          <Text slot="label">V: Text Only</Text>
        </SelectBox>
        <SelectBox id="illustration-text" textValue="V: Illustration + Text">
          <Server />
          <Text slot="label">V: Illustration + Text</Text>
        </SelectBox>
        <SelectBox id="illustration-desc" textValue="Send">
          <PaperAirplane />
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

export const HorizontalOrientation: Story = {
  render: () => (
    <div style={{width: 800}}>
      <SelectBoxGroup
        aria-label="Horizontal"
        orientation="horizontal"
        onSelectionChange={action('onSelectionChange')}>
        <SelectBox id="text-only" textValue="Title Only">
          <Text slot="label">Title Only</Text>
        </SelectBox>
        <SelectBox id="illustration-text" textValue="Illustration + Title">
          <Server />
          <Text slot="label">Illustration + Title</Text>
        </SelectBox>
        <SelectBox id="text-desc" textValue="Title + Description">
          <Text slot="label">Title + Description</Text>
          <Text slot="description">Additional description</Text>
        </SelectBox>
        <SelectBox id="h-all" textValue="Illustration + Title + Description">
          <Server />
          <Text slot="label">Illustration + Title + Description</Text>
          <Text slot="description">Full horizontal layout with all elements</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

export const HorizontalOrientationMultSelect: Story = {
  render: () => (
    <div style={{width: 800}}>
      <SelectBoxGroup
        selectionMode="multiple"
        aria-label="Horizontal"
        orientation="horizontal"
        onSelectionChange={action('onSelectionChange')}>
        <SelectBox id="text-only" textValue="Title Only">
          <Text slot="label">Title Only</Text>
        </SelectBox>
        <SelectBox id="illustration-text" textValue="Illustration + Title">
          <Server />
          <Text slot="label">Illustration + Title</Text>
        </SelectBox>
        <SelectBox id="text-desc" textValue="Title + Description">
          <Text slot="label">Title + Description</Text>
          <Text slot="description">Additional description</Text>
        </SelectBox>
        <SelectBox id="h-all" textValue="Illustration + Title + Description">
          <Server />
          <Text slot="label">Illustration + Title + Description</Text>
          <Text slot="description">Full horizontal layout with all elements</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};
