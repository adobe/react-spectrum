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
import {Button, Heading, SelectBox, SelectBoxGroup, Text} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import Paperairplane from '../spectrum-illustrations/linear/Paperairplane';
import React, {useState} from 'react';
import type {Selection} from 'react-aria-components';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilled1 from '../spectrum-illustrations/gradient/generic1/Star';
import StarFilled2 from '../spectrum-illustrations/gradient/generic2/Star';

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
    isCheckboxSelection: {
      control: 'boolean'
    }
  },
  args: {
    selectionMode: 'single',
    orientation: 'vertical',
    numColumns: 2,
    gutterWidth: 'default',
    isDisabled: false,
    isCheckboxSelection: false
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
      <SelectBox value="aws">
        <Server slot="illustration" />
        <Text slot="text">Amazon Web Services</Text>
      </SelectBox>
      <SelectBox value="azure">
        <AlertNotice slot="illustration" />
        <Text slot="text">Microsoft Azure</Text>
      </SelectBox>
      <SelectBox value="gcp">
        <Paperairplane slot="illustration" />
        <Text slot="text">Google Cloud Platform</Text>
      </SelectBox>
      <SelectBox value="ibm">
        <StarFilled1 slot="illustration" />
        <Text slot="text">IBM Cloud</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

export const MultipleSelection: Story = {
  args: {
    selectionMode: 'multiple',
    defaultSelectedKeys: new Set(['aws', 'gcp']),
    necessityIndicator: 'icon',
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
          <Server slot="illustration" />
          <Text slot="text">Amazon Web Services</Text>
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice slot="illustration" />
          <Text slot="text">Microsoft Azure</Text>
          <Text slot="description">Enterprise cloud solutions</Text>
        </SelectBox>
        <SelectBox value="gcp">
          <Paperairplane slot="illustration" />
          <Text slot="text">Google Cloud Platform</Text>
          <Text slot="description">Modern cloud services</Text>
        </SelectBox>
        <SelectBox value="oracle">
          <Server slot="illustration" />
          <Text slot="text">Oracle Cloud</Text>
          <Text slot="description">Database-focused cloud</Text>
        </SelectBox>
        <SelectBox value="ibm">
          <Server slot="illustration" />
          <Text slot="text">IBM Cloud</Text>
          <Text slot="description">Hybrid cloud solutions</Text>
        </SelectBox>
        <SelectBox value="alibaba">
          <Paperairplane slot="illustration" />
          <Text slot="text">Alibaba Cloud</Text>
          <Text slot="description">Asia-focused services</Text>
        </SelectBox>
        <SelectBox value="digitalocean">
          <Server slot="illustration" />
          <Text slot="text">DigitalOcean</Text>
          <Text slot="description">Developer-friendly platform</Text>
        </SelectBox>
        <SelectBox value="linode">
          <AlertNotice slot="illustration" />
          <Text slot="text">Linode</Text>
          <Text slot="description">Simple cloud computing</Text>
        </SelectBox>
        <SelectBox value="vultr">
          <Paperairplane slot="illustration" />
          <Text slot="text">Vultr</Text>
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
        <Server slot="illustration" />
        <Text slot="text">Selected then Disabled</Text>
      </SelectBox>
      <SelectBox value="option2">
        <AlertNotice slot="illustration" />
        <Text slot="text">Disabled</Text>
      </SelectBox>
    </SelectBoxGroup>
  )
};

function InteractiveExamplesStory() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['enabled1', 'starred2']));

  return (
    <div style={{maxWidth: 800}}>
      <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Interactive Features Combined</Heading>
      <p style={{marginBottom: 16, fontSize: 14, color: '#666'}}>
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
        {/* Enabled items with dynamic icons */}
        <SelectBox value="enabled1">
          {selectedKeys !== 'all' && selectedKeys.has('enabled1') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Enabled Item 1</Text>
          <Text slot="description">Status updates</Text>
        </SelectBox>
        <SelectBox value="enabled2">
          {selectedKeys !== 'all' && selectedKeys.has('enabled2') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Enabled Item 2</Text>
          <Text slot="description">Click to toggle</Text>
        </SelectBox>
        {/* Disabled item */}
        <SelectBox value="disabled1" isDisabled>
          <AlertNotice slot="illustration" />
          <Text slot="text">Disabled Item</Text>
          <Text slot="description">Cannot select</Text>
        </SelectBox>
        <SelectBox value="starred1">
          {selectedKeys !== 'all' && selectedKeys.has('starred1') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Starred Item 1</Text>
          <Text slot="description">Click to star</Text>
        </SelectBox>
        <SelectBox value="starred2">
          {selectedKeys !== 'all' && selectedKeys.has('starred2') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Starred Item 2</Text>
          <Text slot="description">Click to star</Text>
        </SelectBox>
        <SelectBox value="disabled2" isDisabled>
          <Server slot="illustration" />
          <Text slot="text">Disabled Service</Text>
          <Text slot="description">Cannot select</Text>
        </SelectBox>
        <SelectBox value="dynamic1">
          {selectedKeys !== 'all' && selectedKeys.has('dynamic1') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Dynamic Icon</Text>
          <Text slot="description">Click to activate</Text>
        </SelectBox>
        <SelectBox value="controllable">
          {selectedKeys !== 'all' && selectedKeys.has('controllable') ? (
            <StarFilled1 slot="illustration" />
          ) : (
            <StarFilled2 slot="illustration" />
          )}
          <Text slot="text">Controllable</Text>
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

function FormAndLayoutStory() {
  const [selectedPreferences, setSelectedPreferences] = useState<Selection>(new Set(['newsletter', 'security']));
  const [submittedData, setSubmittedData] = useState<string[] | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const preferences = formData.getAll('preferences') as string[];
    setSubmittedData(preferences);
    action('form-submitted')(preferences);
  };

  return (
    <div style={{maxWidth: 1000}}>
      <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Form Integration with Multiple Columns</Heading>
      <p style={{marginBottom: 16, fontSize: 14, color: '#666'}}>
        8-item grid with form integration demonstrating both layout and submission capabilities.
      </p>
      
      <form onSubmit={handleSubmit}>
        <SelectBoxGroup
          selectionMode="multiple"
          selectedKeys={selectedPreferences}
          onSelectionChange={(selection) => {
            setSelectedPreferences(selection);
            action('onSelectionChange')(selection);
          }}
          numColumns={4}
          gutterWidth="spacious"
          name="preferences">
          
          <SelectBox value="newsletter">
            <AlertNotice slot="illustration" />
            <Text slot="text">Newsletter</Text>
            <Text slot="description">Weekly updates and news</Text>
          </SelectBox>
          
          <SelectBox value="marketing">
            <Paperairplane slot="illustration" />
            <Text slot="text">Marketing</Text>
            <Text slot="description">Product promotions</Text>
          </SelectBox>
          
          <SelectBox value="product">
            <Server slot="illustration" />
            <Text slot="text">Product News</Text>
            <Text slot="description">Feature announcements</Text>
          </SelectBox>
          
          <SelectBox value="security">
            <AlertNotice slot="illustration" />
            <Text slot="text">Security Alerts</Text>
            <Text slot="description">Important updates</Text>
          </SelectBox>
          
          <SelectBox value="events">
            <Paperairplane slot="illustration" />
            <Text slot="text">Events</Text>
            <Text slot="description">Webinars & conferences</Text>
          </SelectBox>
          
          <SelectBox value="surveys">
            <Server slot="illustration" />
            <Text slot="text">Surveys</Text>
            <Text slot="description">Help us improve</Text>
          </SelectBox>
          
          <SelectBox value="community">
            <AlertNotice slot="illustration" />
            <Text slot="text">Community</Text>
            <Text slot="description">Forum notifications</Text>
          </SelectBox>
          
          <SelectBox value="support">
            <Server slot="illustration" />
            <Text slot="text">Support</Text>
            <Text slot="description">Help & assistance</Text>
          </SelectBox>
          
        </SelectBoxGroup>
        
        <div style={{marginTop: 24, display: 'flex', gap: 12, alignItems: 'center'}}>
          <Button type="submit" variant="accent">
            Save Preferences
          </Button>
          <Button 
            type="button"
            onPress={() => setSelectedPreferences(new Set(['newsletter', 'security']))}
            variant="secondary">
            Reset to Default
          </Button>
          <span style={{fontSize: 14, color: '#666'}}>
            Selected: {selectedPreferences === 'all' ? 'All' : selectedPreferences.size} item{(selectedPreferences === 'all' || selectedPreferences.size !== 1) ? 's' : ''}
          </span>
        </div>
      </form>
      
      {submittedData && (
        <div style={{marginTop: 20, padding: 16, backgroundColor: '#f0f8ff', borderRadius: 8, border: '1px solid #b3d9ff'}}>
          <div><strong>Form Submitted Successfully!</strong></div>
          <div style={{marginTop: 8}}>
            Preferences: {submittedData.length > 0 ? submittedData.join(', ') : 'None selected'}
          </div>
        </div>
      )}
    </div>
  );
}

export const FormAndLayout: Story = {
  render: () => <FormAndLayoutStory />
};

export const AllSlotCombinations: Story = {
  render: () => (
    <div style={{maxWidth: 1200, padding: 20}}>
      <Heading level={2} UNSAFE_style={{marginBottom: 20, fontSize: 18, fontWeight: 'bold'}}>All Slot Combinations</Heading>
      
      {/* Vertical Orientation */}
      <div style={{marginBottom: 40}}>
        <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Vertical Orientation</Heading>
        <div style={{display: 'flex', gap: 20, flexWrap: 'wrap'}}>
          
          {/* Text Only */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Text Only</Heading>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="text-only">
                <Text slot="text">Simple Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Icon + Text */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Icon + Text</Heading>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="icon-text">
                <Server slot="illustration" />
                <Text slot="text">With Icon</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Text + Description</Heading>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="text-desc">
                <Text slot="text">Main Text</Text>
                <Text slot="description">Additional description</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Icon + Text + Description */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Icon + Text + Description</Heading>
            <SelectBoxGroup 
              orientation="vertical" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="all-vertical">
                <AlertNotice slot="illustration" />
                <Text slot="text">Full Vertical</Text>
                <Text slot="description">Complete description</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

        </div>
      </div>

      {/* Horizontal Orientation */}
      <div>
        <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Horizontal Orientation</Heading>
        <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
          
          {/* Text Only */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Text Only (Optimized)</Heading>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-text-only">
                <Text slot="text">Simple Horizontal Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Icon + Text */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Icon + Text</Heading>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-icon-text">
                <Paperairplane slot="illustration" />
                <Text slot="text">Horizontal with Icon</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Text + Description</Heading>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-text-desc">
                <Text slot="text">Main Horizontal Text</Text>
                <Text slot="description">Horizontal description text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Icon + Text + Description */}
          <div>
            <Heading level={4} UNSAFE_style={{marginBottom: 8, fontSize: 14, color: '#666'}}>Icon + Text + Description</Heading>
            <SelectBoxGroup 
              orientation="horizontal" 
              numColumns={1}
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox value="h-all">
                <Server slot="illustration" />
                <Text slot="text">Complete Horizontal</Text>
                <Text slot="description">Full horizontal layout with all elements</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{marginTop: 40}}>
        <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Side-by-Side Comparison</Heading>
        <SelectBoxGroup 
          numColumns={4}
          gutterWidth="spacious"
          onSelectionChange={action('onSelectionChange')}>
          
          {/* Vertical examples */}
          <SelectBox value="v1">
            <Text slot="text">V: Text Only</Text>
          </SelectBox>
          
          <SelectBox value="v2">
            <StarFilled1 slot="illustration" />
            <Text slot="text">V: Icon + Text</Text>
          </SelectBox>
          
          <SelectBox value="v3">
            <Text slot="text">V: Text + Desc</Text>
            <Text slot="description">Vertical description</Text>
          </SelectBox>
          
          <SelectBox value="v4">
            <AlertNotice slot="illustration" />
            <Text slot="text">V: All Elements</Text>
            <Text slot="description">Complete vertical</Text>
          </SelectBox>
          
        </SelectBoxGroup>

        <div style={{marginTop: 20}}>
          <SelectBoxGroup 
            orientation="horizontal"
            numColumns={2}
            gutterWidth="spacious"
            onSelectionChange={action('onSelectionChange')}>
            
            {/* Horizontal examples */}
            <SelectBox value="h1">
              <Text slot="text">H: Text Only</Text>
            </SelectBox>
            
            <SelectBox value="h2">
              <StarFilled1 slot="illustration" />
              <Text slot="text">H: Icon + Text</Text>
            </SelectBox>
            
            <SelectBox value="h3">
              <Text slot="text">H: Text + Description</Text>
              <Text slot="description">Horizontal description</Text>
            </SelectBox>
            
            <SelectBox value="h4">
              <Paperairplane slot="illustration" />
              <Text slot="text">H: All Elements</Text>
              <Text slot="description">Complete horizontal layout</Text>
            </SelectBox>
            
          </SelectBoxGroup>
        </div>
      </div>

    </div>
  )
};

export const WithCheckboxes: Story = {
  args: {
    defaultSelectedKeys: new Set(['aws', 'gcp'])
  },
  render: (args) => (
    <div style={{maxWidth: 600}}>
      <Heading level={3} UNSAFE_style={{marginBottom: 16, fontSize: 16}}>Checkboxes Enabled</Heading>
      <SelectBoxGroup {...args} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="aws">
          <Server slot="illustration" />
          <Text slot="text">Amazon Web Services</Text>
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice slot="illustration" />
          <Text slot="text">Microsoft Azure</Text>
          <Text slot="description">Enterprise cloud solutions</Text>
        </SelectBox>
        <SelectBox value="gcp">
          <Paperairplane slot="illustration" />
          <Text slot="text">Google Cloud Platform</Text>
          <Text slot="description">Modern cloud services</Text>
        </SelectBox>
        <SelectBox value="oracle">
          <Server slot="illustration" />
          <Text slot="text">Oracle Cloud</Text>
          <Text slot="description">Database-focused cloud</Text>
        </SelectBox>
        <SelectBox value="longtext">
          <StarFilled1 slot="illustration" />
          <Text slot="text">This is an extremely long service name that should definitely overflow and show ellipsis behavior</Text>
          <Text slot="description">This is a very long description that should test the text wrapping and overflow behavior in horizontal orientation. It should wrap naturally until it hits the container boundaries and then show appropriate overflow handling.</Text>
        </SelectBox>
        <SelectBox value="anotherlongone">
          <StarFilled2 slot="illustration" />
          <Text slot="text">Another extremely long text. This is a very long text that should test the text wrapping and overflow behavior in horizontal orientation. It should wrap naturally until it hits the container boundaries and then show appropriate overflow handling.</Text>
          <Text slot="description">Another extremely long description text that will help us verify how the SelectBox handles text overflow in different scenarios and orientations, ensuring that the text behavior is consistent and user-friendly across all use cases.</Text>
        </SelectBox>
        <SelectBox value="shortname">
          <Paperairplane slot="illustration" />
          <Text slot="text">Short</Text>
          <Text slot="description">This description is intentionally very long to create a mixed layout where some boxes have short labels but long descriptions, which will help test how the grid layout handles boxes of different content lengths and whether they maintain consistent heights as expected. This is a very long description that should test the text wrapping and overflow behavior in horizontal orientation. It should wrap naturally until it hits the container boundaries and then show appropriate overflow handling.</Text>
        </SelectBox>
      </SelectBoxGroup>
      
      <Heading level={3} UNSAFE_style={{marginTop: 32, marginBottom: 16, fontSize: 16}}>Checkboxes Disabled (Default)</Heading>
      <SelectBoxGroup defaultSelectedKeys={new Set(['aws'])} onSelectionChange={action('onSelectionChange')}>
        <SelectBox value="aws">
          <Server slot="illustration" />
          <Text slot="text">Amazon Web Services</Text>
          <Text slot="description">No checkbox visible</Text>
        </SelectBox>
        <SelectBox value="azure">
          <AlertNotice slot="illustration" />
          <Text slot="text">Microsoft Azure</Text>
          <Text slot="description">No checkbox on hover</Text>
        </SelectBox>
      </SelectBoxGroup>
    </div>
  )
};
