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

import {CalendarDate} from '@internationalized/date';
import {Custom454Calendar} from '../../../@internationalized/date/tests/customCalendarImpl';
import {DateValue} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import {RangeCalendar} from '../src';
import {userEvent} from '@storybook/test';

const meta: Meta<typeof RangeCalendar> = {
  component: RangeCalendar,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/RangeCalendar'
};

export default meta;

type Story = StoryObj<typeof RangeCalendar>;

const date = new CalendarDate(2022, 2, 3);

export const Default: Story = {
  args: {
    defaultFocusedValue: date
  }
};

export const MultiMonth: Story = {
  args: {
    defaultFocusedValue: date,
    visibleMonths: 3,
    defaultValue: {start: new CalendarDate(2022, 2, 3), end: new CalendarDate(2022, 3, 10)}
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

export const DefaultSelectRange: Story = {
  args: {
    defaultFocusedValue: date,
    minValue: new CalendarDate(2022, 2, 2),
    maxValue: new CalendarDate(2022, 2, 26),
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 15 && date.day <= 18;
    },
    allowsNonContiguousRanges: true
  },
  play: async () => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
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

export const SelectRangeDisabled: Story = {
  args: {
    defaultFocusedValue: date,
    minValue: new CalendarDate(2022, 2, 2),
    maxValue: new CalendarDate(2022, 2, 26),
    allowsNonContiguousRanges: true,
    isDisabled: true
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

export const InvalidNonContiguousRange: Story = {
  args: {
    defaultFocusedValue: date,
    value: {start: new CalendarDate(2022, 2, 5), end: new CalendarDate(2022, 2, 20)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 10 && date.day <= 15;
    },
    isInvalid: true,
    errorMessage: 'Selected range contains unavailable dates'
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

export const InvalidRangeStartUnavailable: Story = {
  args: {
    defaultFocusedValue: date,
    value: {start: new CalendarDate(2022, 2, 10), end: new CalendarDate(2022, 2, 20)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 10 && date.day <= 15;
    },
    isInvalid: true,
    errorMessage: 'Start date is unavailable'
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

// Invalid range: end date is unavailable
export const InvalidRangeEndUnavailable: Story = {
  args: {
    defaultFocusedValue: date,
    value: {start: new CalendarDate(2022, 2, 5), end: new CalendarDate(2022, 2, 15)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 10 && date.day <= 15;
    },
    isInvalid: true,
    errorMessage: 'End date is unavailable'
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

// Invalid range: both start and end dates are unavailable
export const InvalidRangeBothUnavailable: Story = {
  args: {
    defaultFocusedValue: date,
    value: {start: new CalendarDate(2022, 2, 10), end: new CalendarDate(2022, 2, 15)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 10 && date.day <= 15;
    },
    isInvalid: true,
    errorMessage: 'Both start and end dates are unavailable'
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};

// Invalid range with Tuesday as first day of week
export const InvalidRangeTuesdayFirstDay: Story = {
  args: {
    defaultFocusedValue: new CalendarDate(2024, 12, 20),
    value: {start: new CalendarDate(2024, 12, 18), end: new CalendarDate(2024, 12, 31)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 23 && date.day <= 29;
    },
    firstDayOfWeek: 'tue',
    isInvalid: true,
    errorMessage: 'Selected range contains unavailable dates'
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

export const InvalidRangeDisabled: Story = {
  args: {
    defaultFocusedValue: date,
    value: {start: new CalendarDate(2022, 2, 10), end: new CalendarDate(2022, 2, 20)},
    isDateUnavailable: (date: DateValue) => {
      return date.day >= 10 && date.day <= 15;
    },
    isInvalid: true,
    errorMessage: 'Invalid and disabled',
    isDisabled: true
  },
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light', 'dark'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  }
};
