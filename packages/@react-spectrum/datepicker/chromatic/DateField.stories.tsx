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

import {CalendarDate, CalendarDateTime, parseZonedDateTime} from '@internationalized/date';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {DateField} from '../';
import {Heading} from '@react-spectrum/text';
import React from 'react';

export default {
  title: 'DateField',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
};

const date = new CalendarDate(2022, 2, 3);
const dateTime = new CalendarDateTime(2022, 2, 3, 8, 45);
const zonedDateTime = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder = () => <DateField label="Date" placeholderValue={date} />;
export const PlaceholderFocus = () => <DateField label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusRTL = () => <DateField label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['he-IL'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress = () => <DateField label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const PlaceholderTime = () => <DateField label="Date" placeholderValue={dateTime} />;
export const PlaceholderZoned = () => <DateField label="Date" placeholderValue={zonedDateTime} />;
export const Value = () => <DateField label="Date" value={date} />;
export const ValueTime = () => <DateField label="Date" value={dateTime} />;
export const ValueZoned = () => <DateField label="Date" value={zonedDateTime} />;
export const ValueFocus = () => <DateField label="Date" value={date} autoFocus />;
ValueFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const DisabledPlaceholder = () => <DateField label="Date" placeholderValue={date} isDisabled />;
export const DisabledValue = () => <DateField label="Date" value={date} isDisabled />;
export const ReadOnly = () => <DateField label="Date" value={date} isReadOnly />;
export const QuietPlaceholder = () => <DateField label="Date" placeholderValue={date} isQuiet />;
export const QuietValue = () => <DateField label="Date" value={date} isQuiet />;
export const Invalid = () => <DateField label="Date" value={date} validationState="invalid" />;
export const ErrorMessage = () => <DateField label="Date" value={date} validationState="invalid" errorMessage="Invalid selection" />;
export const HelpText = () => <DateField label="Date" value={date} description="Enter a date" />;
export const FormatHelpText = () => <DateField label="Date" value={date} showFormatHelpText />;
export const LabelPositionSide = () => <DateField label="Date" value={date} labelPosition="side" />;
export const LabelAlignEnd = () => <DateField label="Date" value={date} labelAlign="end" />;
export const Required = () => <DateField label="Date" value={date} isRequired />;
export const RequiredLabel = () => <DateField label="Date" value={date} isRequired necessityIndicator="label" />;
export const Optional = () => <DateField label="Date" value={date} necessityIndicator="label" />;
export const NoLabel = () => <DateField aria-label="Date" value={date} />;
export const QuietNoLabel = () => <DateField aria-label="Date" isQuiet value={date} />;
export const CustomWidth = () => <DateField label="Date" value={date} width={500} />;
export const QuietCustomWidth = () => <DateField label="Date" value={date} width={500} isQuiet />;
export const CustomWidthNoLabel = () => <DateField aria-label="Date" value={date} width={500} />;
export const QuietCustomWidthNoLabel = () => <DateField aria-label="Date" value={date} width={500} isQuiet />;
export const CustomWidthLabelPositionSide = () => <DateField label="Date" value={date} width={500} labelPosition="side" />;
export const QuietCustomWidthLabelPositionSide = () => <DateField label="Date" value={date} width={500} labelPosition="side" isQuiet />;
export const CustomWidthSmall = () => <DateField label="Time" value={zonedDateTime} width={50} />;
export const CustomWidthSmallInvalid = () => <DateField label="Time" value={zonedDateTime} width={50} validationState="invalid" />;
export const CustomWidthSmallNoLabel = () => <DateField aria-label="Time" value={zonedDateTime} width={50} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp = () => <DateField label="Date" contextualHelp={contextualHelp} value={date} />;
export const ContextualHelpSideLabel = () => <DateField label="Date" labelPosition="side" contextualHelp={contextualHelp} value={date} />;
