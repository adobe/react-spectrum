/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {Meta} from '@storybook/react';
import {Picker} from '../src';

const meta: Meta<typeof Picker<any>> = {
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['dark'], backgrounds: ['base'], locales: ['ar-AE'], disableAnimations: true}
  },
  title: 'S2 Chromatic/PickerRTL'
};

export default meta;
export {Default, WithSections, DynamicExample, Icons, WithCustomWidth, ContextualHelp} from './Picker.stories';
