'use client';

import {Calendar, Picker, PickerItem, Provider, type Key} from '@react-spectrum/s2';
import React from 'react';
import {useLocale} from '@react-aria/i18n';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export default function CalendarSystems() {
  let [calendar, setCalendar] = React.useState<Key | null>('gregory');
  let {locale} = useLocale();
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

  return (
    <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8})}>
      <Picker label="Calendar system" items={calendars} value={calendar} onChange={setCalendar}>
        {item => <PickerItem>{item.name}</PickerItem>}
      </Picker>
      <Provider locale={`${locale}-u-ca-${calendar}`}>
        <Calendar aria-label="Date" />
      </Provider>
    </div>
  )
}