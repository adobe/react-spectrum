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

import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import {parseZonedDateTime, Time} from '@internationalized/date';
import React from 'react';
import {TimeField} from '../../src/datepicker/TimeField';

export default {
  title: 'TimeField',
  parameters: {
    chromaticProvider: {
      locales: ['en-US', 'ar-EG', 'ja-JP']
    }
  }
} as Meta<typeof TimeField>;

export type TimeFieldStory = StoryObj<typeof TimeField>;

const time = new Time(8, 45);
const zoned = parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]');

export const Placeholder: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} {...args} />
};
export const PlaceholderZoned: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={zoned} {...args} />
};
export const PlaceholderFocus: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['en-US'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusRTL: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['ar-EG'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const PlaceholderFocusExpress: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      express: true
    }
  }
};

export const Value: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} {...args} />
};
export const ValueZoned: TimeFieldStory = {
  render: args => <TimeField label="Time" value={zoned} {...args} />
};
export const ValueFocus: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} autoFocus {...args} />,
  parameters: {
    chromaticProvider: {
      locales: ['en-US'],
      scales: ['medium'],
      colorSchemes: ['light'],
      express: false
    }
  }
};

export const DisabledPlaceholder: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} isDisabled {...args} />
};
export const DisabledValue: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} isDisabled {...args} />
};
export const ReadOnly: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} isReadOnly {...args} />
};
export const QuietPlaceholder: TimeFieldStory = {
  render: args => <TimeField label="Time" placeholderValue={time} isQuiet {...args} />
};
export const QuietValue: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} isQuiet {...args} />
};
export const Invalid: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} validationState="invalid" {...args} />
};
export const ErrorMessage: TimeFieldStory = {
  render: args => (
    <TimeField
      label="Time"
      value={time}
      validationState="invalid"
      errorMessage="Invalid selection"
      {...args}
    />
  )
};
export const HelpText: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} description="Enter a date" {...args} />
};
export const LabelPositionSide: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} labelPosition="side" {...args} />
};
export const LabelAlignEnd: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} labelAlign="end" {...args} />
};
export const Required: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} isRequired {...args} />
};
export const RequiredLabel: TimeFieldStory = {
  render: args => (
    <TimeField label="Time" value={time} isRequired necessityIndicator="label" {...args} />
  )
};
export const Optional: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} necessityIndicator="label" {...args} />
};
export const NoLabel: TimeFieldStory = {
  render: args => <TimeField aria-label="Time" value={time} {...args} />
};
export const QuietNoLabel: TimeFieldStory = {
  render: args => <TimeField aria-label="Time" isQuiet value={time} {...args} />
};
export const CustomWidth: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} width={500} {...args} />
};
export const QuietCustomWidth: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} width={500} isQuiet {...args} />
};
export const CustomWidthNoLabel: TimeFieldStory = {
  render: args => <TimeField aria-label="Time" value={time} width={500} {...args} />
};
export const QuietCustomWidthNoLabel: TimeFieldStory = {
  render: args => <TimeField aria-label="Time" value={time} width={500} isQuiet {...args} />
};
export const CustomWidthLabelPositionSide: TimeFieldStory = {
  render: args => <TimeField label="Time" value={time} width={500} labelPosition="side" {...args} />
};
export const QuietCustomWidthLabelPositionSide: TimeFieldStory = {
  render: args => (
    <TimeField label="Time" value={time} width={500} labelPosition="side" isQuiet {...args} />
  )
};
export const CustomWidthSmall: TimeFieldStory = {
  render: args => <TimeField label="Time" value={zoned} width={50} {...args} />
};
export const CustomWidthSmallInvalid: TimeFieldStory = {
  render: args => (
    <TimeField label="Time" value={zoned} width={50} validationState="invalid" {...args} />
  )
};
export const CustomWidthSmallNoLabel: TimeFieldStory = {
  render: args => <TimeField aria-label="Time" value={zoned} width={50} {...args} />
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

export const _ContextualHelp: TimeFieldStory = {
  render: args => <TimeField label="Date" contextualHelp={contextualHelp} value={time} {...args} />
};
export const ContextualHelpSideLabel: TimeFieldStory = {
  render: args => (
    <TimeField
      label="Date"
      labelPosition="side"
      contextualHelp={contextualHelp}
      value={time}
      {...args}
    />
  )
};
