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


import {PropsWithChildren, ReactElement, ReactNode, useState} from 'react';
import {style} from '../style' with {type: 'macro'};
import { Key, useLocale } from 'react-aria';
import { Picker, PickerItem, Provider } from '../src';

type StaticColor = 'black' | 'white' | 'auto' | undefined;

function getBackgroundColor(staticColor: StaticColor) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}

export function StaticColorProvider(props: {children: ReactNode, staticColor?: StaticColor}) {
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

export const StaticColorDecorator = (Story: any, {args}: any) => (
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

const calendars = [
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
  let {locale} = useLocale();
  let [calendarLocale, setCalendarLocale] = useState<Key | null>(null);
  calendarLocale ??= calendars[0].id;
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Picker items={calendars} selectedKey={calendarLocale} onSelectionChange={setCalendarLocale}>
        {item => <PickerItem>{item.name}</PickerItem>}
      </Picker>
      <Provider locale={`${locale}-u-ca-${calendarLocale}`}>
        {props.children}
      </Provider>
    </div>
  );
}
