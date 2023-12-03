import React from 'react';
import {Select, SelectItem, SelectSection} from '../../../../../../starters/tailwind/src/Select';
import {Calendar} from '../../../../../../starters/tailwind/src/Calendar';
import {NumberField} from '../../../../../../starters/tailwind/src/NumberField';
import {I18nProvider, useLocale} from 'react-aria-components';

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

export function I18n() {
  let [locale, setLocale] = React.useState('');
  let [calendar, setCalendar] = React.useState<Key>(calendars[0].key);
  let {locale: defaultLocale} = useLocale();
  let [numberingSystem, setNumberingSystem] = React.useState(() => new Intl.NumberFormat(defaultLocale).resolvedOptions().numberingSystem);

  let pref = preferences.find(p => p.locale === locale);
  let preferredCalendars = React.useMemo(() => pref ? pref.ordering.split(' ').map(p => calendars.find(c => c.key === p)).filter(Boolean) : [calendars[0]], [pref]);
  let otherCalendars = React.useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p.key === c.key)), [preferredCalendars]);

  let updateLocale = locale => {
    setLocale(locale);
    let pref = preferences.find(p => p.locale === locale);
    setCalendar(pref.ordering.split(' ')[0]);
    setNumberingSystem(new Intl.NumberFormat(locale || defaultLocale).resolvedOptions().numberingSystem)
  };

  let updateCalendar = calendar => {
    setCalendar(calendar);
    let selectedLocale = new Intl.Locale(locale || defaultLocale, {
      calendar: calendar && calendar !== preferredCalendars[0].key ? calendar : undefined
    });
    setNumberingSystem(new Intl.NumberFormat(selectedLocale).resolvedOptions().numberingSystem);
  };

  let selectedLocale = new Intl.Locale(locale || defaultLocale, {
    calendar: calendar && calendar !== preferredCalendars[0].key ? calendar : undefined,
    numberingSystem
  });

  let [style, setStyle] = React.useState('decimal');
  let [currency, setCurrency] = React.useState('USD');
  let [unit, setUnit] = React.useState('inch');

  return (
    <div className="flex items-start gap-6 mt-10">
      <div className="flex flex-col flex-wrap gap-4">
        <Select label="Locale" items={preferences} selectedKey={locale} onSelectionChange={updateLocale}>
          {item => <SelectItem id={item.locale}>{item.label}</SelectItem>}
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
      </div>
      <I18nProvider locale={selectedLocale.toString()}>
        <LangWrapper>
          <Calendar />
          <NumberField label="Number" defaultValue={1234} minValue={0} formatOptions={{style, currency, unit}} />
        </LangWrapper>
      </I18nProvider>
      <Select label="Style" selectedKey={style} onSelectionChange={setStyle}>
        <SelectItem id="decimal">Decimal</SelectItem>
        <SelectItem id="percent">Percent</SelectItem>
        <SelectItem id="currency">Currency</SelectItem>
        <SelectItem id="unit">Unit</SelectItem>
      </Select>
    </div>
  );
}

function LangWrapper({children}) {
  let {locale, direction} = useLocale();
  return <div lang={locale} dir={direction} className="contents">{children}</div>;
}
