import {I18nProvider, RouterProvider} from 'react-aria-components';
import {ReactNode} from 'react';
import type {Router} from '@react-types/provider';

export interface ProviderProps {
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
  router?: Router
}

export function Provider(props: ProviderProps) {
  let result = props.children;
  if (props.locale) {
    result = <I18nProvider locale={props.locale}>{result}</I18nProvider>;
  }

  if (props.router) {
    result = <RouterProvider {...props.router}>{result}</RouterProvider>;
  }
  
  return result;
}
