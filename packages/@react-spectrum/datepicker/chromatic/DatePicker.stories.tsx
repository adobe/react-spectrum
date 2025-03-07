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
import {DatePicker} from '../';
import {Heading} from '@react-spectrum/text';
import React from 'react';
import {userEvent, within} from '@storybook/testing-library';

export default {
  title: 'DatePicker',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
};

const focusParams = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

const openParams = {
  chromaticProvider: {
    locales: ['en-US'],
    colorSchemes: ['light'],
    scales: ['medium'],
    disableAnimations: true,
    express: false
  }
};

const openParamsRTL = {
  chromaticProvider: {
    locales: ['he-IL'],
    colorSchemes: ['light'],
    scales: ['medium'],
    disableAnimations: true,
    express: false
  }
};

const openDecorators = [Story => <div style={{height: 550}}><Story /></div>];

const date = new CalendarDate(2022, 2, 3);
const dateTime = new CalendarDateTime(2022, 2, 3, 8, 45);
const zonedDateTime = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder = () => <DatePicker label="Date" placeholderValue={date} />;
export const PlaceholderFocus = () => <DatePicker label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocus.parameters = focusParams;

export const PlaceholderFocusRTL = () => <DatePicker label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['ar-EG'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress = () => <DatePicker label="Date" placeholderValue={date} autoFocus />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const PlaceholderTime = () => <DatePicker label="Date" placeholderValue={dateTime} />;
export const PlaceholderZoned = () => <DatePicker label="Date" placeholderValue={zonedDateTime} />;
export const Value = () => <DatePicker label="Date" value={date} />;
export const ValueTime = () => <DatePicker label="Date" value={dateTime} />;
export const ValueZoned = () => <DatePicker label="Date" value={zonedDateTime} />;
export const ValueFocus = () => <DatePicker label="Date" value={date} autoFocus />;
ValueFocus.parameters = focusParams;

export const DisabledPlaceholder = () => <DatePicker label="Date" placeholderValue={date} isDisabled />;
export const DisabledValue = () => <DatePicker label="Date" value={date} isDisabled />;
export const ReadOnly = () => <DatePicker label="Date" value={date} isReadOnly />;
export const QuietPlaceholder = () => <DatePicker label="Date" placeholderValue={date} isQuiet />;
export const QuietValue = () => <DatePicker label="Date" value={date} isQuiet />;
export const Invalid = () => <DatePicker label="Date" value={date} validationState="invalid" />;
export const Unavailable = () => <DatePicker label="Date" value={date} isDateUnavailable={date => date.day <= 10} />;
export const ErrorMessage = () => <DatePicker label="Date" value={date} validationState="invalid" errorMessage="Invalid selection" />;
export const HelpText = () => <DatePicker label="Date" value={date} description="Enter a date" />;
export const FormatHelpText = () => <DatePicker label="Date" value={date} showFormatHelpText />;
export const LabelPositionSide = () => <DatePicker label="Date" value={date} labelPosition="side" />;
export const LabelAlignEnd = () => <DatePicker label="Date" value={date} labelAlign="end" />;
export const Required = () => <DatePicker label="Date" value={date} isRequired />;
export const RequiredLabel = () => <DatePicker label="Date" value={date} isRequired necessityIndicator="label" />;
export const Optional = () => <DatePicker label="Date" value={date} necessityIndicator="label" />;
export const NoLabel = () => <DatePicker aria-label="Date" value={date} />;
export const QuietNoLabel = () => <DatePicker aria-label="Date" isQuiet value={date} />;
export const CustomWidth = () => <DatePicker label="Date" value={date} width={500} />;
export const QuietCustomWidth = () => <DatePicker label="Date" value={date} width={500} isQuiet />;
export const CustomWidthNoLabel = () => <DatePicker aria-label="Date" value={date} width={500} />;
export const QuietCustomWidthNoLabel = () => <DatePicker aria-label="Date" value={date} width={500} isQuiet />;
export const CustomWidthLabelPositionSide = () => <DatePicker label="Date" value={date} width={500} labelPosition="side" />;
export const QuietCustomWidthLabelPositionSide = () => <DatePicker label="Date" value={date} width={500} labelPosition="side" isQuiet />;
export const CustomWidthSmall = () => <DatePicker label="Date" value={zonedDateTime} width={50} />;
export const CustomWidthSmallInvalid = () => <DatePicker label="Date" value={zonedDateTime} width={50} validationState="invalid" />;
export const CustomWidthSmallNoLabel = () => <DatePicker aria-label="Date" value={zonedDateTime} width={50} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp = () => <DatePicker label="Date" contextualHelp={contextualHelp} value={date} />;
export const ContextualHelpSideLabel = () => <DatePicker label="Date" labelPosition="side" contextualHelp={contextualHelp} value={date} />;

export const OpenPlaceholder = () => <DatePicker label="Date" placeholderValue={date} isOpen shouldFlip={false} />;
OpenPlaceholder.parameters = openParams;
OpenPlaceholder.decorators = openDecorators;

export const OpenPlaceholderRTL = () => <DatePicker label="Date" placeholderValue={date} isOpen shouldFlip={false} />;
OpenPlaceholderRTL.parameters = openParamsRTL;
OpenPlaceholderRTL.decorators = openDecorators;

export const OpenValue = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} />;
OpenValue.parameters = openParams;
OpenValue.decorators = openDecorators;

