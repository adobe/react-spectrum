import {addons, types} from '@storybook/manager-api';
import {locales} from '../../constants';
import React, {useEffect, useState} from 'react';


let THEMES = [
  {label: 'Auto', value: ''},
  {label: "Light", value: "light"},
  {label: "Lightest", value: "lightest"},
  {label: "Dark", value: "dark"},
  {label: "Darkest", value: "darkest"}
];

let SCALES = [
  {label: 'Auto', value: ''},
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

function ProviderFieldSetter({api}) {
  let localeParam = api.getQueryParam('providerSwitcher-locale') || undefined;
  let themeParam = api.getQueryParam('providerSwitcher-theme') || undefined;
  let scaleParam = api.getQueryParam('providerSwitcher-scale') || undefined;
  let expressParam = api.getQueryParam('providerSwitcher-express') || undefined;

  let [values, setValues] = useState({
    locale: localeParam,
    theme: themeParam,
    scale: scaleParam,
    express: expressParam === 'true'
  });
  let channel = addons.getChannel();
  let onLocaleChange = (e) => {
    let newValue = e.target.value || undefined;
    setValues((old) => {
      let next = {...old, locale: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onThemeChange = (e) => {
    let newValue = e.target.value || undefined;
    setValues((old) => {
      let next = {...old, theme: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onScaleChange = (e) => {
    let newValue = e.target.value || undefined;
    setValues((old) => {
      let next = {...old, scale: newValue};
      channel.emit('provider/updated', next);
      return next;
    });
  };
  let onExpressChange = (e) => {
    let newValue = e.target.checked;
    setValues((old) => {
      let next = {...old, express: newValue};
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

  useEffect(() => {
    api.setQueryParams({
      'providerSwitcher-locale': values.locale || '',
      'providerSwitcher-theme': values.theme || '',
      'providerSwitcher-scale': values.scale || '',
      'providerSwitcher-express': String(values.express),
    });
  });

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="locale">Locale: </label>
        <select id="locale" name="locale" onChange={onLocaleChange} value={values.locale}>
          {locales.map(locale => <option key={locale.label} value={locale.value}>{locale.label}</option>)}
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
        <label htmlFor="express">Express: </label>
        <input type="checkbox" id="express" name="express" onChange={onExpressChange} checked={values.express} />
      </div>
    </div>
  )
}

addons.register('ProviderSwitcher', (api) => {
  addons.add('ProviderSwitcher', {
    title: 'viewport',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <ProviderFieldSetter api={api} />,
  });
});
