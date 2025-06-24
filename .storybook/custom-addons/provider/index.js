import React, {useEffect, useState} from 'react';
import {addons} from '@storybook/preview-api';
import {makeDecorator} from '@storybook/preview-api';
import {Provider} from '@react-spectrum/provider';
import {expressThemes, themes, defaultTheme} from '../../constants';

document.body.style.margin = '0';

function ProviderUpdater(props) {
  let params = new URLSearchParams(document.location.search);
  let localeParam = params.get("providerSwitcher-locale") || undefined;
  let [localeValue, setLocale] = useState(localeParam);
  let themeParam = params.get("providerSwitcher-theme") || undefined;
  let [themeValue, setTheme] = useState(themeParam);
  let scaleParam = params.get("providerSwitcher-scale") || undefined;
  let [scaleValue, setScale] = useState(scaleParam);
  let expressParam = params.get("providerSwitcher-express") || undefined;
  let [expressValue, setExpress] = useState(expressParam === 'true');
  let [storyReady, setStoryReady] = useState(window.parent === window || window.parent !== window.top); // reduce content flash because it takes a moment to get the provider details
  // Typically themes are provided with both light + dark, and both scales.
  // To build our selector to see all themes, we need to hack it a bit.
  let theme = (expressValue ? expressThemes : themes)[themeValue || 'light'] || defaultTheme;
  let colorScheme = themeValue && themeValue.replace(/est$/, '');
  useEffect(() => {
    let channel = addons.getChannel();
    let providerUpdate = (event) => {
      setLocale(event.locale);
      setTheme(event.theme === 'Auto' ? undefined : event.theme);
      setScale(event.scale === 'Auto' ? undefined : event.scale);
      setExpress(event.express);
      setStoryReady(true);
    };

    channel.on('provider/updated', providerUpdate);
    channel.emit('rsp/ready-for-update');
    return () => {
      channel.removeListener('provider/updated', providerUpdate);
    };
  }, []);

  if (props.options.mainElement == null) {
    return (
      <Provider theme={theme} colorScheme={colorScheme} scale={scaleValue} locale={localeValue}>
        <main>
          {storyReady && props.children}
        </main>
      </Provider>
    );
  } else {
    return (
      <Provider theme={theme} colorScheme={colorScheme} scale={scaleValue} locale={localeValue}>
        {storyReady && props.children}
      </Provider>
    );
  }
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
