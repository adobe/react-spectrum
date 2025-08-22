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
import type {Meta, StoryObj} from '@storybook/react';
import PaperAirplane from '../spectrum-illustrations/linear/Paperairplane';
import React from 'react';
import {SelectBox, SelectBoxGroup, Text} from '../src';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilled1 from '../spectrum-illustrations/gradient/generic1/Star';
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
      <div style={{width: 800}}>
        <SelectBoxGroup {...args}>
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
      </div>
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
              orientation="vertical" 
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
