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

import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, parseAbsolute, parseAbsoluteToLocal, parseDate, parseDateTime, parseZonedDateTime, today, toZoned} from '@internationalized/date';
import {chain} from '@react-aria-nutrient/utils';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Custom454Calendar} from '@internationalized/date/tests/customCalendarImpl';
import {DatePicker} from '../';
import {DateValue} from '@react-types/calendar';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {Item, Picker, Section} from '@react-spectrum/picker';
import {Key} from '@react-types/shared';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {useLocale} from '@react-aria-nutrient/i18n';

export type DatePickerStory = ComponentStoryObj<typeof DatePicker>;
const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/DatePicker',
  component: DatePicker,
  decorators: [storyFn => BlockDecorator(storyFn)],
  args: {
    onChange: action('onChange')
  },
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    defaultValue: {
      table: {
        disable: true
      }
    },
    value: {
      table: {
        disable: true
      }
    },
    minValue: {
      table: {
        disable: true
      }
    },
    maxValue: {
      table: {
        disable: true
      }
    },
    placeholderValue: {
      table: {
        disable: true
      }
    },
    onBlur: {
      table: {
        disable: true
      }
    },
    onFocus: {
      table: {
        disable: true
      }
    },
    onFocusChange: {
      table: {
        disable: true
      }
    },
    onKeyDown: {
      table: {
        disable: true
      }
    },
    onKeyUp: {
      table: {
        disable: true
      }
    },
    onOpenChange: {
      table: {
        disable: true
      }
    },
    contextualHelp: {
      table: {
        disable: true
      }
    },
    isDateUnavailable: {
      table: {
        disable: true
      }
    },
    label: {
      control: 'text'
    },
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second']
    },
    hourCycle: {
      control: 'select',
      options: [12, 24]
    },
    hideTimeZone: {
      control: 'boolean'
    },
    shouldForceLeadingZeros: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    isQuiet: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    isRequired: {
      control: 'boolean'
    },
    necessityIndicator: {
      control: 'select',
      options: ['icon', 'label']
    },
    validationState: {
      control: 'select',
      options: [null, 'valid', 'invalid']
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    },
    labelAlign: {
      control: 'select',
      options: ['end', 'start']
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'side']
    },
    autoFocus: {
      control: 'boolean'
    },
    showFormatHelpText: {
      control: 'boolean'
    },
    'aria-label': {
      control: 'text'
    },
    width: {
      control: 'text'
    },
    maxVisibleMonths: {
      control: 'number'
    },
    shouldFlip: {
      control: 'boolean'
    },
    defaultOpen: {
      control: 'boolean'
    },
    isOpen: {
      control: 'boolean'
    },
    firstDayOfWeek: {
      control: 'select',
      options: [undefined, 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    }
  }
} as ComponentMeta<typeof DatePicker>;

export const Default: DatePickerStory = {
  render: (args) => render(args)
};

export const DefaultValue: DatePickerStory = {
  ...Default,
  args: {defaultValue: parseDate('2020-02-03')}
};

export const ControlledValue: DatePickerStory = {
  args: {value: new CalendarDate(2020, 2, 3)},
  render: (args) => <ControlledExample {...args} />
};

export const DefaultValueZoned: DatePickerStory = {
  ...Default,
  args: {defaultValue: toZoned(parseDate('2020-02-03'), 'America/Los_Angeles')},
  name: 'defaultValue date, zoned'
};

export const DateTimeValue: DatePickerStory = {
  ...Default,
  args: {defaultValue: parseDateTime('2021-03-14T08:45')}
};

export const DateTimeValueZoned: DatePickerStory = {
  ...Default,
  args: {defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]')}
};

export const DateTimeValueAbsolute: DatePickerStory = {
  ...Default,
  args: {defaultValue: parseAbsoluteToLocal('2021-11-07T07:45:00Z')}
};

export const DateTimeValueAbsoluteZoned: DatePickerStory = {
  ...Default,
  args: {defaultValue: parseAbsolute('2021-11-07T07:45:00Z', 'America/New_York')}
};


