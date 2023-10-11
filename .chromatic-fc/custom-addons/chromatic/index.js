import {expressThemes, locales, scales, themes} from '../../constants';
import {makeDecorator} from '@storybook/addons';
import {Provider, View} from '@adobe/react-spectrum';
import React, {useEffect} from 'react';
import './disableAnimations.css';

export const withChromaticProvider = makeDecorator({
  name: 'withChromaticProvider',
  parameterName: 'chromaticProvider',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {express: false, ...options, ...parameters};
    let selectedLocales
    if (options.locales && options.locales.length) {
      selectedLocales = options.locales;
    } else {
      selectedLocales = options.locales ? locales.map(l => l.value).slice(1) : ['en-US'];
    }
    let colorSchemes = options.express ? [] : (options.colorSchemes || ['light']);
    let scalesToRender = options.scales || ['medium'];
    let height;
    let minHeight;
    if(isNaN(options.height)) {
      minHeight = 1000;
    } else {
      height = options.height;
    }

    let expressTheme = colorSchemes.length === 1 ? expressThemes[colorSchemes[0]] : expressThemes.light;
    let expressColorScheme = colorSchemes.length === 1 ? colorSchemes[0].replace(/est$/, '') : 'light';
    let expressScale = scalesToRender.length === 1 ? scalesToRender[0] : 'medium';
    let expressLocale = selectedLocales.length === 1 ? selectedLocales[0] : 'en-US';

    // do not add a top level provider, each provider variant needs to be independent so that we don't have RTL/LTR styles that interfere with each other
    return (
      <DisableAnimations disableAnimations={options.disableAnimations}>
        <div style={{display: 'flex', flexDirection: 'column', height, minHeight}}>
            {colorSchemes.map(colorScheme =>
              scalesToRender.map(scale =>
                (colorScheme === 'light' ? selectedLocales : ['en-US']).map(locale =>
                  <Provider key={`${colorScheme}_${scale}_${locale}`} theme={themes[colorScheme]} colorScheme={colorScheme.replace(/est$/, '')} scale={scale} locale={locale} typekitId="pbi5ojv">
                    <View margin="size-100">
                      <h1 style={{margin: 0, padding: 0}}>{`${colorScheme}, ${scale}, ${locale}`}</h1>
                      {getStory(context)}
                    </View>
                  </Provider>
                )
              )
            )}
            {options.express !== false &&
              <Provider key="express" theme={expressTheme} colorScheme={expressColorScheme} scale={expressScale} locale={expressLocale} typekitId="pbi5ojv">
                <View margin="size-100">
                  <h1 style={{margin: 0, padding: 0}}>express, {expressColorScheme}, {expressScale}, {expressLocale}</h1>
                  {getStory(context)}
                </View>
              </Provider>
            }
        </div>
      </DisableAnimations>
    )
  }
});

function DisableAnimations({children, disableAnimations}) {
  useEffect(() => {
    if (disableAnimations) {
      document.body.classList.add('disableAnimations');
    } else {
      document.body.classList.remove('disableAnimations');
    }
  }, [disableAnimations]);
  return children;
}
