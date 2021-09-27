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
import {Calendar} from '../';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, parseZonedDateTime, today, ZonedDateTime} from '@internationalized/date';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker, Section} from '@react-spectrum/picker';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {TimeField} from '@react-spectrum/datepicker';
import {useLocale} from '@react-aria/i18n';

storiesOf('Date and Time/Calendar', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: new CalendarDate(2019, 6, 5)})
  )
  .add(
    'controlled value',
    () => render({value: new CalendarDate(2019, 5, 5)})
  )
  .add(
    'with time',
    () => <CalendarWithTime />
  )
  .add(
    'with zoned time',
    () => <CalendarWithZonedTime />
  )
  .add(
    'minValue: today, maxValue: 1 week from now',
    () => render({minValue: today(getLocalTimeZone()), maxValue: today(getLocalTimeZone()).add({weeks: 1})})
  )
  .add(
    'defaultValue + minValue + maxValue',
    () => render({defaultValue: new CalendarDate(2019, 6, 10), minValue: new CalendarDate(2019, 6, 5), maxValue: new CalendarDate(2019, 6, 20)})
  )
  .add(
    'isDisabled',
    () => render({defaultValue: new CalendarDate(2019, 6, 5), isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({defaultValue: new CalendarDate(2019, 6, 5), isReadOnly: true})
  )
  .add(
    'autoFocus',
    () => render({defaultValue: new CalendarDate(2019, 6, 5), autoFocus: true})
  )
  .add(
    'visibleMonths: 2',
    () => render({visibleMonths: 2})
  )
  .add(
    'visibleMonths: 3',
    () => render({visibleMonths: 3})
  )
  .add(
    'minValue: today, visibleMonths: 3',
    () => render({minValue: today(getLocalTimeZone()), visibleMonths: 3})
  )
  .add(
    'minValue, visibleMonths: 3, defaultValue',
    () => render({minValue: new CalendarDate(2019, 6, 1), defaultValue: new CalendarDate(2019, 6, 5), visibleMonths: 3})
  );

function render(props = {}) {
  return <Example onChange={action('change')} {...props} />;
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
      <Flex direction="column" gap="size-150" wrap>
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
        <Calendar {...props} />
      </Provider>
    </Flex>
  );
}

function CalendarWithTime() {
  let [value, setValue] = useState(new CalendarDateTime(2019, 6, 5, 8));
  let onChange = (v: CalendarDateTime) => {
    setValue(v);
    action('onChange')(v);
  };

  return (
    <Flex direction="column">
      <Calendar value={value} onChange={onChange} />
      <TimeField label="Time" value={value} onChange={onChange} />
    </Flex>
  );
}

function CalendarWithZonedTime() {
  let [value, setValue] = useState(parseZonedDateTime('2021-03-14T00:45-08:00[America/Los_Angeles]'));
  let onChange = (v: ZonedDateTime) => {
    setValue(v);
    action('onChange')(v);
  };

  return (
    <Flex direction="column">
      <Calendar value={value} onChange={onChange} />
      <TimeField label="Time" value={value} onChange={onChange} />
    </Flex>
  );
}
