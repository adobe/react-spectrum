import {createContext} from 'react';
import {defaultTheme} from '../theme';
import type {NativeProviderContext} from './types';

export const defaultProviderContext: NativeProviderContext = {
  colorScheme: 'light',
  direction: 'ltr',
  scale: 'medium',
  theme: defaultTheme
};

export const ProviderContext = createContext<NativeProviderContext>(defaultProviderContext);
