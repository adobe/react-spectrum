import addons, { types } from '@storybook/addons';
import React, {useEffect, useState} from 'react';

let LOCALES = [
  {label: 'Arabic (Egypt)', value: 'ar-EG'},
  {label: 'Czech (Czech Republic)', value: 'cs-CZ'},
  {label: 'Danish (Denmark)', value: 'da-DK'},
  {label: 'German (Germany)', value: 'de-DE'},
  {label: 'English (United States)', value: 'en-US'},
  {label: 'Spanish (Spain)', value: 'es-ES'},
  {label: 'Finnish (Finland)', value: 'fi-FI'},
  {label: 'French (France)', value: 'fr-FR'},
  {label: 'Italian (Italy)', value: 'it-IT'},
  {label: 'Japanese (Japan)', value: 'ja-JP'},
  {label: 'Korean (Korea)', value: 'ko-KR'},
  {label: 'Norwegian (Bokmal) (Norway)', value: 'nb-NO'},
  {label: 'Dutch (Netherlands)', value: 'nl-NL'},
  {label: 'Polish (Poland)', value: 'pl-PL'},
  {label: 'Portuguese (Brazil)', value: 'pt-BR'},
  {label: 'Russian (Russia)', value: 'ru-RU'},
  {label: 'Swedish (Sweden)', value: 'sv-SE'},
  {label: 'Turkish (Turkey)', value: 'tr-TR'},
  {label: 'Chinese (S)', value: 'zh-CN'},
  {label: 'Chinese (T)', value: 'zh-TW'}
];

let THEMES = [
  {label: 'Auto', value: undefined},
  {label: "Light", value: "light"},
  {label: "Lightest", value: "lightest"},
  {label: "Dark", value: "dark"},
  {label: "Darkest", value: "darkest"}
];

let SCALES = [
  {label: 'Auto', value: undefined},
  {label: "Medium", value: "medium"},
  {label: "Large", value: "large"}
];

let TOAST_POSITIONS = [
  {label: 'top', value: 'top'},
  {label: 'top left', value: 'top left'},
  {label: 'top center', value: 'top center'},
  {label: 'top right', value: 'top right'},
  {label: 'bottom', value: 'bottom'},
  {label: 'bottom left', value: 'bottom left'},
  {label: 'bottom center', value: 'bottom center'},
  {label: 'bottom right', value: 'bottom right'}
];

function ProviderFieldSetter() {
  let [values, setValues] = useState({locale:'en-US', theme: undefined, scale: undefined, toastPosition: 'top'});
  let channel = addons.getChannel();
  let onLocaleChange = (e) => {
    let newValue = e.target.value;
    setValues((old) => {
      let next = {...old, locale: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onThemeChange = (e) => {
    let newValue = e.target.value;
    setValues((old) => {
      let next = {...old, theme: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onScaleChange = (e) => {
    let newValue = e.target.value;
    setValues((old) => {
      let next = {...old, scale: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onToastPositionChange = (e) => {
    let newValue = e.target.value;
    setValues((old) => {
      let next = {...old, toastPosition: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  useEffect(() => {
    let storySwapped = () => {
      channel.emit('provider/updated', values);
    };
    channel.on('rsp/ready-for-update', storySwapped);
    return () => {
      channel.removeListener('rsp/ready-for-update', storySwapped);
    };
  });

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="locale">Locale: </label>
        <select id="locale" name="locale" onChange={onLocaleChange} value={values.locale}>
          {LOCALES.map(locale => <option key={locale} value={locale.value}>{locale.label}</option>)}
        </select>
      </div>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="theme">Theme: </label>
        <select id="theme" name="theme" onChange={onThemeChange} value={values.theme}>
          {THEMES.map(theme => <option key={theme.label} value={theme.value}>{theme.label}</option>)}
        </select>
      </div>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="scale">Scale: </label>
        <select id="scale" name="scale" onChange={onScaleChange} value={values.scale}>
          {SCALES.map(scale => <option key={scale.label} value={scale.value}>{scale.label}</option>)}
        </select>
      </div>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="toastposition">Toast Position: </label>
        <select id="toastposition" name="toastposition" onChange={onToastPositionChange} value={values.toastPosition}>
          {TOAST_POSITIONS.map(position => <option key={position.label} value={position.value}>{position.label}</option>)}
        </select>
      </div>
    </div>
  )
}

addons.register('ProviderSwitcher', () => {
  addons.add('ProviderSwitcher', {
    title: 'viewport',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <ProviderFieldSetter />,
  });
});
