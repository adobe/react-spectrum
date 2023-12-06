import {Calendar} from '../../../../../../starters/tailwind/src/Calendar';
import {DateField} from '../../../../../../starters/tailwind/src/DateField';
import {getLocalTimeZone, now} from '@internationalized/date';
import {I18nProvider, Key, useLocale} from 'react-aria-components';
import {NumberField} from '../../../../../../starters/tailwind/src/NumberField';
import React from 'react';
import {Select, SelectItem, SelectSection} from '../../../../../../starters/tailwind/src/Select';

// https://github.com/unicode-org/cldr/blob/22af90ae3bb04263f651323ce3d9a71747a75ffb/common/supplemental/supplementalData.xml#L4649-L4664
const preferences = [
  // Tier 1
  {value: 'fr-FR'},
  {value: 'fr-CA'},
  {value: 'de-DE'},
  {value: 'en-GB'},
  {value: 'en-US'},
  {value: 'ja-JP', ordering: 'gregory japanese'},
  // // Tier 2
  {value: 'da-DK'},
  {value: 'nl-NL'},
  {value: 'fi-FI'},
  {value: 'it-IT'},
  {value: 'nb-NO'},
  {value: 'es-ES'},
  {value: 'sv-SE'},
  {value: 'pt-BR'},
  // // Tier 3
  {value: 'zh-CN'},
  {value: 'zh-TW', ordering: 'gregory roc chinese'},
  {value: 'ko-KR'},
  // // Tier 4
  {value: 'bg-BG'},
  {value: 'hr-HR'},
  {value: 'cs-CZ'},
  {value: 'et-EE'},
  {value: 'hu-HU'},
  {value: 'lv-LV'},
  {value: 'lt-LT'},
  {value: 'pl-PL'},
  {value: 'ro-RO'},
  {value: 'ru-RU'},
  {value: 'sr-SP'},
  {value: 'sk-SK'},
  {value: 'sl-SI'},
  {value: 'tr-TR'},
  {value: 'uk-UA'},
  // // Tier 5
  {value: 'ar-AE', ordering: 'gregory islamic-umalqura islamic islamic-civil islamic-tbla'},
  {value: 'ar-DZ', ordering: 'gregory islamic islamic-civil islamic-tbla'},
  {value: 'AR-EG', ordering: 'gregory coptic islamic islamic-civil islamic-tbla'},
  {value: 'ar-SA', ordering: 'islamic-umalqura gregory islamic islamic-rgsa'},
  {value: 'el-GR'},
  {value: 'he-IL', ordering: 'gregory hebrew islamic islamic-civil islamic-tbla'},

  {value: 'fa-AF', ordering: 'persian gregory islamic islamic-civil islamic-tbla'},
  // {territories: 'CN CX HK MO SG', ordering: 'gregory chinese'},
  {value: 'am-ET', ordering: 'gregory ethiopic ethioaa'},
  {value: 'hi-IN', ordering: 'gregory indian'},
  // {territories: 'KR', ordering: 'gregory dangi'},
  {value: 'th-TH', ordering: 'buddhist gregory'},
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

export function I18n() {
  let {locale: defaultLocale} = useLocale();
  let [locale, setLocale] = React.useState(defaultLocale);
  let [calendar, setCalendar] = React.useState(calendars[0].key);
  let [numberingSystem, setNumberingSystem] = React.useState<any>(() => new Intl.NumberFormat(defaultLocale).resolvedOptions().numberingSystem);

  let langDisplay = React.useMemo(() => new Intl.DisplayNames(defaultLocale, {type: 'language'}), [defaultLocale]);
  let regionDisplay = React.useMemo(() => new Intl.DisplayNames(defaultLocale, {type: 'region'}), [defaultLocale]);
  let locales = React.useMemo(() => {
    return preferences.map(item => {
      let locale = new Intl.Locale(item.value);
      return {
        ...item,
        label: `${langDisplay.of(locale.language)} (${regionDisplay.of(locale.region)})`
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [langDisplay, regionDisplay]);

  let pref = preferences.find(p => p.value === locale);
  let preferredCalendars = React.useMemo(() => pref ? (pref.ordering || 'gregory').split(' ').map(p => calendars.find(c => c.key === p)).filter(Boolean) : [calendars[0]], [pref]);
  let otherCalendars = React.useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p.key === c.key)), [preferredCalendars]);

  let updateLocale = locale => {
    setLocale(locale);
    let pref = preferences.find(p => p.value === locale);
    setCalendar((pref.ordering || 'gregory').split(' ')[0]);
    setNumberingSystem(new Intl.NumberFormat(locale || defaultLocale).resolvedOptions().numberingSystem)
  };

  let updateCalendar = calendar => {
    setCalendar(calendar);
    let selectedLocale = new Intl.Locale(locale || defaultLocale, {
      calendar: calendar && calendar !== preferredCalendars[0].key ? calendar : undefined
    });
    setNumberingSystem(new Intl.NumberFormat(selectedLocale.toString()).resolvedOptions().numberingSystem);
  };

  let selectedLocale = new Intl.Locale(locale || defaultLocale, {
    calendar: calendar && calendar !== preferredCalendars[0].key ? calendar : undefined,
    numberingSystem
  });

  let [style, setStyle] = React.useState<Key>('decimal');
  let [currency, setCurrency] = React.useState('USD');
  let [unit, setUnit] = React.useState('inch');
  if (numberingSystem === 'arabext') {
    numberingSystem = 'arab';
  }

  let [date, setDate] = React.useState(() => now(getLocalTimeZone()));

  return (
    <div className="grid items-center justify-items-center py-10 px-0 md:p-10 lg:p-0 gap-10 lg:gap-0 lg:grid-cols-[auto_1fr_1fr] mt-10 card-shadow rounded-xl overflow-hidden">
      <div className="grid md:grid-cols-2 lg:grid-cols-1 flex-col gap-4 lg:p-10 lg:mr-10 lg:border-r">
        <Select label="Locale" items={locales} selectedKey={locale} onSelectionChange={updateLocale}>
          {item => <SelectItem id={item.value}>{item.label}</SelectItem>}
        </Select>
        <Select label="Calendar" selectedKey={calendar} onSelectionChange={updateCalendar}>
          <SelectSection title="Preferred" items={preferredCalendars}>
            {item => <SelectItem>{item.name}</SelectItem>}
          </SelectSection>
          <SelectSection title="Other" items={otherCalendars}>
            {item => <SelectItem>{item.name}</SelectItem>}
          </SelectSection>
        </Select>
        <Select label="Numbering System" selectedKey={numberingSystem} onSelectionChange={setNumberingSystem}>
          <SelectItem id="latn">Latin</SelectItem>
          <SelectItem id="arab">Arabic</SelectItem>
          <SelectItem id="hanidec">Hanidec</SelectItem>
        </Select>
        <Select label="Number Format" selectedKey={style} onSelectionChange={setStyle}>
          <SelectItem id="decimal">Decimal</SelectItem>
          <SelectItem id="percent">Percent</SelectItem>
          <SelectItem id="currency">Currency</SelectItem>
          <SelectItem id="unit">Unit</SelectItem>
        </Select>
      </div>
      <I18nProvider locale={selectedLocale.toString()}>
        <LangWrapper>
          <Calendar value={date} onChange={setDate} />
          <div className="flex flex-col gap-10">
            <NumberField label="Number" defaultValue={1234} minValue={0} formatOptions={{style, currency, unit}} />
            <DateField label="Date and Time" value={date} onChange={setDate} />
          </div>
        </LangWrapper>
      </I18nProvider>
    </div>
  );
}

function LangWrapper({children}) {
  let {locale, direction} = useLocale();
  return <div lang={locale} dir={direction} className="contents">{children}</div>;
}
