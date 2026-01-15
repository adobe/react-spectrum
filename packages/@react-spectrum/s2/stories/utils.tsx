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


import {Collection, Header, Heading, Picker, PickerItem, PickerSection, Provider} from '../src';
import {fn} from '@storybook/test';
import {Key, useLocale} from 'react-aria';
import {PropsWithChildren, ReactElement, ReactNode, useMemo, useState} from 'react';
import {style} from '../style' with {type: 'macro'};

type StaticColor = 'black' | 'white' | 'auto' | undefined;

function getBackgroundColor(staticColor: StaticColor) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}

export function StaticColorProvider(props: {children: ReactNode, staticColor?: StaticColor}): ReactElement {
  let [autoBg, setAutoBg] = useState('#5131c4');
  return (
    <>
      <div
        style={{
          padding: 8,
          // @ts-ignore
          '--s2-container-bg': props.staticColor === 'auto' ? autoBg : undefined,
          background: props.staticColor === 'auto' ? autoBg : getBackgroundColor(props.staticColor)
        }}>
        {props.children}
      </div>
      {props.staticColor === 'auto' && (
        <label
          className={style({
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 16,
            font: 'ui'
          })}>
          Background:
          <input
            type="color"
            value={autoBg}
            onChange={e => setAutoBg(e.target.value)} />
        </label>
      )}
    </>
  );
}

export const StaticColorDecorator = (Story: any, {args}: any): ReactElement => (
  <StaticColorProvider staticColor={args.staticColor}>
    <Story />
  </StaticColorProvider>
);

export function categorizeArgTypes(category: string, args: string[]): any {
  return args.reduce((acc: {[key: string]: any}, key) => {
    acc[key] = {table: {category}};
    return acc;
  }, {});
}

export function getActionArgs(args: string[]): any {
  return args.reduce((acc: {[key: string]: any}, key) => {
    acc[key] = fn();
    return acc;
  }, {});
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
type Calendar = {
  id: string,
  name: string
};
const calendars: Calendar[] = [
  {id: 'gregory', name: 'Gregorian'},
  {id: 'japanese', name: 'Japanese'},
  {id: 'buddhist', name: 'Buddhist'},
  {id: 'roc', name: 'Taiwan'},
  {id: 'persian', name: 'Persian'},
  {id: 'indian', name: 'Indian'},
  {id: 'islamic-umalqura', name: 'Islamic (Umm al-Qura)'},
  {id: 'islamic-civil', name: 'Islamic Civil'},
  {id: 'islamic-tbla', name: 'Islamic Tabular'},
  {id: 'hebrew', name: 'Hebrew'},
  {id: 'coptic', name: 'Coptic'},
  {id: 'ethiopic', name: 'Ethiopic'},
  {id: 'ethioaa', name: 'Ethiopic (Amete Alem)'}
];

export function CalendarSwitcher(props: PropsWithChildren): ReactElement {
  let [locale, setLocale] = useState('');
  let [calendar, setCalendar] = useState<Key | null>(calendars[0].id);
  let {locale: defaultLocale} = useLocale();

  let pref = preferences.find(p => p.locale === locale)!;
  let preferredCalendars: Calendar[] = useMemo(() => pref ? pref.ordering.split(' ').map(p => calendars.find(c => c.id === p)).filter(c => c !== undefined) : [calendars[0]], [pref]);
  let otherCalendars: Calendar[] = useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p!.id === c.id)), [preferredCalendars]);

  let updateLocale = locale => {
    setLocale(locale);
    let pref = preferences.find(p => p.locale === locale);
    if (pref) {
      setCalendar(pref.ordering.split(' ')[0]);
    }
  };
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'})}>
      <div className={style({display: 'flex', flexDirection: 'row', gap: 16})}>
        <Picker label="Locale" items={preferences} selectedKey={locale} onSelectionChange={updateLocale}>
          {item => <PickerItem id={item.locale}>{item.label}</PickerItem>}
        </Picker>
        <Picker label="Calendar" selectedKey={calendar} onSelectionChange={setCalendar}>
          <PickerSection>
            <Header>
              <Heading>Preferred</Heading>
            </Header>
            <Collection items={preferredCalendars}>
              {item => <PickerItem>{item!.name}</PickerItem>}
            </Collection>
          </PickerSection>
          <PickerSection>
            <Header>
              <Heading>Other</Heading>
            </Header>
            <Collection items={otherCalendars}>
              {item => <PickerItem>{item.name}</PickerItem>}
            </Collection>
          </PickerSection>
        </Picker>
      </div>
      <Provider locale={(locale || defaultLocale) + (calendar && calendar !== preferredCalendars[0].id ? '-u-ca-' + calendar : '')}>
        {props.children}
      </Provider>
    </div>
  );
}
