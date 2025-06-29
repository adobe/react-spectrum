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
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {userEvent, within} from '@storybook/test';

export default {
  title: 'DateRangePicker',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
} as Meta<typeof DateRangePicker>;

export type DateRangePickerStory = StoryFn<typeof DateRangePicker>;

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

export const Placeholder: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} {...args} />;
export const PlaceholderFocus: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />;
PlaceholderFocus.parameters = focusParams;

export const PlaceholderFocusRTL: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['he-IL'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const PlaceholderTime: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={dateTime.start} {...args} />;
export const PlaceholderZoned: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={zoned.start} {...args} />;
export const Value: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} {...args} />;
export const ValueTime: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={dateTime} {...args} />;
export const ValueZoned: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={zoned} {...args} />;
export const ValueFocus: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} autoFocus {...args} />;
ValueFocus.parameters = focusParams;

export const DisabledPlaceholder: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} isDisabled {...args} />;
export const DisabledValue: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isDisabled {...args} />;
export const ReadOnly: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isReadOnly {...args} />;
export const QuietPlaceholder: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} isQuiet {...args} />;
export const QuietValue: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isQuiet {...args} />;
export const Invalid: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} validationState="invalid" {...args} />;
export const Unavailable: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isDateUnavailable={date => date.day <= 10} {...args} />;
export const ErrorMessage: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} validationState="invalid" errorMessage="Invalid selection" {...args} />;
export const HelpText: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} description="Enter a date" {...args} />;
export const FormatHelpText: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} showFormatHelpText {...args} />;
export const LabelPositionSide: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} labelPosition="side" {...args} />;
export const LabelAlignEnd: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} labelAlign="end" {...args} />;
export const Required: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isRequired {...args} />;
export const RequiredLabel: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isRequired necessityIndicator="label" {...args} />;
export const Optional: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} necessityIndicator="label" {...args} />;
export const NoLabel: DateRangePickerStory = (args) => <DateRangePicker aria-label="Date" value={value} {...args} />;
export const QuietNoLabel: DateRangePickerStory = (args) => <DateRangePicker aria-label="Date" isQuiet value={value} {...args} />;
export const CustomWidth: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} width={500} {...args} />;
export const QuietCustomWidth: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} width={500} isQuiet {...args} />;
export const CustomWidthNoLabel: DateRangePickerStory = (args) => <DateRangePicker aria-label="Date" value={value} width={500} {...args} />;
export const QuietCustomWidthNoLabel: DateRangePickerStory = (args) => <DateRangePicker aria-label="Date" value={value} width={500} isQuiet {...args} />;
export const CustomWidthLabelPositionSide: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} width={500} labelPosition="side" {...args} />;
export const QuietCustomWidthLabelPositionSide: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} width={500} labelPosition="side" isQuiet {...args} />;
export const CustomWidthSmall: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={zoned} width={50} {...args} />;
export const CustomWidthSmallInvalid: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={zoned} width={50} validationState="invalid" {...args} />;
export const CustomWidthSmallNoLabel: DateRangePickerStory = (args) => <DateRangePicker aria-label="Date" value={zoned} width={50} {...args} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp: DateRangePickerStory = (args) => <DateRangePicker label="Date" contextualHelp={contextualHelp} value={value} {...args} />;
export const ContextualHelpSideLabel: DateRangePickerStory = (args) => <DateRangePicker label="Date" labelPosition="side" contextualHelp={contextualHelp} value={value} {...args} />;

export const OpenPlaceholder: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} isOpen {...args} />;
OpenPlaceholder.parameters = openParams;
OpenPlaceholder.decorators = openDecorators;

export const OpenPlaceholderRTL: DateRangePickerStory = (args) => <DateRangePicker label="Date" placeholderValue={value.start} isOpen {...args} />;
OpenPlaceholderRTL.parameters = openParamsRTL;
OpenPlaceholderRTL.decorators = openDecorators;

export const OpenValue: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen {...args} />;
OpenValue.parameters = openParams;
OpenValue.decorators = openDecorators;

export const OpenValueRTL: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen {...args} />;
OpenValueRTL.parameters = openParamsRTL;
OpenValueRTL.decorators = openDecorators;

export const OpenTime: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={dateTime} isOpen {...args} />;
OpenTime.parameters = openParams;
OpenTime.decorators = openDecorators;

export const OpenZoned: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={zoned} isOpen {...args} />;
OpenZoned.parameters = openParams;
OpenZoned.decorators = openDecorators;

export const OpenInvalid: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen validationState="invalid" {...args} />;
OpenInvalid.parameters = openParams;
OpenInvalid.decorators = openDecorators;

export const OpenErrorMessage: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen validationState="invalid" errorMessage="Invalid selection" {...args} />;
OpenErrorMessage.parameters = openParams;
OpenErrorMessage.decorators = openDecorators;

export const OpenInvalidTime: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={zoned} isOpen validationState="invalid" {...args} />;
OpenInvalidTime.parameters = openParams;
OpenInvalidTime.decorators = openDecorators;

export const OpenUnavailable: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen isDateUnavailable={date => date.day <= 10} {...args} />;
OpenUnavailable.parameters = openParams;
OpenUnavailable.decorators = openDecorators;

export const OpenExpress: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={dateTime} isOpen {...args} />;
OpenExpress.parameters = {
  chromaticProvider: {
    express: true,
    disableAnimations: true
  }
};
OpenExpress.decorators = openDecorators;

export const OpenFocusLTRInteractions: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} {...args} />;
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

export const OpenFocusRTLInteractions: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} {...args} />;
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

export const MultipleMonths: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen maxVisibleMonths={3} {...args} />;
MultipleMonths.parameters = openParams;
MultipleMonths.decorators = [Story => <div style={{height: 550, width: 1000}}><Story /></div>];

export const Tray: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen {...args} />;
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

export const TrayExpress: DateRangePickerStory = (args) => <DateRangePicker label="Date" value={value} isOpen {...args} />;
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
