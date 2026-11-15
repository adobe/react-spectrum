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
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {DateField} from '../../src/datepicker/DateField';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import {Provider} from '../../src/provider/Provider';
import React from 'react';

export default {
  title: 'DateField',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
} as Meta<typeof DateField>;

export type DateFieldStory = StoryObj<typeof DateField>;

const date = new CalendarDate(2022, 2, 3);
const dateTime = new CalendarDateTime(2022, 2, 3, 8, 45);
const zonedDateTime = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} {...args} />
};
export const PlaceholderFocus: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['en-US'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusRTL: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['he-IL'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusExpress: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      express: true
    }
  }
};

export const PlaceholderTime: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={dateTime} {...args} />
};
export const PlaceholderZoned: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={zonedDateTime} {...args} />
};
export const Value: DateFieldStory = {
  render: args => <DateField label="Date" value={date} {...args} />
};
export const ValueTime: DateFieldStory = {
  render: args => <DateField label="Date" value={dateTime} {...args} />
};
export const ValueZoned: DateFieldStory = {
  render: args => <DateField label="Date" value={zonedDateTime} {...args} />
};
export const ValueFocus: DateFieldStory = {
  render: args => <DateField label="Date" value={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['en-US'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const DisabledPlaceholder: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} isDisabled {...args} />
};
export const DisabledValue: DateFieldStory = {
  render: args => <DateField label="Date" value={date} isDisabled {...args} />
};
export const ReadOnly: DateFieldStory = {
  render: args => <DateField label="Date" value={date} isReadOnly {...args} />
};
export const QuietPlaceholder: DateFieldStory = {
  render: args => <DateField label="Date" placeholderValue={date} isQuiet {...args} />
};
export const QuietValue: DateFieldStory = {
  render: args => <DateField label="Date" value={date} isQuiet {...args} />
};
export const Invalid: DateFieldStory = {
  render: args => <DateField label="Date" value={date} validationState="invalid" {...args} />
};
export const ErrorMessage: DateFieldStory = {
  render: args => (
    <DateField
      label="Date"
      value={date}
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  )
};
export const HelpText: DateFieldStory = {
  render: args => <DateField label="Date" value={date} description="Enter a date" {...args} />
};
export const FormatHelpText: DateFieldStory = {
  render: args => <DateField label="Date" value={date} showFormatHelpText {...args} />
};
export const LabelPositionSide: DateFieldStory = {
  render: args => <DateField label="Date" value={date} labelPosition="side" {...args} />
};
export const LabelAlignEnd: DateFieldStory = {
  render: args => <DateField label="Date" value={date} labelAlign="end" {...args} />
};
export const Required: DateFieldStory = {
  render: args => <DateField label="Date" value={date} isRequired {...args} />
};
export const RequiredLabel: DateFieldStory = {
  render: args => (
    <DateField label="Date" value={date} isRequired necessityIndicator="label" {...args} />
  )
};
export const Optional: DateFieldStory = {
  render: args => <DateField label="Date" value={date} necessityIndicator="label" {...args} />
};
export const NoLabel: DateFieldStory = {
  render: args => <DateField aria-label="Date" value={date} {...args} />
};
export const QuietNoLabel: DateFieldStory = {
  render: args => <DateField aria-label="Date" isQuiet value={date} {...args} />
};
export const CustomWidth: DateFieldStory = {
  render: args => <DateField label="Date" value={date} width={500} {...args} />
};
export const QuietCustomWidth: DateFieldStory = {
  render: args => <DateField label="Date" value={date} width={500} isQuiet {...args} />
};
export const CustomWidthNoLabel: DateFieldStory = {
  render: args => <DateField aria-label="Date" value={date} width={500} {...args} />
};
export const QuietCustomWidthNoLabel: DateFieldStory = {
  render: args => <DateField aria-label="Date" value={date} width={500} isQuiet {...args} />
};
export const CustomWidthLabelPositionSide: DateFieldStory = {
  render: args => <DateField label="Date" value={date} width={500} labelPosition="side" {...args} />
};
export const QuietCustomWidthLabelPositionSide: DateFieldStory = {
  render: args => (
    <DateField label="Date" value={date} width={500} labelPosition="side" isQuiet {...args} />
  )
};
export const CustomWidthSmall: DateFieldStory = {
  render: args => <DateField label="Time" value={zonedDateTime} width={50} {...args} />
};
export const CustomWidthSmallInvalid: DateFieldStory = {
  render: args => (
    <DateField label="Time" value={zonedDateTime} width={50} validationState="invalid" {...args} />
  )
};
export const CustomWidthSmallNoLabel: DateFieldStory = {
  render: args => <DateField aria-label="Time" value={zonedDateTime} width={50} {...args} />
};

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>
      Segments identify who your visitors are, what devices and services they use, where they
      navigated from, and much more.
    </Content>
  </ContextualHelp>
);

export const _ContextualHelp: DateFieldStory = {
  render: args => <DateField label="Date" contextualHelp={contextualHelp} value={date} {...args} />
};
export const ContextualHelpSideLabel: DateFieldStory = {
  render: args => (
    <DateField
      label="Date"
      labelPosition="side"
      contextualHelp={contextualHelp}
      value={date}
      {...args}
    />
  )
};

export const ArabicAlgeriaPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['ar-DZ-u-ca-gregory', 'ar-DZ-u-ca-islamic-civil', 'ar-DZ-u-ca-islamic-tbla'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const ArabicUAEPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: [
        'ar-AE-u-ca-gregory',
        'ar-AE-u-ca-islamic-umalqura',
        'ar-AE-u-ca-islamic-civil',
        'ar-AE-u-ca-islamic-tbla'
      ],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const ArabicEgyptPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: [
        'ar-EG-u-ca-gregory',
        'ar-EG-u-ca-coptic',
        'ar-EG-u-ca-islamic-civil',
        'ar-EG-u-ca-islamic-tbla'
      ],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const ArabicSaudiPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['ar-SA-u-ca-gregory', 'ar-SA-u-ca-islamic-umalqura'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const HebrewPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: [
        'he-IL-u-ca-gregory',
        'he-IL-u-ca-hebrew',
        'he-IL-u-ca-islamic-civil',
        'he-IL-u-ca-islamic-tbla'
      ],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const JapanesePreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['ja-JP-u-ca-gregory', 'ja-JP-u-ca-japanese'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const ThaiPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['th-TH-u-ca-buddhist', 'th-TH-u-ca-gregory'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PersianPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: [
        'fa-AF-u-ca-persian',
        'fa-AF-u-ca-gregory',
        'fa-AF-u-ca-islamic-civil',
        'fa-AF-u-ca-islamic-tbla'
      ],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const IndianPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['hi-IN-u-ca-gregory', 'hi-IN-u-ca-indian'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const AmharicPreferences: DateFieldStory = {
  render: args => (
    <Provider>
      <DateField label="Date" value={dateTime} {...args} />
    </Provider>
  ),
  parameters: {
    chromaticProvider: {
      locales: ['am-ET-u-ca-gregory', 'am-ET-u-ca-ethiopic', 'am-ET-u-ca-ethioaa'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};
