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
import {CalendarDate, parseDate, toZoned} from '@internationalized/date';
import {chain} from '@react-aria/utils';
import {DateRangePicker} from '../';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker, Section} from '@react-spectrum/picker';
import {Provider} from '@adobe/react-spectrum';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {useLocale} from '@react-aria/i18n';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf('Date and Time/DateRangePicker', module)
  .addDecorator(BlockDecorator)
  .add(
    'default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'controlled value',
    () => <ControlledExample />
  )
  .add(
    'defaultValue, zoned',
    () => render({defaultValue: {start: toZoned(parseDate('2020-02-03'), 'America/New_York'), end: toZoned(parseDate('2020-02-05'), 'America/Los_Angeles')}})
  )
  .add(
    'granularity: minute',
    () => render({granularity: 'minute'})
  )
  .add(
    'granularity: second',
    () => render({granularity: 'second'})
  )
  .add(
    'hourCycle: 12',
    () => render({granularity: 'minute', hourCycle: 12})
  )
  .add(
    'hourCycle: 24',
    () => render({granularity: 'minute', hourCycle: 24})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'minDate: 2010/1/1, maxDate: 2020/1/1',
    () => render({minValue: new CalendarDate(2010, 1, 1), maxValue: new CalendarDate(2020, 1, 1)})
  )
  .add(
    'placeholderValue: 1980/1/1',
    () => render({placeholderValue: new CalendarDate(1980, 1, 1)})
  )
  .add(
    'maxVisibleMonths: 2',
    () => render({maxVisibleMonths: 2, granularity: 'minute'})
  )
  .add(
    'maxVisibleMonths: 3',
    () => render({maxVisibleMonths: 3, granularity: 'minute'})
  )
  .add(
    'showFormatHelpText',
    () => render({showFormatHelpText: true})
  );

storiesOf('Date and Time/DateRangePicker/styling', module)
  .addDecorator(BlockDecorator)
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({labelPosition: 'top', labelAlign: 'end'})
  )
  .add(
    'required',
    () => render({isRequired: true})
  )
  .add(
    'required with label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'optional',
    () => render({necessityIndicator: 'label'})
  )
  .add(
    'no visible label',
    () => render({'aria-label': 'Date range', label: null})
  )
  .add(
    'quiet no visible label',
    () => render({isQuiet: true, 'aria-label': 'Date range', label: null})
  )
  .add(
    'custom width',
    () => render({width: 'size-4600'})
  )
  .add(
    'quiet custom width',
    () => render({isQuiet: true, width: 'size-4600'})
  )
  .add(
    'custom width no visible label',
    () => render({width: 'size-4600', label: null, 'aria-label': 'Date range'})
  )
  .add(
    'custom width, labelPosition=side',
    () => render({width: 'size-4600', labelPosition: 'side'})
  )
  .add(
    'description',
    () => render({description: 'Help text'})
  )
  .add(
    'errorMessage',
    () => render({errorMessage: 'Dates must be after today', validationState: 'invalid'})
  );

function render(props = {}) {
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
      <DateRangePicker label="Controlled" {...props} value={value} onChange={chain(setValue, action('onChange'))} />
      <ActionButton onPress={() => setValue({start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)})}>Change value</ActionButton>
      <ActionButton onPress={() => setValue(null)}>Clear</ActionButton>
    </Flex>
  );
}
