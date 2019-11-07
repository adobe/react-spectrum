import classNames from 'classnames';
import configureTypekit from './configureTypekit';
import {filterDOMProps, shouldKeepSpectrumClassNames} from '@react-spectrum/utils';
import {Provider as I18nProvider, useLocale} from '@react-aria/i18n';
import {ModalProvider, useModalProvider} from '@react-aria/dialog';
import {ProviderContext, ProviderProps} from './types';
import React, {RefObject, useContext, useEffect} from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from '@adobe/spectrum-css-temp/components/page/vars.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useColorScheme, useScale} from './mediaQueries';
// @ts-ignore
import {version} from '../package.json';

const Context = React.createContext<ProviderContext | null>(null);

export const Provider = React.forwardRef((props: ProviderProps, ref: RefObject<HTMLDivElement>) => {
  let prevContext = useProvider();
  let {
    theme = prevContext && prevContext.theme,
    defaultColorScheme = prevContext ? prevContext.colorScheme : 'light'
  } = props;
  // Hooks must always be called.
  let autoColorScheme = useColorScheme(theme, defaultColorScheme);
  let autoScale = useScale(theme);
  let {locale: prevLocale} = useLocale();

  let {
    colorScheme = autoColorScheme,
    scale = prevContext ? prevContext.scale : autoScale,
    typekitId,
    locale = prevContext ? prevLocale : null,
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
      <ProviderWrapper {...props} ref={ref}>
        {contents}
      </ProviderWrapper>
    );
  }

  return (
    <Context.Provider value={context}>
      <I18nProvider locale={locale}>
        <ModalProvider>
          {contents}
        </ModalProvider>
      </I18nProvider>
    </Context.Provider>
  );
});

const ProviderWrapper = React.forwardRef(({children, className, ...otherProps}: ProviderProps, ref: RefObject<HTMLDivElement>) => {
  let {locale, direction} = useLocale();
  let {theme, colorScheme, scale} = useProvider();
  let {modalProviderProps} = useModalProvider();

  let themeKey = Object.keys(theme[colorScheme])[0];
  let scaleKey = Object.keys(theme[scale])[0];

  className = classNames(
    className,
    'spectrum',
    `spectrum--${colorScheme}`,
    `spectrum--${scale}`,
    theme.global ? Object.values(theme.global) : null,
    theme[colorScheme][themeKey],
    theme[scale][scaleKey],
    {
      'react-spectrum-provider': shouldKeepSpectrumClassNames,
      spectrum: shouldKeepSpectrumClassNames,
      [`spectrum--${colorScheme}`]: shouldKeepSpectrumClassNames,
      [`spectrum--${scale}`]: shouldKeepSpectrumClassNames
    }
  );

  return (
    <div className={className} lang={locale} dir={direction} {...modalProviderProps} {...filterDOMProps(otherProps)} ref={ref}>
      {children}
    </div>
  );
});

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
