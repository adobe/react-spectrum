'use client';

import {createContext, useContext} from 'react';

export type ColorScheme = 'light' | 'dark';

interface SettingsContextValue {
  colorScheme: ColorScheme,
  toggleColorScheme: () => void,
  systemColorScheme: ColorScheme
}

export const SettingsContext = createContext<SettingsContextValue>({
  colorScheme: 'light',
  toggleColorScheme: () => {},
  systemColorScheme: 'light'
});

export function useSettings() {
  return useContext(SettingsContext);
}
