import React, {useEffect, useState} from 'react';
import addons, { makeDecorator } from '@storybook/addons';
import {Provider} from '@react-spectrum/provider';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import themeLightest from '@adobe/spectrum-css-temp/vars/spectrum-lightest-unique.css';
import themeDark from '@adobe/spectrum-css-temp/vars/spectrum-dark-unique.css';
import themeDarkest from '@adobe/spectrum-css-temp/vars/spectrum-darkest-unique.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large-unique.css';

const THEME = {
  light: themeLight,
  lightest: themeLightest,
  dark: themeDark,
  darkest: themeDarkest
};

const SCALE = {
  medium: scaleMedium,
  large: scaleLarge
};

let defaultTheme = {
  light: THEME.light,
  dark: THEME.dark,
  medium: SCALE.medium,
  large: SCALE.large
};

let altTheme = {
  light: THEME.lightest,
  dark: THEME.darkest,
  medium: SCALE.medium,
  large: SCALE.large
};

let themes = {
  light: defaultTheme,
  dark: defaultTheme,
  lightest: altTheme,
  darkest: altTheme
};

function ProviderUpdater(props) {
  let [localeValue, setLocale] = useState('en-US');
  let [themeValue, setTheme] = useState(undefined);
  let [scaleValue, setScale] = useState(undefined);
  let [toastPositionValue, setToastPosition] = useState('top');
  let [storyReady, setStoryReady] = useState(false); // reduce content flash because it takes a moment to get the provider details
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
      {storyReady && props.children}
    </Provider>
  );
}

export const withProviderSwitcher = makeDecorator({
  name: 'withProviderSwitcher',
  parameterName: 'providerSwitcher',
  wrapper: (getStory, context) => {
    return (
      <ProviderUpdater>
        {getStory(context)}
      </ProviderUpdater>
    );
  }
});