export const OpenValueRTL = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} />;
OpenValueRTL.parameters = openParamsRTL;
OpenValueRTL.decorators = openDecorators;

export const OpenTime = () => <DatePicker label="Date" value={dateTime} isOpen shouldFlip={false} />;
OpenTime.parameters = openParams;
OpenTime.decorators = openDecorators;

export const OpenZoned = () => <DatePicker label="Date" value={zonedDateTime} isOpen shouldFlip={false} />;
OpenZoned.parameters = openParams;
OpenZoned.decorators = openDecorators;

export const OpenInvalid = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} validationState="invalid" />;
OpenInvalid.parameters = openParams;
OpenInvalid.decorators = openDecorators;

export const OpenErrorMessage = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} validationState="invalid" errorMessage="Invalid selection" />;
OpenErrorMessage.parameters = openParams;
OpenErrorMessage.decorators = openDecorators;

export const OpenInvalidTime = () => <DatePicker label="Date" value={zonedDateTime} isOpen shouldFlip={false} validationState="invalid" />;
OpenInvalidTime.parameters = openParams;
OpenInvalidTime.decorators = openDecorators;

export const OpenUnavailable = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} isDateUnavailable={date => date.day <= 10} />;
OpenUnavailable.parameters = openParams;
OpenUnavailable.decorators = openDecorators;

export const OpenExpress = () => <DatePicker label="Date" value={dateTime} isOpen shouldFlip={false} />;
OpenExpress.parameters = {
  chromaticProvider: {
    express: true,
    disableAnimations: true
  }
};
OpenExpress.decorators = openDecorators;

export const OpenLTRInteractions = () => <DatePicker label="Date" value={date} />;
OpenLTRInteractions.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};
OpenLTRInteractions.decorators = openDecorators;

OpenLTRInteractions.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[Enter]]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('dialog');
  await userEvent.keyboard('[ArrowRight]');
};

export const OpenRTLInteractions = () => <DatePicker label="Date" value={date} />;
OpenRTLInteractions.parameters = {
  chromaticProvider: {
    locales: ['ar-EG'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};
OpenRTLInteractions.decorators = openDecorators;

OpenRTLInteractions.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[Enter]]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('dialog');
  await userEvent.keyboard('[ArrowLeft]');
};

export const MultipleMonths = () => <DatePicker label="Date" value={date} isOpen shouldFlip={false} maxVisibleMonths={3} />;
MultipleMonths.parameters = openParams;
MultipleMonths.decorators = [Story => <div style={{height: 550, width: 1000}}><Story /></div>];

export const Tray = () => <DatePicker label="Date" value={date} isOpen />;
Tray.parameters = {
  chromaticProvider: {
    colorSchemes: ['light'],
    locales: ['en-US'],
    scales: ['large'],
    disableAnimations: true,
    express: false
  },
  chromatic: {
    viewports: [380]
  }
};

export const TrayExpress = () => <DatePicker label="Date" value={date} isOpen />;
TrayExpress.parameters = {
  chromaticProvider: {
    colorSchemes: ['light'],
    locales: ['en-US'],
    scales: ['large'],
    disableAnimations: true,
    express: true
  },
  chromatic: {
    viewports: [380]
  }
};
