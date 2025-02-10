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
import {DateRangePicker} from '../';
import {Heading} from '@react-spectrum/text';
import React from 'react';
import {userEvent, within} from '@storybook/testing-library';

export default {
  title: 'DateRangePicker',
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
    locales: ['ar-EG'],
    colorSchemes: ['light'],
    scales: ['medium'],
    disableAnimations: true,
    express: false
  }
};

const openDecorators = [Story => <div style={{height: 550}}><Story /></div>];

const value = {
  start: new CalendarDate(2022, 2, 3),
  end: new CalendarDate(2022, 2, 8)
};

const dateTime = {
  start: new CalendarDateTime(2022, 2, 3, 8, 45),
  end: new CalendarDateTime(2022, 2, 8, 11, 45)
};

const zoned = {
  start: parseZonedDateTime('2021-11-08T00:45-08:00[America/Los_Angeles]'),
  end: parseZonedDateTime('2021-11-19T00:45-08:00[America/Los_Angeles]')
};

export const Placeholder = () => <DateRangePicker label="Date" placeholderValue={value.start} />;
export const PlaceholderFocus = () => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus />;
PlaceholderFocus.parameters = focusParams;

export const PlaceholderFocusRTL = () => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['he-IL'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress = () => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const PlaceholderTime = () => <DateRangePicker label="Date" placeholderValue={dateTime.start} />;
export const PlaceholderZoned = () => <DateRangePicker label="Date" placeholderValue={zoned.start} />;
export const Value = () => <DateRangePicker label="Date" value={value} />;
export const ValueTime = () => <DateRangePicker label="Date" value={dateTime} />;
export const ValueZoned = () => <DateRangePicker label="Date" value={zoned} />;
export const ValueFocus = () => <DateRangePicker label="Date" value={value} autoFocus />;
ValueFocus.parameters = focusParams;

export const DisabledPlaceholder = () => <DateRangePicker label="Date" placeholderValue={value.start} isDisabled />;
export const DisabledValue = () => <DateRangePicker label="Date" value={value} isDisabled />;
export const ReadOnly = () => <DateRangePicker label="Date" value={value} isReadOnly />;
export const QuietPlaceholder = () => <DateRangePicker label="Date" placeholderValue={value.start} isQuiet />;
export const QuietValue = () => <DateRangePicker label="Date" value={value} isQuiet />;
export const Invalid = () => <DateRangePicker label="Date" value={value} validationState="invalid" />;
export const Unavailable = () => <DateRangePicker label="Date" value={value} isDateUnavailable={date => date.day <= 10} />;
export const ErrorMessage = () => <DateRangePicker label="Date" value={value} validationState="invalid" errorMessage="Invalid selection" />;
export const HelpText = () => <DateRangePicker label="Date" value={value} description="Enter a date" />;
export const FormatHelpText = () => <DateRangePicker label="Date" value={value} showFormatHelpText />;
export const LabelPositionSide = () => <DateRangePicker label="Date" value={value} labelPosition="side" />;
export const LabelAlignEnd = () => <DateRangePicker label="Date" value={value} labelAlign="end" />;
export const Required = () => <DateRangePicker label="Date" value={value} isRequired />;
export const RequiredLabel = () => <DateRangePicker label="Date" value={value} isRequired necessityIndicator="label" />;
export const Optional = () => <DateRangePicker label="Date" value={value} necessityIndicator="label" />;
export const NoLabel = () => <DateRangePicker aria-label="Date" value={value} />;
export const QuietNoLabel = () => <DateRangePicker aria-label="Date" isQuiet value={value} />;
export const CustomWidth = () => <DateRangePicker label="Date" value={value} width={500} />;
export const QuietCustomWidth = () => <DateRangePicker label="Date" value={value} width={500} isQuiet />;
export const CustomWidthNoLabel = () => <DateRangePicker aria-label="Date" value={value} width={500} />;
export const QuietCustomWidthNoLabel = () => <DateRangePicker aria-label="Date" value={value} width={500} isQuiet />;
export const CustomWidthLabelPositionSide = () => <DateRangePicker label="Date" value={value} width={500} labelPosition="side" />;
export const QuietCustomWidthLabelPositionSide = () => <DateRangePicker label="Date" value={value} width={500} labelPosition="side" isQuiet />;
export const CustomWidthSmall = () => <DateRangePicker label="Date" value={zoned} width={50} />;
export const CustomWidthSmallInvalid = () => <DateRangePicker label="Date" value={zoned} width={50} validationState="invalid" />;
export const CustomWidthSmallNoLabel = () => <DateRangePicker aria-label="Date" value={zoned} width={50} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp = () => <DateRangePicker label="Date" contextualHelp={contextualHelp} value={value} />;
export const ContextualHelpSideLabel = () => <DateRangePicker label="Date" labelPosition="side" contextualHelp={contextualHelp} value={value} />;

export const OpenPlaceholder = () => <DateRangePicker label="Date" placeholderValue={value.start} isOpen />;
OpenPlaceholder.parameters = openParams;
OpenPlaceholder.decorators = openDecorators;

export const OpenPlaceholderRTL = () => <DateRangePicker label="Date" placeholderValue={value.start} isOpen />;
OpenPlaceholderRTL.parameters = openParamsRTL;
OpenPlaceholderRTL.decorators = openDecorators;

export const OpenValue = () => <DateRangePicker label="Date" value={value} isOpen />;
OpenValue.parameters = openParams;
OpenValue.decorators = openDecorators;

export const OpenValueRTL = () => <DateRangePicker label="Date" value={value} isOpen />;
OpenValueRTL.parameters = openParamsRTL;
OpenValueRTL.decorators = openDecorators;

export const OpenTime = () => <DateRangePicker label="Date" value={dateTime} isOpen />;
OpenTime.parameters = openParams;
OpenTime.decorators = openDecorators;

export const OpenZoned = () => <DateRangePicker label="Date" value={zoned} isOpen />;
OpenZoned.parameters = openParams;
OpenZoned.decorators = openDecorators;

export const OpenInvalid = () => <DateRangePicker label="Date" value={value} isOpen validationState="invalid" />;
OpenInvalid.parameters = openParams;
OpenInvalid.decorators = openDecorators;

export const OpenErrorMessage = () => <DateRangePicker label="Date" value={value} isOpen validationState="invalid" errorMessage="Invalid selection" />;
OpenErrorMessage.parameters = openParams;
OpenErrorMessage.decorators = openDecorators;

export const OpenInvalidTime = () => <DateRangePicker label="Date" value={zoned} isOpen validationState="invalid" />;
OpenInvalidTime.parameters = openParams;
OpenInvalidTime.decorators = openDecorators;

export const OpenUnavailable = () => <DateRangePicker label="Date" value={value} isOpen isDateUnavailable={date => date.day <= 10} />;
OpenUnavailable.parameters = openParams;
OpenUnavailable.decorators = openDecorators;

export const OpenExpress = () => <DateRangePicker label="Date" value={dateTime} isOpen />;
OpenExpress.parameters = {
  chromaticProvider: {
    express: true,
    disableAnimations: true
  }
};
OpenExpress.decorators = openDecorators;

export const OpenFocusLTRInteractions = () => <DateRangePicker label="Date" value={value} />;
OpenFocusLTRInteractions.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};
OpenFocusLTRInteractions.decorators = openDecorators;

OpenFocusLTRInteractions.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[ArrowRight]');
  await userEvent.keyboard('[Enter]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('dialog');
  await userEvent.keyboard('[ArrowLeft]');
};

export const OpenFocusRTLInteractions = () => <DateRangePicker label="Date" value={value} />;
OpenFocusRTLInteractions.parameters = {
  chromaticProvider: {
    locales: ['he-IL'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};
OpenFocusRTLInteractions.decorators = openDecorators;

OpenFocusRTLInteractions.play = async ({canvasElement}) => {
  await userEvent.tab();
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[ArrowLeft]');
  await userEvent.keyboard('[Enter]');
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('dialog');
  await userEvent.keyboard('[ArrowRight]');
};

export const MultipleMonths = () => <DateRangePicker label="Date" value={value} isOpen maxVisibleMonths={3} />;
MultipleMonths.parameters = openParams;
MultipleMonths.decorators = [Story => <div style={{height: 550, width: 1000}}><Story /></div>];

export const Tray = () => <DateRangePicker label="Date" value={value} isOpen />;
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

export const TrayExpress = () => <DateRangePicker label="Date" value={value} isOpen />;
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
