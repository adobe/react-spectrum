/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import {action} from '@storybook/addon-actions';
import {createIcon, SelectBox, SelectBoxGroup, Text} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import Server from '../spectrum-illustrations/linear/Server';
import StarSVG from '../s2wf-icons/S2_Icon_Star_20_N.svg';

const StarIcon = createIcon(StarSVG);

const meta: Meta<typeof SelectBoxGroup> = {
  component: SelectBoxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectionChange: {table: {category: 'Events'}},
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    children: {table: {disable: true}}
  },
  title: 'SelectBox'
};

export default meta;
type Story = StoryObj<typeof SelectBoxGroup>;

export const Example: Story = {
  args: {
    label: 'Choose an option',
    orientation: 'vertical',
    necessityIndicator: 'label',
    size: 'M',
    labelPosition: 'side'
  },
  render: (args) => (
    <SelectBoxGroup
      {...args}
      onSelectionChange={(v) => console.log('Selection changed:', v)}>
      <SelectBox value="select-box-label">
        <Server slot="icon" size={args.size === 'XS' || args.size === 'XL' ? undefined : args.size} />
        <Text slot="description">Select Box Label</Text>
        <Text slot="text">Select Box Label</Text>
      </SelectBox>
      <SelectBox value="select-box-label2">
        <Server slot="icon" size={args.size === 'XS' || args.size === 'XL' ? undefined : args.size} />
        <Text slot="description">Select Box Label</Text>
        <Text slot="text">Select Box Label</Text>
      </SelectBox>
      <SelectBox value="select-box-label3">
        <Server slot="icon" size={args.size === 'XS' || args.size === 'XL' ? undefined : args.size} />
        <Text slot="description">Select Box Label</Text>
        <Text slot="text">Select Box Label</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

export const SingleSelectNumColumns: Story = {
  args: {
    numColumns: 2,
    label: 'Favorite city',
    size: 'XL',
    gutterWidth: 'default'
  },
  render: (args) => {
    return (
      <SelectBoxGroup
        {...args}
        onSelectionChange={(v) => action('onSelectionChange')(v)}>
        <SelectBox value="Paris">
          <StarIcon slot="icon" />
          <Text slot="text">Paris</Text>
          <Text slot="description">France</Text>
        </SelectBox>
        <SelectBox value="Rome">
          <StarIcon slot="icon" />
          <Text slot="text">Rome</Text>
          <Text slot="description">Italy</Text>
        </SelectBox>
        <SelectBox value="San Francisco">
          <StarIcon slot="icon" />
          <Text slot="text">San Francisco</Text>
          <Text slot="description">USA</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
  },
  name: 'Multiple columns'
};

export const MultipleSelection: Story = {
  args: {
    numColumns: 1,
    label: 'Favorite cities',
    selectionMode: 'multiple'
  },
  render: (args) => {
    return (
      <SelectBoxGroup
        {...args}
        onSelectionChange={(v) => action('onSelectionChange')(v)}>
        <SelectBox value="Paris">
          {/* <StarIcon slot="icon" /> */}
          <Text slot="text">Paris</Text>
          <Text slot="description">France</Text>
        </SelectBox>
        <SelectBox value="Rome">
          {/* <StarIcon slot="icon" /> */}
          <Text slot="text">Rome</Text>
          <Text slot="description">Italy</Text>
        </SelectBox>
        <SelectBox value="San Francisco">
          {/* <StarIcon slot="icon" /> */}
          <Text slot="text">San Francisco</Text>
          <Text slot="description">USA</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
  },
  name: 'Multiple selection mode'
};

export const HorizontalOrientation: Story = {
  args: {
    orientation: 'horizontal',
    label: 'Favorite cities'
  },
  render: (args) => {
    return (
      <SelectBoxGroup
        {...args}
        onSelectionChange={(v) => action('onSelectionChange')(v)}>
        <SelectBox value="Paris">
          <Text slot="text">Paris</Text>
          <Text slot="description">France</Text>
        </SelectBox>
        <SelectBox value="Rome">
          <Text slot="text">Rome</Text>
          <Text slot="description">Italy</Text>
        </SelectBox>
        <SelectBox value="San Francisco">
          <Text slot="text">San Francisco</Text>
          <Text slot="description">USA</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
  },
  name: 'Horizontal orientation'
};

export const IndividualDisabled: Story = {
  args: {
    numColumns: 2,
    label: 'Choose options (some disabled)',
    selectionMode: 'multiple'
  },
  render: (args) => {
    return (
      <SelectBoxGroup
        {...args}
        onSelectionChange={(v) => action('onSelectionChange')(v)}>
        <SelectBox value="option1">
          <StarIcon slot="icon" />
          <Text slot="text">Available Option</Text>
          <Text slot="description">This option is enabled</Text>
        </SelectBox>
        <SelectBox value="option2" isDisabled>
          <StarIcon slot="icon" />
          <Text slot="text">Disabled Option</Text>
          <Text slot="description">This option is disabled</Text>
        </SelectBox>
        <SelectBox value="option3">
          <StarIcon slot="icon" />
          <Text slot="text">Another Available</Text>
          <Text slot="description">This option is also enabled</Text>
        </SelectBox>
        <SelectBox value="option4" isDisabled>
          <StarIcon slot="icon" />
          <Text slot="text">Another Disabled</Text>
          <Text slot="description">This option is also disabled</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
  },
  name: 'Individual disabled SelectBoxes'
};
