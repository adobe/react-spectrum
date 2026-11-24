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

import {Meta, StoryObj} from '@storybook/react';
import Add from '../Add';
import Alert from '../Alert';
import Bell from '../Bell';
import React from 'react';

export default {
  title: 'Icons/Express'
} as Meta<typeof Add>;

export const IconAddWithSizes: StoryObj<typeof Add> = {
  render: () => renderIconSizes(Add, {'aria-label': 'Add'}),
  name: 'icon: Add with sizes'
};

export const IconBellWithSizes: StoryObj<typeof Bell> = {
  render: () => renderIconSizes(Bell, {'aria-label': 'Bell'}),
  name: 'icon: Bell with sizes'
};

export const IconAlertNegative: StoryObj<typeof Alert> = {
  render: () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'negative'}),
  name: 'icon: Alert negative'
};

export const IconAlertInformative: StoryObj<typeof Alert> = {
  render: () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'informative'}),
  name: 'icon: Alert informative'
};

export const IconAlertPositive: StoryObj<typeof Alert> = {
  render: () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'positive'}),
  name: 'icon: Alert positive'
};

export const IconAlertNotice: StoryObj<typeof Alert> = {
  render: () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'notice'}),
  name: 'icon: Alert notice'
};

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map(size => (
        <Component margin="15px" size={size} {...props} />
      ))}
    </div>
  );
}
