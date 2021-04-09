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

import {Icon} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Custom', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'exciting square',
    () => <Icon><svg viewBox="0 0 25 25"><rect x="0" y="0" width="25" height="25" /></svg></Icon>
  );
