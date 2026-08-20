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

/**
 * Example demonstrating the fix for GitHub issue #10443:
 * "Nested Popover closes PreviewTrigger when hovered"
 * 
 * This example shows a PreviewTrigger with interactive content (Select/ComboBox)
 * inside the preview popover. The preview should stay open while interacting with
 * the nested overlay.
 */

import {Button} from '../src/Button';
import {ComboBox} from '../src/ComboBox';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {Link} from '../src/Link';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Popover} from '../src/Popover';
import {PreviewTrigger} from '../src/PreviewTrigger';
import React from 'react';
import {Select, SelectValue} from '../src/Select';

export function PreviewWithSelect() {
  return (
    <div style={{padding: '50px'}}>
      <p>Hover over the link below to see a preview with a Select inside:</p>
      
      <PreviewTrigger delay={200} closeDelay={100}>
        <Link href="https://example.com" target="_blank">
          Example Product
        </Link>
        <Popover
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }}>
          <h3 style={{margin: '0 0 12px 0'}}>Product Details</h3>
          <p style={{margin: '0 0 12px 0', color: '#666'}}>
            Select an option to see more information.
          </p>
          
          {/* This Select opens a nested Popover - the preview should stay open */}
          <Select placeholder="Choose a variant" style={{marginBottom: '12px'}}>
            <Label>Product Variant</Label>
            <Button>
              <SelectValue />
              <span aria-hidden="true">▼</span>
            </Button>
            <Popover>
              <ListBox>
                <ListBoxItem id="small">Small</ListBoxItem>
                <ListBoxItem id="medium">Medium</ListBoxItem>
                <ListBoxItem id="large">Large</ListBoxItem>
                <ListBoxItem id="xl">Extra Large</ListBoxItem>
              </ListBox>
            </Popover>
          </Select>

          <Button
            style={{
              background: '#0074e0',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Add to Cart
          </Button>
        </Popover>
      </PreviewTrigger>
    </div>
  );
}

export function PreviewWithComboBox() {
  return (
    <div style={{padding: '50px'}}>
      <p>Hover over the link below to see a preview with a ComboBox inside:</p>
      
      <PreviewTrigger delay={200} closeDelay={100}>
        <Link href="https://example.com" target="_blank">
          Search Documentation
        </Link>
        <Popover
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px'
          }}>
          <h3 style={{margin: '0 0 12px 0'}}>Quick Search</h3>
          
          {/* This ComboBox opens a nested Popover - the preview should stay open */}
          <ComboBox>
            <Label>Search topics</Label>
            <div style={{display: 'flex', gap: '8px'}}>
              <Input placeholder="Type to search..." />
              <Button>▼</Button>
            </div>
            <Popover>
              <ListBox>
                <ListBoxItem>Getting Started</ListBoxItem>
                <ListBoxItem>Components</ListBoxItem>
                <ListBoxItem>Hooks</ListBoxItem>
                <ListBoxItem>Accessibility</ListBoxItem>
                <ListBoxItem>Internationalization</ListBoxItem>
              </ListBox>
            </Popover>
          </ComboBox>
        </Popover>
      </PreviewTrigger>
    </div>
  );
}

export function NestedPreviewTriggers() {
  return (
    <div style={{padding: '50px'}}>
      <p>Edge case: PreviewTrigger inside another PreviewTrigger:</p>
      
      <PreviewTrigger delay={200} closeDelay={100}>
        <Link href="https://example.com" target="_blank">
          Parent Link
        </Link>
        <Popover
          style={{
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '250px'
          }}>
          <h3 style={{margin: '0 0 12px 0'}}>Parent Preview</h3>
          <p style={{margin: '0 0 12px 0'}}>
            This preview contains another link with its own preview:
          </p>
          
          <PreviewTrigger delay={200} closeDelay={100}>
            <Link href="https://example.com/nested" target="_blank">
              Nested Link
            </Link>
            <Popover
              style={{
                background: 'white',
                border: '1px solid #0074e0',
                borderRadius: '4px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '200px'
              }}>
              <p style={{margin: 0}}>
                This is a nested preview! Both should stay open while hovering.
              </p>
            </Popover>
          </PreviewTrigger>
        </Popover>
      </PreviewTrigger>
    </div>
  );
}
