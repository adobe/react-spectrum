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
};

const time = new Time(8, 45);
const zoned = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder = () => <TimeField label="Time" placeholderValue={time} />;
export const PlaceholderZoned = () => <TimeField label="Time" placeholderValue={zoned} />;
export const PlaceholderFocus = () => <TimeField label="Time" placeholderValue={time} autoFocus />;
PlaceholderFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusRTL = () => <TimeField label="Time" placeholderValue={time} autoFocus />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['ar-EG'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress = () => <TimeField label="Time" placeholderValue={time} autoFocus />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const Value = () => <TimeField label="Time" value={time} />;
export const ValueZoned = () => <TimeField label="Time" value={zoned} />;
export const ValueFocus = () => <TimeField label="Time" value={time} autoFocus />;
ValueFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const DisabledPlaceholder = () => <TimeField label="Time" placeholderValue={time} isDisabled />;
export const DisabledValue = () => <TimeField label="Time" value={time} isDisabled />;
export const ReadOnly = () => <TimeField label="Time" value={time} isReadOnly />;
export const QuietPlaceholder = () => <TimeField label="Time" placeholderValue={time} isQuiet />;
export const QuietValue = () => <TimeField label="Time" value={time} isQuiet />;
export const Invalid = () => <TimeField label="Time" value={time} validationState="invalid" />;
export const ErrorMessage = () => <TimeField label="Time" value={time} validationState="invalid" errorMessage="Invalid selection" />;
export const HelpText = () => <TimeField label="Time" value={time} description="Enter a date" />;
export const LabelPositionSide = () => <TimeField label="Time" value={time} labelPosition="side" />;
export const LabelAlignEnd = () => <TimeField label="Time" value={time} labelAlign="end" />;
export const Required = () => <TimeField label="Time" value={time} isRequired />;
export const RequiredLabel = () => <TimeField label="Time" value={time} isRequired necessityIndicator="label" />;
export const Optional = () => <TimeField label="Time" value={time} necessityIndicator="label" />;
export const NoLabel = () => <TimeField aria-label="Time" value={time} />;
export const QuietNoLabel = () => <TimeField aria-label="Time" isQuiet value={time} />;
export const CustomWidth = () => <TimeField label="Time" value={time} width={500} />;
export const QuietCustomWidth = () => <TimeField label="Time" value={time} width={500} isQuiet />;
export const CustomWidthNoLabel = () => <TimeField aria-label="Time" value={time} width={500} />;
export const QuietCustomWidthNoLabel = () => <TimeField aria-label="Time" value={time} width={500} isQuiet />;
export const CustomWidthLabelPositionSide = () => <TimeField label="Time" value={time} width={500} labelPosition="side" />;
export const QuietCustomWidthLabelPositionSide = () => <TimeField label="Time" value={time} width={500} labelPosition="side" isQuiet />;
export const CustomWidthSmall = () => <TimeField label="Time" value={zoned} width={50} />;
export const CustomWidthSmallInvalid = () => <TimeField label="Time" value={zoned} width={50} validationState="invalid" />;
export const CustomWidthSmallNoLabel = () => <TimeField aria-label="Time" value={zoned} width={50} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp = () => <TimeField label="Date" contextualHelp={contextualHelp} value={time} />;
export const ContextualHelpSideLabel = () => <TimeField label="Date" labelPosition="side" contextualHelp={contextualHelp} value={time} />;
