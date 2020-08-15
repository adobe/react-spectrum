import React, {useEffect, useState} from 'react';
import {ActionButton} from '@react-spectrum/button';
import addons, { makeDecorator } from '@storybook/addons';
import {Content} from '@react-spectrum/view';
import {getQueryParams} from '@storybook/client-api';
import {Provider} from '@react-spectrum/provider';
import {Text} from '@react-spectrum/text';
import {themes, defaultTheme} from '../../constants';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';

document.body.style.margin = 0;

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
  let [toastPositionValue, setToastPosition] = useState(providerValuesFromUrl.toastPosition || 'bottom');
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

  return (
    <Provider theme={theme} colorScheme={colorScheme} scale={scaleValue} locale={localeValue} toastPlacement={toastPositionValue}>
      <div style={{position: 'absolute', paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px'}}>
        {props.context.parameters.note && (<DialogTrigger type="popover">
          <ActionButton isQuiet>Note</ActionButton>
          <Dialog>
            <Content><Text>{props.context.parameters.note}</Text></Content>
          </Dialog>
        </DialogTrigger>)}
      </div>
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
      <ProviderUpdater options={options} context={context}>
        {getStory(context)}
      </ProviderUpdater>
    );
  }
});