export const MinMaxValue: DatePickerStory = {
  ...Default,
  args: {minValue: new CalendarDate(2010, 0, 1), maxValue: new CalendarDate(2020, 0, 1)},
  name: 'minValue: 2010/1/1, maxValue: 2020/1/1'
};

export const PlaceholderVal: DatePickerStory = {
  ...Default,
  args: {placeholderValue: new CalendarDate(1980, 1, 1)},
  name: 'placeholder value: 1980/1/1'
};

export const PlaceholderValTime: DatePickerStory = {
  ...Default,
  args: {placeholderValue: new CalendarDateTime(1980, 1, 1, 8)},
  name: 'placeholder value: 1980/1/1 8AM'
};

export const PlaceholderValTimeZoned: DatePickerStory = {
  ...Default,
  args: {placeholderValue: toZoned(new CalendarDate(1980, 1, 1), 'America/Los_Angeles')},
  name: 'placeholder value: 1980/1/1 zoned'
};

export const DateUnavailable: DatePickerStory = {
  ...Default,
  args: {
    isDateUnavailable: (date: DateValue) => {
      const disabledIntervals = [[today(getLocalTimeZone()), today(getLocalTimeZone()).add({weeks: 1})], [today(getLocalTimeZone()).add({weeks: 2}), today(getLocalTimeZone()).add({weeks: 3})]];
      return disabledIntervals.some((interval) => date.compare(interval[0]) > 0 && date.compare(interval[1]) < 0);
    }
  },
  name: 'isDateUnavailable'
};

export const AllEvents: DatePickerStory = {
  ...Default,
  args: {onBlur: action('onBlur'), onFocus: action('onFocus'), onFocusChange: action('onFocusChange'), onKeyDown: action('onKeyDown'), onKeyUp: action('onKeyUp'),  onOpenChange: action('onOpenChange')},
  name: 'all the events'
};

