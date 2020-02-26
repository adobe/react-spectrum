import React, {useEffect, useState} from 'react';
import addons, { makeDecorator } from '@storybook/addons';
import {getQueryParams} from '@storybook/client-api';
import {Provider} from '@react-spectrum/provider';
import {themes, scales, locales} from '../../constants';

export const withChromaticProvider = makeDecorator({
  name: 'withChromaticProvider',
  parameterName: 'chromaticProvider',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {...options, ...parameters};
    let selectedLocales = options.locales ? locales.map(l => l.value).slice(1) : ['en-US'];
    let height = options.height;

    return (
      <div style={{height}}>
        {(options.colorSchemes || Object.keys(themes)).map(colorScheme =>
          (options.scales || Object.keys(scales)).map(scale =>
            (colorScheme === 'light' ? selectedLocales : ['en-US']).map(locale =>
              <Provider key={`${colorScheme}_${scale}_${locale}`} theme={themes[colorScheme]} colorScheme={colorScheme.replace(/est$/, '')} scale={scale} locale={locale} typekitId="pbi5ojv">
                <h1 style={{margin: 0, padding: '10px'}}>{`${colorScheme}, ${scale}, ${locale}`}</h1>
                {getStory(context)}
              </Provider>
            )
          )
        )}
      </div>
    )
  }
});
