import classNames from 'classnames';
import configureTypekit from './configureTypekit';
import {filterDOMProps, shouldKeepSpectrumClassNames} from '@react-spectrum/utils';
import {Provider as I18nProvider, useLocale} from '@react-aria/i18n';
import {ProviderContext, ProviderProps} from './types';
import React, {useContext, useEffect} from 'react';
import styles from '@adobe/spectrum-css-temp/components/page/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useColorScheme, useScale} from './mediaQueries';
// @ts-ignore
import {version} from '../package.json';

const Context = React.createContext<ProviderContext | null>(null);

export function Provider(props: ProviderProps) {
  let prevContext = useProvider();
  let {
    theme = prevContext && prevContext.theme,
    defaultColorScheme = prevContext ? prevContext.colorScheme : 'light'
  } = props;
  // Hooks must always be called.
  let autoColorScheme = useColorScheme(theme, defaultColorScheme);
  let autoScale = useScale(theme);

  let {
    colorScheme = autoColorScheme,
    scale = prevContext ? prevContext.scale : autoScale,
    typekitId,
    locale,
    children,
    toastPlacement,
    isQuiet,
    isEmphasized,
    isDisabled,
    isRequired,
    isReadOnly,
    ...otherProps
  } = props;

  // Merge options with parent provider
  let context = Object.assign({}, prevContext, {
    version,
    theme,
    colorScheme,
    scale,
    toastPlacement,
    isQuiet,
    isEmphasized,
    isDisabled,
    isRequired,
    isReadOnly
  });

  useEffect(() => {
    configureTypekit(typekitId);
  }, [typekitId]);

  // Only wrap in a DOM node if the theme, colorScheme, or scale changed
  let contents = children;
  let domProps = filterDOMProps(otherProps);
  if (!prevContext || theme !== prevContext.theme || colorScheme !== prevContext.colorScheme || scale !== prevContext.scale || Object.keys(domProps).length > 0) {
    contents = (
      <ProviderWrapper {...props}>
        {contents}
      </ProviderWrapper>
    );
  }

  return (
    <Context.Provider value={context}>
      <I18nProvider locale={locale}>
        {contents}
      </I18nProvider>
    </Context.Provider>
  );
}

function ProviderWrapper({children, className, ...otherProps}: ProviderProps) {
  let {locale, direction} = useLocale();
  let {theme, colorScheme, scale} = useProvider();

  let themeKey = Object.keys(theme[colorScheme])[0];
  let scaleKey = Object.keys(theme[scale])[0];

  className = classNames(
    className,
    styles['spectrum'],
    typographyStyles['spectrum'],
    theme[colorScheme][themeKey],
    theme[scale][scaleKey],
    {
      'react-spectrum-provider': shouldKeepSpectrumClassNames,
      spectrum: shouldKeepSpectrumClassNames,
      [themeKey]: shouldKeepSpectrumClassNames,
      [scaleKey]: shouldKeepSpectrumClassNames
    }
  );

  return (
    <div className={className} lang={locale} dir={direction} {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

export function useProvider(): ProviderContext {
  return useContext(Context);
}

export function useProviderProps(props) {
  let context = useProvider();
  if (!context) {
    return props;
  }
  return Object.assign({}, {
    isQuiet: context.isQuiet,
    isEmphasized: context.isEmphasized,
    isDisabled: context.isDisabled,
    isRequired: context.isRequired,
    isReadOnly: context.isReadOnly
  }, props);
}
