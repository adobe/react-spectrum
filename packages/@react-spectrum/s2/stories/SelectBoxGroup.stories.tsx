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
import {Button, SelectBox, SelectBoxGroup, Text} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import PaperAirplane from '../spectrum-illustrations/linear/Paperairplane';
import React, {useState} from 'react';
import type {Selection} from 'react-aria-components';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilled1 from '../spectrum-illustrations/gradient/generic1/Star';
import StarFilled2 from '../spectrum-illustrations/gradient/generic2/Star';
import {style} from '../style' with {type: 'macro'};

const headingStyles = style({
  font: 'heading',
  margin: 0,
  marginBottom: 16
});

const subheadingStyles = style({
  font: 'heading',
  fontSize: 'heading-lg',
  margin: 0,
  marginBottom: 16
});

const sectionHeadingStyles = style({
  font: 'heading', 
  fontSize: 'heading-sm',
  color: 'gray-600',
  margin: 0,
  marginBottom: 8
});

const descriptionStyles = style({
  font: 'body',
  fontSize: 'body-sm',
  color: 'gray-600',
  margin: 0,
  marginBottom: 16
});

const meta: Meta<typeof SelectBoxGroup> = {
  title: 'SelectBoxGroup',
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
    },
    showCheckbox: {
      control: 'boolean'
    }
  },
  args: {
    selectionMode: 'single',
    orientation: 'vertical',
    numColumns: 2,
    gutterWidth: 'default',
    isDisabled: false,
    showCheckbox: false
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="aws">
        <Server />
        <Text slot="label">Amazon Web Services</Text>
        <Text slot="description">Reliable cloud infrastructure</Text>
      </SelectBox>
      <SelectBox value="azure">
        <AlertNotice />
        <Text slot="label">Microsoft Azure</Text>
      </SelectBox>
      <SelectBox value="gcp">
        <PaperAirplane />
        <Text slot="label">Google Cloud Platform</Text>
      </SelectBox>
      <SelectBox value="ibm">
        <StarFilled1 />
        <Text slot="label">IBM Cloud</Text>
        <Text slot="description">Hybrid cloud solutions</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

export const MultipleSelection: Story = {
  args: {
    selectionMode: 'multiple',
    defaultSelectedKeys: new Set(['aws', 'gcp']),
    numColumns: 3,
    gutterWidth: 'default'
  },
  render: (args) => (
    <div style={{maxWidth: 800}}>
      <p style={{marginBottom: 16, fontSize: 14, color: '#666'}}>
        Focus any item and use arrow keys for grid navigation:
      </p>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="aws">
          <Server />
          <Text slot="label">Amazon Web Services</Text>
          {/* <Text slot="description">Reliable cloud infrastructure</Text> */}
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice />
          <Text slot="label">Microsoft Azure</Text>
          <Text slot="description">Enterprise cloud solutions</Text>
        </SelectBox>
        <SelectBox value="gcp">
          <PaperAirplane />
          <Text slot="label">Google Cloud Platform</Text>
          <Text slot="description">Modern cloud services</Text>
        </SelectBox>
        <SelectBox value="oracle">
          <Server />
          <Text slot="label">Oracle Cloud</Text>
          <Text slot="description">Database-focused cloud</Text>
        </SelectBox>
        <SelectBox value="ibm">
          <Server />
          <Text slot="label">IBM Cloud</Text>
          <Text slot="description">Hybrid cloud solutions</Text>
        </SelectBox>
        <SelectBox value="alibaba">
          <PaperAirplane />
          <Text slot="label">Alibaba Cloud</Text>
          <Text slot="description">Asia-focused services</Text>
        </SelectBox>
        <SelectBox value="digitalocean">
          <Server />
          <Text slot="label">DigitalOcean</Text>
          <Text slot="description">Developer-friendly platform</Text>
        </SelectBox>
        <SelectBox value="linode">
          <AlertNotice />
          <Text slot="label">Linode</Text>
          <Text slot="description">Simple cloud computing</Text>
        </SelectBox>
        <SelectBox value="vultr">
          <PaperAirplane />
          <Text slot="label">Vultr</Text>
          <Text slot="description">High performance cloud</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

export const DisabledGroup: Story = {
  args: {
    isDisabled: true,
    defaultSelectedKeys: new Set(['option1']),
    isCheckboxSelection: true
  },
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="option1">
        <Server />
        <Text slot="label">Selected then Disabled</Text>
      </SelectBox>
      <SelectBox value="option2">
        <AlertNotice />
        <Text slot="label">Disabled</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

function InteractiveExamplesStory() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['enabled1', 'starred2']));

  return (
    <div style={{maxWidth: 800}}>
      <h3 className={subheadingStyles}>Interactive Features Combined</h3>
      <p className={descriptionStyles}>
        Current selection: {selectedKeys === 'all' ? 'All' : Array.from(selectedKeys).join(', ') || 'None'}
      </p>
      
      <SelectBoxGroup
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        numColumns={4}
        gutterWidth="default"
        onSelectionChange={(selection) => {
          setSelectedKeys(selection);
          action('onSelectionChange')(selection);
        }}>
        {/* Enabled items with dynamic illustrations */}
        <SelectBox value="enabled1">
          {selectedKeys !== 'all' && selectedKeys.has('enabled1') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Enabled Item 1</Text>
          <Text slot="description">Status updates</Text>
        </SelectBox>
        <SelectBox value="enabled2">
          {selectedKeys !== 'all' && selectedKeys.has('enabled2') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Enabled Item 2</Text>
          <Text slot="description">Click to toggle</Text>
        </SelectBox>
        {/* Disabled item */}
        <SelectBox value="disabled1" isDisabled>
          <AlertNotice />
          <Text slot="label">Disabled Item</Text>
          <Text slot="description">Cannot select</Text>
        </SelectBox>
        <SelectBox value="starred1">
          {selectedKeys !== 'all' && selectedKeys.has('starred1') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Starred Item 1</Text>
          <Text slot="description">Click to star</Text>
        </SelectBox>
        <SelectBox value="starred2">
          {selectedKeys !== 'all' && selectedKeys.has('starred2') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Starred Item 2</Text>
          <Text slot="description">Click to star</Text>
        </SelectBox>
        <SelectBox value="disabled2" isDisabled>
          <Server />
          <Text slot="label">Disabled Service</Text>
          <Text slot="description">Cannot select</Text>
        </SelectBox>
        <SelectBox value="dynamic1">
          {selectedKeys !== 'all' && selectedKeys.has('dynamic1') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Dynamic Illustration</Text>
          <Text slot="description">Click to activate</Text>
        </SelectBox>
        <SelectBox value="controllable">
          {selectedKeys !== 'all' && selectedKeys.has('controllable') ? (
            <StarFilled1 />
          ) : (
            <StarFilled2 />
          )}
          <Text slot="label">Controllable</Text>
          <Text slot="description">External control available</Text>
        </SelectBox>
      </SelectBoxGroup>
      
      <div style={{marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        <Button 
          onPress={() => setSelectedKeys(new Set(['starred1', 'starred2', 'dynamic1']))}
          variant="secondary">
          Select Favorites
        </Button>
        <Button 
          onPress={() => setSelectedKeys(new Set())}
          variant="secondary">
          Clear All
        </Button>
        <Button 
          onPress={() => setSelectedKeys(new Set(['enabled1', 'enabled2', 'controllable']))}
          variant="secondary">
          Select Enabled Only
        </Button>
      </div>
    </div>
  );
}

export const InteractiveExamples: Story = {
  render: () => <InteractiveExamplesStory />
};

export const AllSlotCombinations: Story = {
  render: () => (
    <div style={{maxWidth: 1200, padding: 20}}>
      <h2 className={headingStyles}>All Slot Combinations</h2>
      
      {/* Vertical Orientation */}
      <div style={{marginBottom: 40}}>
        <h3 className={subheadingStyles}>Vertical Orientation</h3>
        <div style={{display: 'flex', gap: 20, flexWrap: 'wrap'}}>
          
          {/* Text Only */}
          <div>
            <h4 className={sectionHeadingStyles}>Text Only</h4>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="text-only">
                <Text slot="label">Simple Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text</h4>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="illustration-text">
                <Server />
                <Text slot="label">With Illustration</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Text + Description</h4>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="text-desc">
                <Text slot="label">Main Text</Text>
                <Text slot="description">Additional description</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Description</h4>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="illustration-desc">
                <PaperAirplane />
                <Text slot="description">Only description text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text + Description</h4>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="all-vertical">
                <AlertNotice />
                <Text slot="label">Full Vertical</Text>
                <Text slot="description">Complete description</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

        </div>
      </div>

      {/* Horizontal Orientation */}
      <div>
        <h3 className={subheadingStyles}>Horizontal Orientation</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          
          {/* Text Only */}
          <div>
            <h4 className={sectionHeadingStyles}>Text Only</h4>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-text-only">
                <Text slot="label">Simple Horizontal Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text</h4>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-illustration-text">
                <PaperAirplane />
                <Text slot="label">Horizontal with Illustration</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Text + Description</h4>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-text-desc">
                <Text slot="label">Main Horizontal Text</Text>
                <Text slot="description">Horizontal description text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text + Description</h4>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-all">
                <Server />
                <Text slot="label">Complete Horizontal</Text>
                <Text slot="description">Full horizontal layout with all elements</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{marginTop: 40}}>
        <h3 className={subheadingStyles}>Side-by-Side Comparison</h3>
        <SelectBoxGroup 
          numColumns={5}
          gutterWidth="spacious"
          onSelectionChange={action('onSelectionChange')}>
          
          {/* Vertical examples */}
          <SelectBox value="v1">
            <Text slot="label">V: Text Only</Text>
          </SelectBox>
          
          <SelectBox value="v2">
            <StarFilled1 />
            <Text slot="label">V: Illustration + Text</Text>
          </SelectBox>
          
          <SelectBox value="v3">
            <Text slot="label">V: Text + Desc</Text>
            <Text slot="description">Vertical description</Text>
          </SelectBox>
          
          <SelectBox value="v4">
            <PaperAirplane />
            <Text slot="description">V: Illustration + Desc</Text>
          </SelectBox>
          
          <SelectBox value="v5">
            <AlertNotice />
            <Text slot="label">V: All Elements</Text>
            <Text slot="description">Complete vertical</Text>
          </SelectBox>
          
        </SelectBoxGroup>

        <div style={{marginTop: 20}}>
          <SelectBoxGroup 
            orientation="horizontal"
            numColumns={5}
            gutterWidth="spacious"
            onSelectionChange={action('onSelectionChange')}>
            
            {/* Horizontal examples */}
            <SelectBox value="h1">
              <Text slot="label">H: Text Only</Text>
            </SelectBox>
            
            <SelectBox value="h2">
              <StarFilled1 />
              <Text slot="label">H: Illustration + Text</Text>
            </SelectBox>
            
            <SelectBox value="h3">
              <Text slot="label">H: Text + Description</Text>
              <Text slot="description">Horizontal description</Text>
            </SelectBox>
            
            <SelectBox value="h4">
              <Server />
              <Text slot="description">H: Illustration + Desc</Text>
            </SelectBox>
            
            <SelectBox value="h5">
              <PaperAirplane />
              <Text slot="label">H: All Elements</Text>
              <Text slot="description">Complete horizontal layout</Text>
            </SelectBox>
            
          </SelectBoxGroup>
        </div>
      </div>

    </div>
  )
};

export const TextSlots: Story = {
  args: {
    orientation: 'horizontal'
  },
  render: (args) => (
    <div style={{maxWidth: 600}}>
      <h3 className={subheadingStyles}>Text Slots Example</h3>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="aws">
          <Server />
          <Text slot="label">Amazon Web Services</Text>
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice />
          <Text slot="label">Microsoft Azure</Text>
          <Text slot="description">Enterprise cloud solutions</Text>
        </SelectBox>
        <SelectBox value="gcp">
          <PaperAirplane />
          <Text slot="label">Google Cloud Platform</Text>
          <Text slot="description">Modern cloud services</Text>
        </SelectBox>
        <SelectBox value="oracle">
          <Server />
          <Text slot="label">Oracle Cloud</Text>
          <Text slot="description">Database-focused cloud</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};

export const WithDescription: Story = {
  args: {
    orientation: 'horizontal'
  },
  render: (args) => (
    <div style={{maxWidth: 600}}>
      <h3 className={subheadingStyles}>With Description</h3>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="aws">
          <Server />
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice />
          <Text slot="label">Microsoft Azure</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};
