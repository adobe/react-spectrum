/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Label, Meter} from 'react-aria-components';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/Meter',
  component: Meter,
  args: {
    value: 50
  },
  argTypes: {
    value: {control: 'number'},
    minValue: {control: 'number'},
    maxValue: {control: 'number'}
  }
} as Meta<typeof Meter>;

export type MeterStory = StoryFn<typeof Meter>;

export const MeterExample: MeterStory = (args) => {
  return (
    <Meter {...args}>
      {({percentage, valueText}) => (
        <>
          <Label>Storage space</Label>
          <span className="value">{valueText}</span>
          <div className="bar">
            <div className="fill" style={{width: percentage + '%'}} />
          </div>
        </>
      )}
    </Meter>
  );
};
