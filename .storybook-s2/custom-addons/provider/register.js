
import {addons, types} from '@storybook/manager-api';
import {getQueryParams} from '@storybook/preview-api';
import {locales} from '../../constants';
import React, {useEffect, useState} from 'react';

const providerValuesFromUrl = Object.entries(getQueryParams()).reduce((acc, [k, v]) => {
  if (k.includes('providerSwitcher-')) {
    return { ...acc, [k.replace('providerSwitcher-', '')]: v };
  }
  return acc;
}, {});

function ProviderFieldSetter({api}) {
  let [values, setValues] = useState({locale: providerValuesFromUrl.locale || undefined});
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
