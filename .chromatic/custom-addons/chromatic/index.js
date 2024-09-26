import {expressThemes, locales, S2Backgrounds, S2ColorThemes, scales, themes} from '../../constants';
import {makeDecorator} from '@storybook/preview-api';
import {Provider, View} from '@adobe/react-spectrum';
import {Provider as S2Provider} from '@react-spectrum/s2';
import React, {useEffect} from 'react';
// TODO: can't seem to use the style macro here...
// import {style} from '../../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import './disableAnimations.css';

export const withChromaticProvider = makeDecorator({
  name: 'withChromaticProvider',
  parameterName: 'chromaticProvider',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {...options, ...parameters};
    let selectedLocales
    if (options.locales && options.locales.length) {
      selectedLocales = options.locales;
    } else {
      selectedLocales = options.locales ? locales.map(l => l.value).slice(1) : ['en-US', 'ar-AE'];
    }

    let height;
    let minHeight;
    if(isNaN(options.height)) {
      minHeight = 1000;
    } else {
      height = options.height;
    }

    if (context.title.includes('S2')) {
      return <RenderS2 getStory={getStory} context={context} options={options} selectedLocales={selectedLocales} height={height} minHeight={minHeight} />
    } else {
      return <RenderV3 getStory={getStory} context={context} options={options} selectedLocales={selectedLocales} height={height} minHeight={minHeight} />
    }
  }
});

function RenderS2({getStory, context, options, selectedLocales, height, minHeight}) {
  let colorSchemes = options.colorSchemes || S2ColorThemes;
  let backgrounds = options.backgrounds || ['base'];

  // TODO: there is perhaps some things that can still be shared between the two renders but figured it be easiest to just split them out for the most part
  return (
    <DisableAnimations disableAnimations={options.disableAnimations}>
      <div style={{display: 'flex', flexDirection: 'column', height, minHeight, width: '90vw'}}>
        {colorSchemes.map(colorScheme =>
          backgrounds.map(background =>
            (colorScheme === 'light' || context.title.includes('RTL') ? selectedLocales : ['en-US']).map(locale =>
              <S2Provider key={`${colorScheme}_${background}_${locale}`} background={background} colorScheme={colorScheme} locale={locale}>
                <div style={{margin: '8px'}}>
                  <h1 style={{margin: 0, padding: 0, color: colorScheme === 'dark' ? 'white' : 'black'}}>{`${colorScheme}, ${background}, ${locale}`}</h1>
                  {getStory(context)}
                </div>
              </S2Provider>
            )
          )
        )}
      </div>
    </DisableAnimations>
  )
}

function RenderV3({getStory, context, options, selectedLocales, height, minHeight}) {
  let colorSchemes = options.express ? [] : (options.colorSchemes || Object.keys(themes));
  let scalesToRender = options.scales || Object.keys(scales);

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
