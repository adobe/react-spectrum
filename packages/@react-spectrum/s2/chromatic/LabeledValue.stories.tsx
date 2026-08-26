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

import {LabeledValue} from '../src/LabeledValue';
import type {Meta, StoryObj} from '@storybook/react';
import {StaticMatrix, StaticMatrixCell} from './utils';

const meta: Meta<typeof LabeledValue> = {
  component: LabeledValue,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/LabeledValue'
};

export default meta;

export {
  Default,
  LongText,
  StringArray,
  CalendarDateType,
  CalendarDateTimeType,
  CalendarDateTimeTypeFormatOptions,
  ZonedDateTimeType,
  DateType,
  TimeType,
  CalendarDateRange,
  CalendarDateTimeRange,
  ZonedDateTimeRange,
  DateRange,
  TimeRange,
  Number,
  NumberRange,
  CustomComponents,
  WithContextualHelp,
  FormCustomLayoutExample,
  FormLayout
} from '../stories/LabeledValue.stories';

export const StaticOptions: StoryObj<typeof LabeledValue> = {
  render: () => (
    <StaticMatrix minColumnWidth={280}>
      {(['S', 'M', 'L', 'XL'] as const).flatMap(size =>
        (['top', 'side'] as const).map((labelPosition, index) => (
          <StaticMatrixCell key={`${size}-${labelPosition}`} label={`${size} ${labelPosition}`}>
            <LabeledValue
              size={size}
              label="Project owner"
              labelPosition={labelPosition}
              labelAlign={index ? 'end' : 'start'}
              value="A representative long value that demonstrates wrapping at this size"
            />
          </StaticMatrixCell>
        ))
      )}
    </StaticMatrix>
  )
};
