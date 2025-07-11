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
import {Meta, StoryFn} from '@storybook/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';

export default {
  title: 'DateField',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
} as Meta<typeof DateField>;

export type DateFieldStory = StoryFn<typeof DateField>;

const date = new CalendarDate(2022, 2, 3);
const dateTime = new CalendarDateTime(2022, 2, 3, 8, 45);
const zonedDateTime = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} {...args} />;
export const PlaceholderFocus: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} autoFocus {...args} />;
PlaceholderFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusRTL: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} autoFocus {...args} />;
PlaceholderFocusRTL.parameters = {
  chromaticProvider: {
    locales: ['he-IL'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PlaceholderFocusExpress: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} autoFocus {...args} />;
PlaceholderFocusExpress.parameters = {
  chromaticProvider: {
    express: true
  }
};

export const PlaceholderTime: DateFieldStory = (args) => <DateField label="Date" placeholderValue={dateTime} {...args} />;
export const PlaceholderZoned: DateFieldStory = (args) => <DateField label="Date" placeholderValue={zonedDateTime} {...args} />;
export const Value: DateFieldStory = (args) => <DateField label="Date" value={date} {...args} />;
export const ValueTime: DateFieldStory = (args) => <DateField label="Date" value={dateTime} {...args} />;
export const ValueZoned: DateFieldStory = (args) => <DateField label="Date" value={zonedDateTime} {...args} />;
export const ValueFocus: DateFieldStory = (args) => <DateField label="Date" value={date} autoFocus {...args} />;
ValueFocus.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const DisabledPlaceholder: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} isDisabled {...args} />;
export const DisabledValue: DateFieldStory = (args) => <DateField label="Date" value={date} isDisabled {...args} />;
export const ReadOnly: DateFieldStory = (args) => <DateField label="Date" value={date} isReadOnly {...args} />;
export const QuietPlaceholder: DateFieldStory = (args) => <DateField label="Date" placeholderValue={date} isQuiet {...args} />;
export const QuietValue: DateFieldStory = (args) => <DateField label="Date" value={date} isQuiet {...args} />;
export const Invalid: DateFieldStory = (args) => <DateField label="Date" value={date} validationState="invalid" {...args} />;
export const ErrorMessage: DateFieldStory = (args) => <DateField label="Date" value={date} validationState="invalid" errorMessage="Invalid selection" {...args} />;
export const HelpText: DateFieldStory = (args) => <DateField label="Date" value={date} description="Enter a date" {...args} />;
export const FormatHelpText: DateFieldStory = (args) => <DateField label="Date" value={date} showFormatHelpText {...args} />;
export const LabelPositionSide: DateFieldStory = (args) => <DateField label="Date" value={date} labelPosition="side" {...args} />;
export const LabelAlignEnd: DateFieldStory = (args) => <DateField label="Date" value={date} labelAlign="end" {...args} />;
export const Required: DateFieldStory = (args) => <DateField label="Date" value={date} isRequired {...args} />;
export const RequiredLabel: DateFieldStory = (args) => <DateField label="Date" value={date} isRequired necessityIndicator="label" {...args} />;
export const Optional: DateFieldStory = (args) => <DateField label="Date" value={date} necessityIndicator="label" {...args} />;
export const NoLabel: DateFieldStory = (args) => <DateField aria-label="Date" value={date} {...args} />;
export const QuietNoLabel: DateFieldStory = (args) => <DateField aria-label="Date" isQuiet value={date} {...args} />;
export const CustomWidth: DateFieldStory = (args) => <DateField label="Date" value={date} width={500} {...args} />;
export const QuietCustomWidth: DateFieldStory = (args) => <DateField label="Date" value={date} width={500} isQuiet {...args} />;
export const CustomWidthNoLabel: DateFieldStory = (args) => <DateField aria-label="Date" value={date} width={500} {...args} />;
export const QuietCustomWidthNoLabel: DateFieldStory = (args) => <DateField aria-label="Date" value={date} width={500} isQuiet {...args} />;
export const CustomWidthLabelPositionSide: DateFieldStory = (args) => <DateField label="Date" value={date} width={500} labelPosition="side" {...args} />;
export const QuietCustomWidthLabelPositionSide: DateFieldStory = (args) => <DateField label="Date" value={date} width={500} labelPosition="side" isQuiet {...args} />;
export const CustomWidthSmall: DateFieldStory = (args) => <DateField label="Time" value={zonedDateTime} width={50} {...args} />;
export const CustomWidthSmallInvalid: DateFieldStory = (args) => <DateField label="Time" value={zonedDateTime} width={50} validationState="invalid" {...args} />;
export const CustomWidthSmallNoLabel: DateFieldStory = (args) => <DateField aria-label="Time" value={zonedDateTime} width={50} {...args} />;

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp: DateFieldStory = (args) => <DateField label="Date" contextualHelp={contextualHelp} value={date} {...args} />;
export const ContextualHelpSideLabel: DateFieldStory = (args) => <DateField label="Date" labelPosition="side" contextualHelp={contextualHelp} value={date} {...args} />;

export const ArabicAlgeriaPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
ArabicAlgeriaPreferences.parameters = {
  chromaticProvider: {
    locales: ['ar-DZ-u-ca-gregory', 'ar-DZ-u-ca-islamic', 'ar-DZ-u-ca-islamic-civil', 'ar-DZ-u-ca-islamic-tbla'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const ArabicUAEPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
ArabicUAEPreferences.parameters = {
  chromaticProvider: {
    locales: ['ar-AE-u-ca-gregory', 'ar-AE-u-ca-islamic-umalqura', 'ar-AE-u-ca-islamic', 'ar-AE-u-ca-islamic-civil', 'ar-AE-u-ca-islamic-tbla'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const ArabicEgyptPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
ArabicEgyptPreferences.parameters = {
  chromaticProvider: {
    locales: ['ar-EG-u-ca-gregory', 'ar-EG-u-ca-coptic', 'ar-EG-u-ca-islamic', 'ar-EG-u-ca-islamic-civil', 'ar-EG-u-ca-islamic-tbla'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const ArabicSaudiPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
ArabicSaudiPreferences.parameters = {
  chromaticProvider: {
    locales: ['ar-SA-u-ca-islamic-umalqura', 'ar-SA-u-ca-gregory', 'ar-SA-u-ca-islamic', 'ar-SA-u-ca-islamic-rgsa'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};


export const HebrewPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
HebrewPreferences.parameters = {
  chromaticProvider: {
    locales: ['he-IL-u-ca-gregory', 'he-IL-u-ca-hebrew', 'he-IL-u-ca-islamic-civil', 'he-IL-u-ca-islamic-tbla'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const JapanesePreferences: DateFieldStory = (args) =>  <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
JapanesePreferences.parameters = {
  chromaticProvider: {
    locales: ['ja-JP-u-ca-gregory', 'ja-JP-u-ca-japanese'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const ThaiPreferences: DateFieldStory = (args) =>  <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
ThaiPreferences.parameters = {
  chromaticProvider: {
    locales: ['th-TH-u-ca-buddhist', 'th-TH-u-ca-gregory'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const PersianPreferences: DateFieldStory = (args) => <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
PersianPreferences.parameters = {
  chromaticProvider: {
    locales: ['fa-AF-u-ca-persian', 'fa-AF-u-ca-gregory', 'fa-AF-u-ca-islamic-civil', 'fa-AF-u-ca-islamic-tbla'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const IndianPreferences: DateFieldStory = (args) =>  <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
IndianPreferences.parameters = {
  chromaticProvider: {
    locales: ['hi-IN-u-ca-gregory', 'hi-IN-u-ca-indian'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};

export const AmharicPreferences: DateFieldStory = (args) =>  <Provider><DateField label="Date" value={dateTime} {...args} /></Provider>;
AmharicPreferences.parameters = {
  chromaticProvider: {
    locales: ['am-ET-u-ca-gregory', 'am-ET-u-ca-ethiopic', 'am-ET-u-ca-ethioaa'],
    scales: ['medium'],
    colorSchemes: ['light'],
    express: false
  }
};
