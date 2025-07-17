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
import AlertNotice from '../spectrum-illustrations/linear/AlertNotice';
import {createIcon, SelectBox, SelectBoxGroup, Text} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import Paperairplane from '../spectrum-illustrations/linear/Paperairplane';
import React from 'react';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilledSVG from '../s2wf-icons/S2_Icon_StarFilled_20_N.svg';
import StarSVG from '../s2wf-icons/S2_Icon_Star_20_N.svg';

const StarIcon = createIcon(StarSVG);
const StarFilledIcon = createIcon(StarFilledSVG);

const meta: Meta<typeof SelectBoxGroup> = {
  title: 'SelectBoxGroup (Collection)',
  component: SelectBoxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple']
    },
    size: {
      control: 'select',
      options: ['XS', 'S', 'M', 'L', 'XL']
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal']
    },
    numColumns: {
      control: {type: 'number', min: 1, max: 4}
    },
    gutterWidth: {
      control: 'select',
      options: ['compact', 'default', 'spacious']
    }
  },
  args: {
    selectionMode: 'single',
    size: 'M',
    orientation: 'vertical',
    numColumns: 2,
    gutterWidth: 'default',
    isRequired: false,
    isDisabled: false,
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Default: Story = {
  args: {
    label: 'Choose your cloud service'
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="aws">
        <Server slot="icon" />
        <Text slot="text">Amazon Web Services</Text>
        <Text slot="description">Reliable cloud infrastructure</Text>
      </SelectBox>
      <SelectBox value="azure">
        <AlertNotice slot="icon" />
        <Text slot="text">Microsoft Azure</Text>
        <Text slot="description">Enterprise cloud solutions</Text>
      </SelectBox>
      <SelectBox value="gcp">
        <Paperairplane slot="icon" />
        <Text slot="text">Google Cloud Platform</Text>
        <Text slot="description">Modern cloud services</Text>
      </SelectBox>
      <SelectBox value="oracle">
        <Server slot="icon" />
        <Text slot="text">Oracle Cloud</Text>
        <Text slot="description">Database-focused cloud</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

export const MultipleSelection: Story = {
  args: {
    selectionMode: 'multiple',
    label: 'Select your preferred services',
    defaultValue: ['aws', 'gcp'],
    necessityIndicator: 'icon'
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="aws">
        <Server slot="icon" />
        <Text slot="text">Amazon Web Services</Text>
      </SelectBox>
      <SelectBox value="azure">
        <AlertNotice slot="icon" />
        <Text slot="text">Microsoft Azure</Text>
      </SelectBox>
      <SelectBox value="gcp">
        <Paperairplane slot="icon" />
        <Text slot="text">Google Cloud Platform</Text>
      </SelectBox>
      <SelectBox value="oracle">
        <Server slot="icon" />
        <Text slot="text">Oracle Cloud</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

// Grid Navigation Testing
export const GridNavigation: Story = {
  args: {
    label: 'Test Grid Navigation (Use Arrow Keys)',
    numColumns: 3
  },
  render: (args) => (
    <div style={{maxWidth: 600}}>
      <p style={{marginBottom: 16, fontSize: 14, color: '#666'}}>
        Focus any item (best done by clicking to the left of the group and hitting the tab key) and use arrow keys to navigate:
        {/* <br />• ↑↓ moves vertically (same column)
        <br />• ←→ moves horizontally (same row) */}
      </p>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="1">
          <Text slot="text">Item 1</Text>
        </SelectBox>
        <SelectBox value="2">
          <Text slot="text">Item 2</Text>
        </SelectBox>
        <SelectBox value="3">
          <Text slot="text">Item 3</Text>
        </SelectBox>
        <SelectBox value="4">
          <Text slot="text">Item 4</Text>
        </SelectBox>
        <SelectBox value="5">
          <Text slot="text">Item 5</Text>
        </SelectBox>
        <SelectBox value="6">
          <Text slot="text">Item 6</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

// Form Integration
export const FormIntegration: Story = {
  args: {
    label: 'Select your option',
    name: 'user_preference',
    isRequired: true
  },
  render: (args) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        action('Form submitted')(Object.fromEntries(formData));
      }}>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="option1">
          <Text slot="text">Option 1</Text>
        </SelectBox>
        <SelectBox value="option2">
          <Text slot="text">Option 2</Text>
        </SelectBox>
        <SelectBox value="option3">
          <Text slot="text">Option 3</Text>
        </SelectBox>
      </SelectBoxGroup>
      <button type="submit" style={{marginTop: 16}}>
        Submit Form
      </button>
    </form>
  )
};

export const FormValidation: Story = {
  args: {
    label: 'Required Selection',
    isRequired: true,
    errorMessage: 'Please select at least one option',
    isInvalid: true
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="option1">
        <Text slot="text">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="text">Option 2</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

// Size Variations
export const SizeVariations: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
      {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
        <SelectBoxGroup
          key={size}
          size={size}
          label={`Size ${size}`}
          onSelectionChange={action(`onSelectionChange-${size}`)}>
          <SelectBox value="option1">
            <Server slot="icon" />
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <AlertNotice slot="icon" />
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      ))}
    </div>
  )
};

// Horizontal Orientation
export const HorizontalOrientation: Story = {
  args: {
    orientation: 'horizontal',
    label: 'Favorite cities',
    numColumns: 1
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="paris">
        <Text slot="text">Paris</Text>
        <Text slot="description">France</Text>
      </SelectBox>
      <SelectBox value="rome">
        <Text slot="text">Rome</Text>
        <Text slot="description">Italy</Text>
      </SelectBox>
      <SelectBox value="tokyo">
        <Text slot="text">Tokyo</Text>
        <Text slot="description">Japan</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

// Disabled States
export const DisabledGroup: Story = {
  args: {
    label: 'Disabled Group',
    isDisabled: true,
    defaultValue: 'option1'
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="option1">
        <Server slot="icon" />
        <Text slot="text">Selected then Disabled</Text>
      </SelectBox>
      <SelectBox value="option2">
        <AlertNotice slot="icon" />
        <Text slot="text">Disabled</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

export const IndividualDisabled: Story = {
  args: {
    label: 'Some items disabled',
    defaultValue: 'option2'
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="option1" isDisabled>
        <Text slot="text">Option 1 (Disabled)</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="text">Option 2</Text>
      </SelectBox>
      <SelectBox value="option3" isDisabled>
        <Text slot="text">Option 3 (Disabled)</Text>
      </SelectBox>
      <SelectBox value="option4">
        <Text slot="text">Option 4</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

// Controlled Mode - Convert to proper component to use React hooks
function ControlledStory() {
  const [value, setValue] = React.useState('option2');

  return (
    <div>
      <p>Current value: {value}</p>
      <SelectBoxGroup
        label="Controlled SelectBoxGroup"
        value={value}
        onSelectionChange={(val) => setValue(val as string)}>
        <SelectBox value="option1">
          <Text slot="text">Option 1</Text>
        </SelectBox>
        <SelectBox value="option2">
          <Text slot="text">Option 2</Text>
        </SelectBox>
        <SelectBox value="option3">
          <Text slot="text">Option 3</Text>
        </SelectBox>
      </SelectBoxGroup>
      <button
        onClick={() => setValue('option1')}
        style={{marginTop: 16, marginRight: 8}}>
        Set to Option 1
      </button>
      <button onClick={() => setValue('option3')}>Set to Option 3</button>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />
};

// Dynamic Icons - Convert to proper component to use React hooks
function DynamicIconsStory() {
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
    new Set()
  );

  return (
    <SelectBoxGroup
      label="Rate these items"
      selectionMode="multiple"
      onSelectionChange={(val) => {
        const values = Array.isArray(val) ? val : [val];
        setSelectedValues(new Set(values));
        action('onSelectionChange')(val);
      }}>
      {['item1', 'item2', 'item3', 'item4'].map((value) => (
        <SelectBox key={value} value={value}>
          {selectedValues.has(value) ? (
            <StarFilledIcon slot="icon" />
          ) : (
            <StarIcon slot="icon" />
          )}
          <Text slot="text">Item {value.slice(-1)}</Text>
        </SelectBox>
      ))}
    </SelectBoxGroup>
  );
}

export const DynamicIcons: Story = {
  render: () => <DynamicIconsStory />
};

// Multiple Columns
export const MultipleColumns: Story = {
  args: {
    label: 'Choose options',
    numColumns: 4,
    gutterWidth: 'spacious'
  },
  render: (args) => (
    <div style={{maxWidth: 800}}>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        {Array.from({length: 8}, (_, i) => (
          <SelectBox key={i} value={`option${i + 1}`}>
            <Text slot="text">Option {i + 1}</Text>
          </SelectBox>
        ))}
      </SelectBoxGroup>
    </div>
  )
};
