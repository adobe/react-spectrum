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

import Add from '../Add';
import Alert from '../Alert';
import Bell from '../Bell';
import React from 'react';

export default {
  title: 'Icons/Express'
};

export const IconAddWithSizes = () => renderIconSizes(Add, {'aria-label': 'Add'});

IconAddWithSizes.story = {
  name: 'icon: Add with sizes'
};

export const IconBellWithSizes = () => renderIconSizes(Bell, {'aria-label': 'Bell'});

IconBellWithSizes.story = {
  name: 'icon: Bell with sizes'
};

export const IconAlertNegative = () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'negative'});

IconAlertNegative.story = {
  name: 'icon: Alert negative'
};

export const IconAlertInformative = () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'informative'});

IconAlertInformative.story = {
  name: 'icon: Alert informative'
};

export const IconAlertPositive = () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'positive'});

IconAlertPositive.story = {
  name: 'icon: Alert positive'
};

export const IconAlertNotice = () => renderIconSizes(Alert, {'aria-label': 'Alert', color: 'notice'});

IconAlertNotice.story = {
  name: 'icon: Alert notice'
};

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map((size) => (
        <Component margin="15px" size={size} {...props} />
      ))}
    </div>
  );
}