export const ContextualHelpStory: DatePickerStory = {
  ...Default,
  args: {
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};

export const CustomCalendar: DatePickerStory = {
  args: {value: new CalendarDate(2024, 2, 13), createCalendar: () => new Custom454Calendar()},
  render: (args) => <CustomExample {...args} />
};

function render(props = {}) {
  return (
    <Example
      label="Date"
      maxWidth="calc(100vw - 40px)"
      {...props} />
  );
}

// https://github.com/unicode-org/cldr/blob/22af90ae3bb04263f651323ce3d9a71747a75ffb/common/supplemental/supplementalData.xml#L4649-L4664
const preferences = [
  {locale: '', label: 'Default', ordering: 'gregory'},
  {label: 'Arabic (Algeria)', locale: 'ar-DZ', territories: 'DJ DZ EH ER IQ JO KM LB LY MA MR OM PS SD SY TD TN YE', ordering: 'gregory islamic islamic-civil islamic-tbla'},
  {label: 'Arabic (United Arab Emirates)', locale: 'ar-AE', territories: 'AE BH KW QA', ordering: 'gregory islamic-umalqura islamic islamic-civil islamic-tbla'},
  {label: 'Arabic (Egypt)', locale: 'AR-EG', territories: 'EG', ordering: 'gregory coptic islamic islamic-civil islamic-tbla'},
  {label: 'Arabic (Saudi Arabia)', locale: 'ar-SA', territories: 'SA', ordering: 'islamic-umalqura gregory islamic islamic-rgsa'},
  {label: 'Farsi (Afghanistan)', locale: 'fa-AF', territories: 'AF IR', ordering: 'persian gregory islamic islamic-civil islamic-tbla'},
  // {territories: 'CN CX HK MO SG', ordering: 'gregory chinese'},
  {label: 'Amharic (Ethiopia)', locale: 'am-ET', territories: 'ET', ordering: 'gregory ethiopic ethioaa'},
  {label: 'Hebrew (Israel)', locale: 'he-IL', territories: 'IL', ordering: 'gregory hebrew islamic islamic-civil islamic-tbla'},
  {label: 'Hindi (India)', locale: 'hi-IN', territories: 'IN', ordering: 'gregory indian'},
  // {label: 'Marathi (India)', locale: 'mr-IN', territories: 'IN', ordering: 'gregory indian'},
  {label: 'Bengali (India)', locale: 'bn-IN', territories: 'IN', ordering: 'gregory indian'},
  {label: 'Japanese (Japan)', locale: 'ja-JP', territories: 'JP', ordering: 'gregory japanese'},
  // {territories: 'KR', ordering: 'gregory dangi'},
  {label: 'Thai (Thailand)', locale: 'th-TH', territories: 'TH', ordering: 'buddhist gregory'},
  {label: 'Chinese (Taiwan)', locale: 'zh-TW', territories: 'TW', ordering: 'gregory roc chinese'}
];

const calendars = [
  {key: 'gregory', name: 'Gregorian'},
  {key: 'japanese', name: 'Japanese'},
  {key: 'buddhist', name: 'Buddhist'},
  {key: 'roc', name: 'Taiwan'},
  {key: 'persian', name: 'Persian'},
  {key: 'indian', name: 'Indian'},
  {key: 'islamic-umalqura', name: 'Islamic (Umm al-Qura)'},
  {key: 'islamic-civil', name: 'Islamic Civil'},
  {key: 'islamic-tbla', name: 'Islamic Tabular'},
  {key: 'hebrew', name: 'Hebrew'},
  {key: 'coptic', name: 'Coptic'},
  {key: 'ethiopic', name: 'Ethiopic'},
  {key: 'ethioaa', name: 'Ethiopic (Amete Alem)'}
];

function Example(props) {
  let [locale, setLocale] = React.useState('');
  let [calendar, setCalendar] = React.useState<Key>(calendars[0].key);
  let {locale: defaultLocale} = useLocale();

  let pref = preferences.find(p => p.locale === locale);
  let preferredCalendars = React.useMemo(() => pref ? pref.ordering.split(' ').map(p => calendars.find(c => c.key === p)).filter(v => v != null) : [calendars[0]], [pref]);
  let otherCalendars = React.useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p.key === c.key)), [preferredCalendars]);

  let updateLocale = locale => {
    setLocale(locale);
    let pref = preferences.find(p => p.locale === locale)!;
    setCalendar(pref.ordering.split(' ')[0]);
  };

  return (
    <Flex direction="column" gap="size-600" alignItems="center">
      <Flex direction="row" gap="size-150" wrap justifyContent="center">
        <Picker label="Locale" items={preferences} selectedKey={locale} onSelectionChange={updateLocale}>
          {item => <Item key={item.locale}>{item.label}</Item>}
        </Picker>
        <Picker label="Calendar" selectedKey={calendar} onSelectionChange={setCalendar}>
          <Section title="Preferred" items={preferredCalendars}>
            {item => <Item>{item.name}</Item>}
          </Section>
          <Section title="Other" items={otherCalendars}>
            {item => <Item>{item.name}</Item>}
          </Section>
        </Picker>
      </Flex>
      <Provider locale={(locale || defaultLocale) + (calendar && calendar !== preferredCalendars[0].key ? '-u-ca-' + calendar : '')}>
        <DatePicker {...props} />
      </Provider>
    </Flex>
  );
}

function ControlledExample(props) {
  let [value, setValue] = React.useState(props.value);

  return (
    <Flex direction="column" alignItems="center" gap="size-150">
      <Example label="Controlled" {...props} value={value} onChange={chain(setValue, props?.onChange)} />
      <ActionButton onPress={() => setValue(new CalendarDate(2020, 2, 3))}>Change value</ActionButton>
      <ActionButton onPress={() => setValue(null)}>Clear</ActionButton>
    </Flex>
  );
}

function CustomExample(props) {
  let [value, setValue] = React.useState(props.value);

  return (
    <Flex direction="column" alignItems="center" gap="size-150">
      <DatePicker label="Custom 4-5-4 calendar" {...props} value={value} onChange={chain(setValue, action('onChange'))} />
    </Flex>
  );
};
