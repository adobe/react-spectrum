import React, {useEffect, useState} from 'react';
import {addons} from '@storybook/preview-api';
import {makeDecorator} from '@storybook/preview-api';
import {getQueryParams} from '@storybook/preview-api';
// Importing from src so that HMR works.
// Without this, all HMR updates will bubble through the index.ts and up 
// to the root instead of stopping at the story files.
import {Provider} from '@react-spectrum/s2/src/Provider';

document.body.style.margin = '0';

const providerValuesFromUrl = Object.entries(getQueryParams()).reduce((acc, [k, v]) => {
  if (k.includes('providerSwitcher-')) {
    return { ...acc, [k.replace('providerSwitcher-', '')]: v };
  }
  return acc;
}, {});

function ProviderUpdater(props) {
  let [localeValue, setLocale] = useState(providerValuesFromUrl.locale || undefined);

  useEffect(() => {
    let channel = addons.getChannel();
    let providerUpdate = (event) => {
      setLocale(event.locale);
    };

    channel.on('provider/updated', providerUpdate);
    channel.emit('rsp/ready-for-update');
    return () => {
      channel.removeListener('provider/updated', providerUpdate);
    };
  }, []);

  return (
    <Provider locale={localeValue}>
      {props.children}
    </Provider>
  );
}

export const withProviderSwitcher = makeDecorator({
  name: 'withProviderSwitcher',
  parameterName: 'providerSwitcher',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {...options, ...parameters};
    return (
      <ProviderUpdater options={options} context={context}>
        {getStory(context)}
      </ProviderUpdater>
    );
  }
});
