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
import {CalendarDate, getLocalTimeZone, isWeekend, parseDate, today, toZoned} from '@internationalized/date';
import {chain} from '@react-aria/utils';
import {DateRangePicker} from '../';
import {DateValue} from '@react-types/calendar';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker, Section} from '@react-spectrum/picker';
import {Provider} from '@adobe/react-spectrum';
import React from 'react';
import {useLocale} from '@react-aria/i18n';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/DateRangePicker',
  decorators: [BlockDecorator],
  excludeStories: ['render']
};

export const Default = () => render();

Default.story = {
  name: 'default'
};

export const DefaultValue = () => render({defaultValue: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

DefaultValue.story = {
  name: 'defaultValue'
};

export const ControlledValue = () => <ControlledExample />;

ControlledValue.story = {
  name: 'controlled value'
};

export const DefaultValueZoned = () => render({defaultValue: {start: toZoned(parseDate('2020-02-03'), 'America/New_York'), end: toZoned(parseDate('2020-02-05'), 'America/Los_Angeles')}});

DefaultValueZoned.story = {
  name: 'defaultValue, zoned'
};

export const GranularityMinute = () => render({granularity: 'minute'});

GranularityMinute.story = {
  name: 'granularity: minute'
};

export const GranularitySecond = () => render({granularity: 'second'});

GranularitySecond.story = {
  name: 'granularity: second'
};

export const HourCycle12 = () => render({granularity: 'minute', hourCycle: 12});

HourCycle12.story = {
  name: 'hourCycle: 12'
};

export const HourCycle24 = () => render({granularity: 'minute', hourCycle: 24});

HourCycle24.story = {
  name: 'hourCycle: 24'
};

export const IsDisabled = () => render({isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsQuietIsDisabled = () => render({isQuiet: true, isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsQuietIsDisabled.story = {
  name: 'isQuiet, isDisabled'
};

export const IsReadOnly = () => render({isReadOnly: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const AutoFocus = () => render({autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid = () => render({validationState: 'valid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const MinDate201011MaxDate202011 = () => render({minValue: new CalendarDate(2010, 1, 1), maxValue: new CalendarDate(2020, 1, 1)});

MinDate201011MaxDate202011.story = {
  name: 'minDate: 2010/1/1, maxDate: 2020/1/1'
};

export const IsDateUnavailable = () => {
  const disabledRanges = [[today(getLocalTimeZone()), today(getLocalTimeZone()).add({weeks: 1})], [today(getLocalTimeZone()).add({weeks: 2}), today(getLocalTimeZone()).add({weeks: 3})]];
  let [value, setValue] = React.useState(null);
  let isInvalid = value && disabledRanges.some(interval => value.end.compare(interval[0]) >= 0 && value.start.compare(interval[1]) <= 0);
  let isDateUnavailable = (date) => disabledRanges.some((interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0);
  return render({
    value,
    onChange: setValue,
    validationState: isInvalid ? 'invalid' : null,
    isDateUnavailable,
    errorMessage: 'Selected ranges may not include unavailable dates.'
  });
};

IsDateUnavailable.story = {
  name: 'isDateUnavailable'
};

export const IsDateAvailableAllowsNonContiguousRanges = () => {
  let {locale} = useLocale();
  return render({isDateUnavailable: (date: DateValue) => isWeekend(date, locale), allowsNonContiguousRanges: true});
};

IsDateAvailableAllowsNonContiguousRanges.story = {
  name: 'isDateAvailable, allowsNonContiguousRanges'
};

export const PlaceholderValue198011 = () => render({placeholderValue: new CalendarDate(1980, 1, 1)});

PlaceholderValue198011.story = {
  name: 'placeholderValue: 1980/1/1'
};

export const MaxVisibleMonths2 = () => render({maxVisibleMonths: 2, granularity: 'minute'});

MaxVisibleMonths2.story = {
  name: 'maxVisibleMonths: 2'
};

export const MaxVisibleMonths3 = () => render({maxVisibleMonths: 3, granularity: 'minute'});

MaxVisibleMonths3.story = {
  name: 'maxVisibleMonths: 3'
};

export const ShowFormatHelpText = () => render({showFormatHelpText: true});

ShowFormatHelpText.story = {
  name: 'showFormatHelpText'
};

export const AllTheEvents = () => render({onBlur: action('onBlur'), onFocus: action('onFocus'), onFocusChange: action('onFocusChange'), onKeyDown: action('onKeyDown'), onKeyUp: action('onKeyUp'), onOpenChange: action('onOpenChange')});

AllTheEvents.story = {
  name: 'all the events'
};

export function render(props = {}) {
  return (
    <div>
      <Example
        label="Date range"
        onChange={action('change')}
        maxWidth="calc(100vw - 40px)"
        {...props} />
    </div>
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
  let [calendar, setCalendar] = React.useState<React.Key>(calendars[0].key);
  let {locale: defaultLocale} = useLocale();

  let pref = preferences.find(p => p.locale === locale);
  let preferredCalendars = React.useMemo(() => pref ? pref.ordering.split(' ').map(p => calendars.find(c => c.key === p)).filter(Boolean) : [calendars[0]], [pref]);
  let otherCalendars = React.useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p.key === c.key)), [preferredCalendars]);

  let updateLocale = locale => {
    setLocale(locale);
    let pref = preferences.find(p => p.locale === locale);
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
        <DateRangePicker {...props} />
      </Provider>
    </Flex>
  );
}

function ControlledExample(props) {
  let [value, setValue] = React.useState(null);

  return (
    <Flex direction="column" alignItems="center" gap="size-150">
      <DateRangePicker label="Controlled" {...props} granularity="minute" value={value} onChange={chain(setValue, action('onChange'))} />
      <ActionButton onPress={() => setValue({start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)})}>Change value</ActionButton>
      <ActionButton onPress={() => setValue(null)}>Clear</ActionButton>
    </Flex>
  );
}
