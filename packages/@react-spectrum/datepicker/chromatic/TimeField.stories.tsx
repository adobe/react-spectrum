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

import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryFn} from '@storybook/react';
import {parseZonedDateTime, Time} from '@internationalized/date';
import React from 'react';
import {TimeField} from '../';

export default {
  title: 'TimeField',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP']
    }
  }
} as Meta<typeof TimeField>;

export type TimeFieldStory = StoryFn<typeof TimeField>;

const time = new Time(8, 45);
const zoned = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} {...args} />;
export const PlaceholderZoned: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={zoned} {...args} />;
export const PlaceholderFocus: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />;
PlaceholderFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusRTL: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['ar-EG'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const Value: TimeFieldStory = (args) => <TimeField label="Time" value={time} {...args} />;
export const ValueZoned: TimeFieldStory = (args) => <TimeField label="Time" value={zoned} {...args} />;
export const ValueFocus: TimeFieldStory = (args) => <TimeField label="Time" value={time} autoFocus {...args} />;
ValueFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const DisabledPlaceholder: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} isDisabled {...args} />;
export const DisabledValue: TimeFieldStory = (args) => <TimeField label="Time" value={time} isDisabled {...args} />;
export const ReadOnly: TimeFieldStory = (args) => <TimeField label="Time" value={time} isReadOnly {...args} />;
export const QuietPlaceholder: TimeFieldStory = (args) => <TimeField label="Time" placeholderValue={time} isQuiet {...args} />;
export const QuietValue: TimeFieldStory = (args) => <TimeField label="Time" value={time} isQuiet {...args} />;
export const Invalid: TimeFieldStory = (args) => <TimeField label="Time" value={time} validationState="invalid" {...args} />;
export const ErrorMessage: TimeFieldStory = (args) => <TimeField label="Time" value={time} validationState="invalid" errorMessage="Invalid selection" {...args} />;
export const HelpText: TimeFieldStory = (args) => <TimeField label="Time" value={time} description="Enter a date" {...args} />;
export const LabelPositionSide: TimeFieldStory = (args) => <TimeField label="Time" value={time} labelPosition="side" {...args} />;
export const LabelAlignEnd: TimeFieldStory = (args) => <TimeField label="Time" value={time} labelAlign="end" {...args} />;
export const Required: TimeFieldStory = (args) => <TimeField label="Time" value={time} isRequired {...args} />;
export const RequiredLabel: TimeFieldStory = (args) => <TimeField label="Time" value={time} isRequired necessityIndicator="label" {...args} />;
export const Optional: TimeFieldStory = (args) => <TimeField label="Time" value={time} necessityIndicator="label" {...args} />;
export const NoLabel: TimeFieldStory = (args) => <TimeField aria-label="Time" value={time} {...args} />;
export const QuietNoLabel: TimeFieldStory = (args) => <TimeField aria-label="Time" isQuiet value={time} {...args} />;
export const CustomWidth: TimeFieldStory = (args) => <TimeField label="Time" value={time} width={500} {...args} />;
export const QuietCustomWidth: TimeFieldStory = (args) => <TimeField label="Time" value={time} width={500} isQuiet {...args} />;
export const CustomWidthNoLabel: TimeFieldStory = (args) => <TimeField aria-label="Time" value={time} width={500} {...args} />;
export const QuietCustomWidthNoLabel: TimeFieldStory = (args) => <TimeField aria-label="Time" value={time} width={500} isQuiet {...args} />;
export const CustomWidthLabelPositionSide: TimeFieldStory = (args) => <TimeField label="Time" value={time} width={500} labelPosition="side" {...args} />;
export const QuietCustomWidthLabelPositionSide: TimeFieldStory = (args) => <TimeField label="Time" value={time} width={500} labelPosition="side" isQuiet {...args} />;
export const CustomWidthSmall: TimeFieldStory = (args) => <TimeField label="Time" value={zoned} width={50} {...args} />;
export const CustomWidthSmallInvalid: TimeFieldStory = (args) => <TimeField label="Time" value={zoned} width={50} validationState="invalid" {...args} />;
export const CustomWidthSmallNoLabel: TimeFieldStory = (args) => <TimeField aria-label="Time" value={zoned} width={50} {...args} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp: TimeFieldStory = (args) => <TimeField label="Date" contextualHelp={contextualHelp} value={time} {...args} />;
export const ContextualHelpSideLabel: TimeFieldStory = (args) => <TimeField label="Date" labelPosition="side" contextualHelp={contextualHelp} value={time} {...args} />;
