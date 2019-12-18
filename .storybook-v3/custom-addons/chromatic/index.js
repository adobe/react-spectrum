import React from 'react';
import { makeDecorator } from '@storybook/addons';
import {Provider} from '@react-spectrum/provider';
import Heading from '@react/react-spectrum/Heading';
import {themes, scales, locales} from '../../constants';

export const withChromaticProvider = makeDecorator({
  name: 'withChromaticProvider',
  parameterName: 'chromaticProvider',
  wrapper: (getStory, context, {options, parameters}) => {
    options = {...options, ...parameters};
    let selectedLocales = ['en-US'];
    if (options.rtl) {
      selectedLocales = ['en-US', 'he-IL'];
    }
    if (options.locales) {
      selectedLocales = locales.map(l => l.value).slice(1);
    }

    let isAutoFocus = options.isAutoFocus;
    let height = options.height;

    return (
      <div style={{height}}>
        {isAutoFocus &&
          <Provider theme={themes.light} colorScheme="light" scale="medium" locale="en-US" typekitId="pbi5ojv">
            <Heading variant="subtitle3" style={{margin: 0, padding: '10px'}}>{'light, medium, en-US'}</Heading>
            {getStory(context)}
          </Provider>
        }
        {!isAutoFocus && (options.colorSchemes || Object.keys(themes)).map(colorScheme =>
          (options.scales || Object.keys(scales)).map(scale =>
            (colorScheme === 'light' ? selectedLocales : ['en-US']).map(locale =>
              <Provider key={`${colorScheme}_${scale}_${locale}`} theme={themes[colorScheme]} colorScheme={colorScheme.replace(/est$/, '')} scale={scale} locale={locale} typekitId="pbi5ojv">
                <Heading variant="subtitle3" style={{margin: 0, padding: '10px'}}>{`${colorScheme}, ${scale}, ${locale}`}</Heading>
                {getStory(context)}
              </Provider>
            )
          )
        )}
      </div>
    )
  }
});
