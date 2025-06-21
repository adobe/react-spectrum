/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  isAndroid,
  isAppleDevice,
  isChrome,
  isIOS,
  isIPad,
  isIPhone,
  isMac,
  isWebKit
} from '../src';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';

export default {
  title: 'platform'
} as Meta<object>;

const Template = (args: any): JSX.Element => (
  <table {...args}>
    <tr>
      <th>Platform</th>
      <th>Current</th>
    </tr>
    <tr><td>isAndroid: </td><td>{isAndroid().toString()}</td></tr>
    <tr><td>isAppleDevice: </td><td>{isAppleDevice().toString()}</td></tr>
    <tr><td>isChrome: </td><td>{isChrome().toString()}</td></tr>
    <tr><td>isIOS: </td><td>{isIOS().toString()}</td></tr>
    <tr><td>isIPad: </td><td>{isIPad().toString()}</td></tr>
    <tr><td>isIPhone: </td><td>{isIPhone().toString()}</td></tr>
    <tr><td>isMac: </td><td>{isMac().toString()}</td></tr>
    <tr><td>isWebKit: </td><td>{isWebKit().toString()}</td></tr>
  </table>
);

export const Default: StoryObj<typeof Template> = {
  render: (args: any) => <Template {...args} />,
  name: 'all platforms',
  args: {}
};
