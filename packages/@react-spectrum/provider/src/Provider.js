import classNames from 'classnames';
import configureTypekit from './configureTypekit';
import {filterDOMProps, shouldKeepSpectrumClassNames} from '@react-spectrum/utils';
import {Provider as I18nProvider} from '@react-aria/i18n';
import React, {useContext, useEffect} from 'react';
import {version} from '../package.json';
import '@adobe/focus-ring-polyfill';
import styles from '@adobe/spectrum-css-temp/components/page/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const ProviderContext = React.createContext();

export function Provider({theme, scale, toastPlacement, typekitId, locale = 'en-US', className, children, ...otherProps}) {
  let context = {
    version,
    theme,
    scale,
    toastPlacement
  };

  useEffect(() => {
    configureTypekit(typekitId);
  }, [typekitId]);

  let themeKey = Object.keys(theme)[0];
  let scaleKey = Object.keys(scale)[0];

  className = classNames(
    className,
    styles['spectrum'],
    typographyStyles['spectrum'],
    theme[themeKey],
    scale[scaleKey],
    {
      'react-spectrum-provider': shouldKeepSpectrumClassNames,
      spectrum: shouldKeepSpectrumClassNames,
      [themeKey]: shouldKeepSpectrumClassNames,
      [scaleKey]: shouldKeepSpectrumClassNames
    }
  );

  return (
    <ProviderContext.Provider value={context}>
      <I18nProvider locale={locale}>
        <div className={className} {...filterDOMProps(otherProps)}>
          {children}
        </div>
      </I18nProvider>
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  return useContext(ProviderContext);
}
