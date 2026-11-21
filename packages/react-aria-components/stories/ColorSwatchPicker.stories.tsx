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

import {action} from 'storybook/actions';
import {Button} from '../src/Button';
import {ColorSwatchExampleRender} from './ColorSwatch.stories';
import {ColorSwatchPicker, ColorSwatchPickerItem} from '../src/ColorSwatchPicker';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/ColorSwatchPicker',
  component: ColorSwatchPicker
} as Meta<typeof ColorSwatchPicker>;

export type ColorSwatchPickerStory = StoryObj<typeof ColorSwatchPicker>;

export const ColorSwatchPickerExample: ColorSwatchPickerStory = {
  render: args => (
    <ColorSwatchPicker
      {...args}
      style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap'
      }}>
      {['#f00', '#0f0', '#0ff', '#00f'].map(color => (
        <ColorSwatchPickerItem
          key={color}
          color={color}
          style={({isFocusVisible}) => ({
            outline: isFocusVisible ? '2px solid lightblue' : 'none',
            outlineOffset: 2,
            borderRadius: 4,
            position: 'relative'
          })}>
          {({isSelected}) => (
            <>
              <ColorSwatchExampleRender.render />
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: '2px solid black',
                    outline: '2px solid white',
                    outlineOffset: -4,
                    borderRadius: 4
                  }}
                />
              )}
            </>
          )}
        </ColorSwatchPickerItem>
      ))}
    </ColorSwatchPicker>
  )
};

export const ItemFocusEvents: ColorSwatchPickerStory = {
  render: args => (
    <div>
      <p>
        Tab into the color swatch picker, use the arrow keys, or click a swatch. Focus events appear
        in the Actions panel.
      </p>
      <ColorSwatchPicker
        {...args}
        aria-label="Item focus events"
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap'
        }}>
        {['#f00', '#0f0', '#0ff', '#00f'].map(color => (
          <ColorSwatchPickerItem
            key={color}
            color={color}
            onFocus={action(color + ': onFocus')}
            onBlur={action(color + ': onBlur')}
            onFocusChange={action(color + ': onFocusChange')}
            style={({isFocusVisible}) => ({
              outline: isFocusVisible ? '2px solid lightblue' : 'none',
              outlineOffset: 2,
              borderRadius: 4,
              position: 'relative'
            })}>
            {({isSelected}) => (
              <>
                <ColorSwatchExampleRender.render />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px solid black',
                      outline: '2px solid white',
                      outlineOffset: -4,
                      borderRadius: 4
                    }}
                  />
                )}
              </>
            )}
          </ColorSwatchPickerItem>
        ))}
      </ColorSwatchPicker>
      <Button>After the color swatch picker</Button>
    </div>
  )
};
