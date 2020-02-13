import React, {useEffect, useState} from 'react';
import addons, { makeDecorator } from '@storybook/addons';
import {getQueryParams} from '@storybook/client-api';
import {Provider} from '@react-spectrum/provider';
import {themes, defaultTheme} from '../../constants';
import {StatusLight} from '@react-spectrum/statuslight';

const providerValuesFromUrl = Object.entries(getQueryParams()).reduce((acc, [k, v]) => {
  if (k.includes('providerSwitcher-')) {
    return { ...acc, [k.replace('providerSwitcher-', '')]: v };
  }
  return acc;
}, {});

function ProviderUpdater(props) {
  let [localeValue, setLocale] = useState(providerValuesFromUrl.locale || undefined);
  let [themeValue, setTheme] = useState(providerValuesFromUrl.theme || undefined);
  let [scaleValue, setScale] = useState(providerValuesFromUrl.scale || undefined);
  let [toastPositionValue, setToastPosition] = useState(providerValuesFromUrl.toastPosition || 'top');
  let [storyReady, setStoryReady] = useState(window.parent === window); // reduce content flash because it takes a moment to get the provider details
  // Typically themes are provided with both light + dark, and both scales.
  // To build our selector to see all themes, we need to hack it a bit.
  let theme = themes[themeValue] || defaultTheme;
  let colorScheme = themeValue && themeValue.replace(/est$/, '');
  useEffect(() => {
    let channel = addons.getChannel();
    let providerUpdate = (event) => {
      setLocale(event.locale);
      setTheme(event.theme === 'Auto' ? undefined : event.theme);
      setScale(event.scale === 'Auto' ? undefined : event.scale);
      setToastPosition(event.toastPosition);
      setStoryReady(true);
    };

    channel.on('provider/updated', providerUpdate);
    channel.emit('rsp/ready-for-update');
    return () => {
      channel.removeListener('provider/updated', providerUpdate);
    };
  }, []);

  let statusMap = {
    'positive': "Released as rc",
    'notice': "In alpha",
    'negative': "Under construction"
  }

  return (
    <Provider theme={theme} colorScheme={colorScheme} scale={scaleValue} locale={localeValue} toastPlacement={toastPositionValue} typekitId="pbi5ojv">
      <div style={{'padding-top': '20px', 'padding-left': '20px', 'padding-right': '20px'}}><div style={{'font-size': '18px', 'padding-left': '10px', 'padding-right': '10px'}}><strong>Status</strong></div><StatusLight variant={props.options.status || 'negative'}>{statusMap[props.options.status || 'negative']}</StatusLight></div>
      {storyReady && props.children}
    </Provider>
  );
}

export const withProviderSwitcher = makeDecorator({
  name: 'withProviderSwitcher',
  parameterName: 'providerSwitcher',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {...options, ...parameters};
    return (
      <ProviderUpdater options={options}>
        {getStory(context)}
      </ProviderUpdater>
    );
  }
});
