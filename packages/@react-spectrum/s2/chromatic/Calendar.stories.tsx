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

import {Calendar} from '../src';
import {CalendarDate} from '@internationalized/date';
import {Custom454Calendar} from '../../../@internationalized/date/tests/customCalendarImpl';
import {DateValue} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import {screen, userEvent, within} from '@storybook/test';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Calendar'
};

export default meta;

type Story = StoryObj<typeof Calendar>;

const date = new CalendarDate(2022, 2, 3);

export const Default: Story = {
  args: {
    defaultFocusedValue: date
  }
};

export const MultiMonth: Story = {
  args: {
    defaultFocusedValue: date,
    visibleMonths: 3
  }
};

export const UnavailableDays: Story = {
  args: {
    defaultFocusedValue: date,
    minValue: new CalendarDate(2022, 2, 2),
    maxValue: new CalendarDate(2022, 2, 20),
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 15 && date.day <= 18;
    },
    isInvalid: true,
    errorMessage: 'Invalid date'
  }
};

export const CustomCalendar: Story = {
  args: {
    defaultFocusedValue: date,
    createCalendar: () => new Custom454Calendar()
  },
  parameters: {
    chromaticProvider: {
      // only works for en-US?
      locales: ['en-US']
    }
  }
};

export const DefaultHover: Story = {
  args: {
    defaultFocusedValue: date
  },
  play: async () => {
    let grid = screen.getByRole('grid');
    let cell = within(grid).getAllByRole('button')[7];
    await userEvent.hover(cell);
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

export const DefaultKeyboardFocus: Story = {
  args: {
    defaultFocusedValue: date
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
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

export const DefaultKeyboardSelected: Story = {
  args: {
    defaultFocusedValue: date
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
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
