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
import AlertNotice from '../spectrum-illustrations/linear/AlertNotice';
import type {Meta, StoryObj} from '@storybook/react';
import PaperAirplane from '../spectrum-illustrations/linear/Paperairplane';
import React from 'react';
import {SelectBox, SelectBoxGroup, Text} from '../src';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilled1 from '../spectrum-illustrations/linear/Star';
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

const meta: Meta<typeof SelectBoxGroup> = {
  title: 'SelectBoxGroup (alpha)',
  component: SelectBoxGroup,
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
    selectedKeys: {control: false, table: {disable: true}},
    defaultSelectedKeys: {control: false, table: {disable: true}}
  },
  args: {
    selectionMode: 'single',
    orientation: 'vertical',
    isDisabled: false
  }
};

export default meta;
type Story = StoryObj<typeof SelectBoxGroup>;

export const Default: Story = {
  render: (args) => {
    return (
      <SelectBoxGroup {...args} aria-label="Choose a cloud">
        <SelectBox id="aws" textValue="Amazon Web Services">
          <Server />
          <Text slot="label">Amazon Web Services</Text>
          <Text slot="description">Reliable cloud infrastructure</Text>
        </SelectBox>
        <SelectBox id="azure" textValue="Microsoft Azure">
          <AlertNotice />
          <Text slot="label">Microsoft Azure</Text>
        </SelectBox>
        <SelectBox id="gcp" textValue="Google Cloud Platform">
          <PaperAirplane />
          <Text slot="label">Google Cloud Platform</Text>
        </SelectBox>
        <SelectBox id="ibm" textValue="IBM Cloud">
          <StarFilled1 />
          <Text slot="label">IBM Cloud</Text>
          <Text slot="description">Hybrid cloud solutions</Text>
        </SelectBox>
      </SelectBoxGroup>
    );
  }
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
              aria-label="Text Only"
              orientation="vertical" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="text-only" textValue="Simple Text">
                <Text slot="label">Simple Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text</h4>
            <SelectBoxGroup 
              aria-label="Illustration + Text"
              orientation="vertical" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="illustration-text" textValue="With Illustration">
                <Server />
                <Text slot="label">With Illustration</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Text + Description</h4>
            <SelectBoxGroup
              aria-label="Text + Description"
              orientation="vertical" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="text-desc" textValue="Main Text">
                <Text slot="label">Main Text</Text>
                <Text slot="description">Additional description</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Description</h4>
            <SelectBoxGroup 
              aria-label="Illustration + Description"
              orientation="vertical" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="illustration-desc" textValue="Only description text">
                <PaperAirplane />
                <Text slot="description">Only description text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text + Description</h4>
            <SelectBoxGroup 
              aria-label="Illustration + Text + Description"
              orientation="vertical" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="all-vertical" textValue="Full Vertical">
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
              aria-label="Text Only"
              orientation="horizontal" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="h-text-only" textValue="Simple Horizontal Text">
                <Text slot="label">Simple Horizontal Text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text</h4>
            <SelectBoxGroup
              aria-label="Illustration + Text"
              orientation="horizontal" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="h-illustration-text" textValue="Horizontal with Illustration">
                <PaperAirplane />
                <Text slot="label">Horizontal with Illustration</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Text + Description</h4>
            <SelectBoxGroup
              aria-label="Text + Description"
              orientation="horizontal" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="h-text-desc" textValue="Main Horizontal Text">
                <Text slot="label">Main Horizontal Text</Text>
                <Text slot="description">Horizontal description text</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>

          {/* Illustration + Text + Description */}
          <div>
            <h4 className={sectionHeadingStyles}>Illustration + Text + Description</h4>
            <SelectBoxGroup 
              aria-label="Illustration + Text + Description"
              orientation="horizontal" 
              onSelectionChange={action('onSelectionChange')}>
              <SelectBox id="h-all" textValue="Complete Horizontal">
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
          aria-label="Vertical"
          onSelectionChange={action('onSelectionChange')}>
          
          {/* Vertical examples */}
          <SelectBox id="v1" textValue="V: Text Only">
            <Text slot="label">V: Text Only</Text>
          </SelectBox>
          
          <SelectBox id="v2" textValue="V: Illustration + Text">
            <StarFilled1 />
            <Text slot="label">V: Illustration + Text</Text>
          </SelectBox>
          
          <SelectBox id="v3" textValue="V: Text + Desc">
            <Text slot="label">V: Text + Desc</Text>
            <Text slot="description">Vertical description</Text>
          </SelectBox>
          
          <SelectBox id="v4" textValue="V: Illustration + Desc">
            <PaperAirplane />
            <Text slot="description">V: Illustration + Desc</Text>
          </SelectBox>
          
          <SelectBox id="v5" textValue="V: All Elements">
            <AlertNotice />
            <Text slot="label">V: All Elements</Text>
            <Text slot="description">Complete vertical</Text>
          </SelectBox>
          
        </SelectBoxGroup>

        <div style={{marginTop: 20}}>
          <SelectBoxGroup
            aria-label="Horizontal"
            orientation="horizontal"
            onSelectionChange={action('onSelectionChange')}>
            
            {/* Horizontal examples */}
            <SelectBox id="h1" textValue="H: Text Only">
              <Text slot="label">H: Text Only</Text>
            </SelectBox>
            
            <SelectBox id="h2" textValue="H: Illustration + Text">
              <StarFilled1 />
              <Text slot="label">H: Illustration + Text</Text>
            </SelectBox>
            
            <SelectBox id="h3" textValue="H: Text + Description">
              <Text slot="label">H: Text + Description</Text>
              <Text slot="description">Horizontal description</Text>
            </SelectBox>
            
            <SelectBox id="h4" textValue="H: Illustration + Desc">
              <Server />
              <Text slot="description">H: Illustration + Desc</Text>
            </SelectBox>
            
            <SelectBox id="h5" textValue="H: All Elements">
              <PaperAirplane />
              <Text slot="label">H: All Elements</Text>
              <Text slot="description">Complete horizontal layout</Text>
            </SelectBox>
            
          </SelectBoxGroup>
        </div>
      </div>

    </div>
  ),
  tags: ['!autodocs']
};
