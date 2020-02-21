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

import CalendarCheckColor from '../CalendarCheckColor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Color', module)
  .add(
    'Color icon with sizes',
    () => renderIconSizes(CalendarCheckColor, {alt: 'Adobe Analytics Color'})
  );

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map(size => {
        return <Component size={size} UNSAFE_style={{padding: '15px'}} {...props} />
      })}
    </div>
  )
}
