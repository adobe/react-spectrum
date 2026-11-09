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
import {DateRangePicker} from '../../src/datepicker/DateRangePicker';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {userEvent, within} from 'storybook/test';

export default {
  title: 'DateRangePicker',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP', 'he-IL']
    }
  }
} as Meta<typeof DateRangePicker>;

export type DateRangePickerStory = StoryObj<typeof DateRangePicker>;

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

const openDecorators = [
  Story => (
    <div style={{height: 550}}>
      <Story />
    </div>
  )
];

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

export const Placeholder: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={value.start} {...args} />
};
export const PlaceholderFocus: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />
  ),
  parameters: focusParams
};

export const PlaceholderFocusRTL: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />
  ),
  parameters: {
    chromaticProvider: {
      locales: ['he-IL'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusExpress: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" placeholderValue={value.start} autoFocus {...args} />
  ),
  parameters: {
    chromaticProvider: {
      express: true
    }
  }
};

export const PlaceholderTime: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={dateTime.start} {...args} />
};
export const PlaceholderZoned: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={zoned.start} {...args} />
};
export const Value: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} {...args} />
};
export const ValueTime: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={dateTime} {...args} />
};
export const ValueZoned: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={zoned} {...args} />
};
export const ValueFocus: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} autoFocus {...args} />,
  parameters: focusParams
};

export const DisabledPlaceholder: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" placeholderValue={value.start} isDisabled {...args} />
  )
};
export const DisabledValue: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isDisabled {...args} />
};
export const ReadOnly: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isReadOnly {...args} />
};
export const QuietPlaceholder: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={value.start} isQuiet {...args} />
};
export const QuietValue: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isQuiet {...args} />
};
export const Invalid: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} validationState="invalid" {...args} />
};
export const Unavailable: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      value={value}
      isDateUnavailable={date => date.day <= 10}
      {...args}
    />
  )
};
export const ErrorMessage: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      value={value}
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  )
};
export const HelpText: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} description="Enter a date" {...args} />
  )
};
export const FormatHelpText: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} showFormatHelpText {...args} />
};
export const LabelPositionSide: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} labelPosition="side" {...args} />
};
export const LabelAlignEnd: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} labelAlign="end" {...args} />
};
export const Required: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isRequired {...args} />
};
export const RequiredLabel: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} isRequired necessityIndicator="label" {...args} />
  )
};
export const Optional: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} necessityIndicator="label" {...args} />
  )
};
export const NoLabel: DateRangePickerStory = {
  render: args => <DateRangePicker aria-label="Date" value={value} {...args} />
};
export const QuietNoLabel: DateRangePickerStory = {
  render: args => <DateRangePicker aria-label="Date" isQuiet value={value} {...args} />
};
export const CustomWidth: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} width={500} {...args} />
};
export const QuietCustomWidth: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} width={500} isQuiet {...args} />
};
export const CustomWidthNoLabel: DateRangePickerStory = {
  render: args => <DateRangePicker aria-label="Date" value={value} width={500} {...args} />
};
export const QuietCustomWidthNoLabel: DateRangePickerStory = {
  render: args => <DateRangePicker aria-label="Date" value={value} width={500} isQuiet {...args} />
};
export const CustomWidthLabelPositionSide: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} width={500} labelPosition="side" {...args} />
  )
};
export const QuietCustomWidthLabelPositionSide: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      value={value}
      width={500}
      labelPosition="side"
      isQuiet
      {...args}
    />
  )
};
export const CustomWidthSmall: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={zoned} width={50} {...args} />
};
export const CustomWidthSmallInvalid: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={zoned} width={50} validationState="invalid" {...args} />
  )
};
export const CustomWidthSmallNoLabel: DateRangePickerStory = {
  render: args => <DateRangePicker aria-label="Date" value={zoned} width={50} {...args} />
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

export const _ContextualHelp: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" contextualHelp={contextualHelp} value={value} {...args} />
  )
};
export const ContextualHelpSideLabel: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      labelPosition="side"
      contextualHelp={contextualHelp}
      value={value}
      {...args}
    />
  )
};

export const OpenPlaceholder: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={value.start} isOpen {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenPlaceholderRTL: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" placeholderValue={value.start} isOpen {...args} />,
  parameters: openParamsRTL,
  decorators: openDecorators
};

export const OpenValue: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isOpen {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenValueRTL: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isOpen {...args} />,
  parameters: openParamsRTL,
  decorators: openDecorators
};

export const OpenTime: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={dateTime} isOpen {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenZoned: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={zoned} isOpen {...args} />,
  parameters: openParams,
  decorators: openDecorators
};

export const OpenInvalid: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} isOpen validationState="invalid" {...args} />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenErrorMessage: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      value={value}
      isOpen
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenInvalidTime: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={zoned} isOpen validationState="invalid" {...args} />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenUnavailable: DateRangePickerStory = {
  render: args => (
    <DateRangePicker
      label="Date"
      value={value}
      isOpen
      isDateUnavailable={date => date.day <= 10}
      {...args}
    />
  ),
  parameters: openParams,
  decorators: openDecorators
};

export const OpenExpress: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={dateTime} isOpen {...args} />,
  parameters: {
    chromaticProvider: {
      express: true,
      disableAnimations: true
    }
  },
  decorators: openDecorators
};

export const OpenFocusLTRInteractions: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} {...args} />,
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
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[ArrowRight]');
    await userEvent.keyboard('[Enter]');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await userEvent.keyboard('[ArrowLeft]');
  }
};

export const OpenFocusRTLInteractions: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['he-IL'],
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
    await userEvent.keyboard('[ArrowLeft]');
    await userEvent.keyboard('[Enter]');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await userEvent.keyboard('[ArrowRight]');
  }
};

export const MultipleMonths: DateRangePickerStory = {
  render: args => (
    <DateRangePicker label="Date" value={value} isOpen maxVisibleMonths={3} {...args} />
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

export const Tray: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isOpen {...args} />,
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

export const TrayExpress: DateRangePickerStory = {
  render: args => <DateRangePicker label="Date" value={value} isOpen {...args} />,
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
