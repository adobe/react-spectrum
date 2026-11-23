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
import {DatePicker} from '../../src/datepicker/DatePicker';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {userEvent, within} from 'storybook/test';

export default {
  title: 'DatePicker',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
} as Meta<typeof DatePicker>;

export type DatePickerStory = StoryObj<typeof DatePicker>;

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

const openDecorators = [
  Story => (
    <div style={{height: 550}}>
      <Story />
    </div>
  )
];

const date = new CalendarDate(2022, 2, 3);
const dateTime = new CalendarDateTime(2022, 2, 3, 8, 45);
const zonedDateTime = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} {...args} />
};
export const PlaceholderFocus: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: focusParams
};

export const PlaceholderFocusRTL: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['ar-EG'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusExpress: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      express: true
    }
  }
};

export const PlaceholderTime: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={dateTime} {...args} />
};
export const PlaceholderZoned: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={zonedDateTime} {...args} />
};
export const Value: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} {...args} />
};
export const ValueTime: DatePickerStory = {
  render: args => <DatePicker label="Date" value={dateTime} {...args} />
};
export const ValueZoned: DatePickerStory = {
  render: args => <DatePicker label="Date" value={zonedDateTime} {...args} />
};
export const ValueFocus: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} autoFocus {...args} />,
  parameters: focusParams
};

export const DisabledPlaceholder: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} isDisabled {...args} />
};
export const DisabledValue: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isDisabled {...args} />
};
export const ReadOnly: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isReadOnly {...args} />
};
export const QuietPlaceholder: DatePickerStory = {
  render: args => <DatePicker label="Date" placeholderValue={date} isQuiet {...args} />
};
export const QuietValue: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isQuiet {...args} />
};
export const Invalid: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} validationState="invalid" {...args} />
};
export const Unavailable: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={date} isDateUnavailable={date => date.day <= 10} {...args} />
  )
};
export const ErrorMessage: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={date}
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  )
};
export const HelpText: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} description="Enter a date" {...args} />
};
export const FormatHelpText: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} showFormatHelpText {...args} />
};
export const LabelPositionSide: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} labelPosition="side" {...args} />
};
export const LabelAlignEnd: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} labelAlign="end" {...args} />
};
export const Required: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isRequired {...args} />
};
export const RequiredLabel: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={date} isRequired necessityIndicator="label" {...args} />
  )
};
export const Optional: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} necessityIndicator="label" {...args} />
};
export const NoLabel: DatePickerStory = {
  render: args => <DatePicker aria-label="Date" value={date} {...args} />
};
export const QuietNoLabel: DatePickerStory = {
  render: args => <DatePicker aria-label="Date" isQuiet value={date} {...args} />
};
export const CustomWidth: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} width={500} {...args} />
};
export const QuietCustomWidth: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} width={500} isQuiet {...args} />
};
export const CustomWidthNoLabel: DatePickerStory = {
  render: args => <DatePicker aria-label="Date" value={date} width={500} {...args} />
};
export const QuietCustomWidthNoLabel: DatePickerStory = {
  render: args => <DatePicker aria-label="Date" value={date} width={500} isQuiet {...args} />
};
export const CustomWidthLabelPositionSide: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={date} width={500} labelPosition="side" {...args} />
  )
};
export const QuietCustomWidthLabelPositionSide: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={date} width={500} labelPosition="side" isQuiet {...args} />
  )
};
export const CustomWidthSmall: DatePickerStory = {
  render: args => <DatePicker label="Date" value={zonedDateTime} width={50} {...args} />
};
export const CustomWidthSmallInvalid: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={zonedDateTime} width={50} validationState="invalid" {...args} />
  )
};
export const CustomWidthSmallNoLabel: DatePickerStory = {
  render: args => <DatePicker aria-label="Date" value={zonedDateTime} width={50} {...args} />
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

export const _ContextualHelp: DatePickerStory = {
  render: args => <DatePicker label="Date" contextualHelp={contextualHelp} value={date} {...args} />
};
export const ContextualHelpSideLabel: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      labelPosition="side"
      contextualHelp={contextualHelp}
      value={date}
      {...args}
    />
  )
};

export const OpenPlaceholder: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" placeholderValue={date} isOpen shouldFlip={false} {...args} />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenPlaceholderRTL: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" placeholderValue={date} isOpen shouldFlip={false} {...args} />
  ),
  parameters: openParamsRTL,
  decorators: openDecorators
};

export const OpenValue: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isOpen shouldFlip={false} {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenValueRTL: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isOpen shouldFlip={false} {...args} />,
  parameters: openParamsRTL,
  decorators: openDecorators
};

export const OpenTime: DatePickerStory = {
  render: args => <DatePicker label="Date" value={dateTime} isOpen shouldFlip={false} {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenZoned: DatePickerStory = {
  render: args => (
    <DatePicker label="Date" value={zonedDateTime} isOpen shouldFlip={false} {...args} />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenInvalid: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={date}
      isOpen
      shouldFlip={false}
      validationState="invalid"
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenErrorMessage: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={date}
      isOpen
      shouldFlip={false}
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenInvalidTime: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={zonedDateTime}
      isOpen
      shouldFlip={false}
      validationState="invalid"
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenUnavailable: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={date}
      isOpen
      shouldFlip={false}
      isDateUnavailable={date => date.day <= 10}
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenExpress: DatePickerStory = {
  render: args => <DatePicker label="Date" value={dateTime} isOpen shouldFlip={false} {...args} />,
  parameters: {
    chromaticProvider: {
      express: true,
      disableAnimations: true
    }
  },
  decorators: openDecorators
};

export const OpenLTRInteractions: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['en-US'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  },
  decorators: openDecorators,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[Enter]]');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await userEvent.keyboard('[ArrowRight]');
  }
};

export const OpenRTLInteractions: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['ar-EG'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  },
  decorators: openDecorators,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('[ArrowLeft]');
    await userEvent.keyboard('[ArrowLeft]');
    await userEvent.keyboard('[ArrowLeft]');
    await userEvent.keyboard('[Enter]]');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await userEvent.keyboard('[ArrowLeft]');
  }
};

export const MultipleMonths: DatePickerStory = {
  render: args => (
    <DatePicker
      label="Date"
      value={date}
      isOpen
      shouldFlip={false}
      maxVisibleMonths={3}
      {...args}
    />
  ),
  parameters: openParams,
  decorators: [
    Story => (
      <div style={{height: 550, width: 1000}}>
        <Story />
      </div>
    )
  ]
};

export const Tray: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isOpen {...args} />,
  parameters: {
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
  }
};

export const TrayExpress: DatePickerStory = {
  render: args => <DatePicker label="Date" value={date} isOpen {...args} />,
  parameters: {
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
  }
};
