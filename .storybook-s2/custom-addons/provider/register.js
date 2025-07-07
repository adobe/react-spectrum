
import {addons, types} from '@storybook/manager-api';
import {locales} from '../../constants';
import React, {useEffect, useState} from 'react';

function ProviderFieldSetter({api}) {
  let localeParam = api.getQueryParam('providerSwitcher-locale') || undefined;
  let [values, setValues] = useState({locale: localeParam});
  let channel = addons.getChannel();
  let onLocaleChange = (e) => {
    let newValue = e.target.value || undefined;
    setValues((old) => {
      let next = {...old, locale: newValue};
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
      'providerSwitcher-locale': values.locale || ''
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
    </div>
  )
}

addons.register('ProviderSwitcher', (api) => {
  addons.add('ProviderSwitcher', {
    title: 'viewport',
    type: types.TOOL,
    match: ({ viewMode }) => {
      return viewMode === 'story' || viewMode === 'docs'
    },
    render: () => <ProviderFieldSetter api={api} />,
  });
});
