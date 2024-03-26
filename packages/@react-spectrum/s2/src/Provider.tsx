import {I18nProvider, RouterProvider, useLocale} from 'react-aria-components';
import {ReactNode, createContext, useContext} from 'react';
import type {ColorScheme, Router} from '@react-types/provider';
import {StyleString} from '../style/types';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {colorScheme, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';

export interface ProviderProps extends UnsafeStyles {
  /** The content of the Provider. */
  children: ReactNode,
  /**
   * The locale for your application as a [BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code.
   * Defaults to the browser/OS language setting.
   * @default 'en-US'
   */
  locale?: string,
  /**
   * Provides a client side router to all nested React Spectrum links to enable client side navigation.
   */
  router?: Router,
  /**
   * The color scheme for your application.
   * Defaults to operating system preferences.
   */
  colorScheme?: ColorScheme,
  /** The background for this provider. If not provided, the background is transparent. */
  background?: 'base' | 'layer-1' | 'layer-2',
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString,
  /**
   * The DOM element to render.
   * @default div
   */
  elementType?: keyof JSX.IntrinsicElements
}

export const ColorSchemeContext = createContext<ColorScheme | 'light dark' | null>(null);

export function Provider(props: ProviderProps) {
  let result = <ProviderInner {...props} />;
  let parentColorScheme = useContext(ColorSchemeContext);
  let colorScheme = props.colorScheme || parentColorScheme || 'light dark';
  if (colorScheme !== parentColorScheme) {
    result = <ColorSchemeContext.Provider value={colorScheme}>{result}</ColorSchemeContext.Provider>;
  }

  if (props.locale) {
    result = <I18nProvider locale={props.locale}>{result}</I18nProvider>;
  }

  if (props.router) {
    result = <RouterProvider {...props.router}>{result}</RouterProvider>;
  }

  return result;
}

let providerStyles = style({
  ...colorScheme(),
  backgroundColor: {
    background: {
      base: 'base',
      'layer-1': 'layer-1',
      'layer-2': 'layer-2'
    }
  }
});

function ProviderInner(props: ProviderProps) {
  let {
    elementType: Element = 'div',
    UNSAFE_style,
    UNSAFE_className = '',
    styles,
    children,
    background,
    colorScheme
  } = props;
  let {locale, direction} = useLocale();
  return (
    <Element
      lang={locale}
      dir={direction}
      style={UNSAFE_style}
      className={UNSAFE_className + mergeStyles(
        styles,
        providerStyles({background, colorScheme})
      )}>
      {children}
    </Element>
  );
}
