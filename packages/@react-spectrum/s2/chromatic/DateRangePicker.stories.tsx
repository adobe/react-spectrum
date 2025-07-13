/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CalendarDate, CalendarDateTime} from '@internationalized/date';
import {DateRangePicker} from '../';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent} from '@storybook/test';

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/DateRangePicker'
};

export default meta;

type Story = StoryObj<typeof DateRangePicker>;

const startDate = new CalendarDate(2022, 2, 3);
const endDate = new CalendarDate(2022, 2, 10);

export const Default: Story = {
  args: {
    label: 'Date of birth'
  }
};

export const WithValue: Story = {
  args: {
    label: 'Date of birth',
    value: {start: startDate, end: endDate}
  }
};

export const Focused: Story = {
  args: {
    label: 'Date of birth',
    value: {start: startDate, end: endDate}
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

export const OpenPicker: Story = {
  args: {
    label: 'Date of birth',
    value: {start: startDate, end: endDate}
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

export const OpenPickerWithTime: Story = {
  args: {
    label: 'Date of birth',
    value: {start: new CalendarDateTime(2022, 2, 3, 12, 0, 0), end: new CalendarDateTime(2022, 2, 10, 18, 40, 35)},
    granularity: 'second'
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};
