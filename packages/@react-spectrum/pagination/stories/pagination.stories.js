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
import {action} from '@storybook/addon-actions';
import {PaginationInput} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('PaginationInput', module)
  .add(
    'Default',
    () => render({maxValue: '10', onChange: action('onChange')})
  )
  .add(
    'controlled',
    () => render({maxValue: '50', value: '2', onChange: action('onChange')})
  );

function render(props = {}) {
  return (<PaginationInput {...props} onPrevious={action('onPrevious')} onNext={action('onNext')} />);
}
