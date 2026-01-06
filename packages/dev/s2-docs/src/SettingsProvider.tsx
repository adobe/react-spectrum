'use client';

import {type ColorScheme, SettingsContext} from './SettingsContext';
import {Provider} from '@react-spectrum/s2';
import React, {ReactNode, useCallback, useSyncExternalStore} from 'react';
import {useLocalStorage} from './useLocalStorage';

interface SettingsProviderProps {
  children: ReactNode
}

function subscribeToColorScheme(callback: () => void) {
  let mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSystemColorScheme(): ColorScheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot(): ColorScheme {
  return 'light';
}

export function useSettingsState() {
  // Store the "override" color scheme ('light', 'dark', or 'system')
  let [storedColorScheme, setStoredColorScheme] = useLocalStorage('colorScheme', 'system');
  let systemColorScheme = useSyncExternalStore(subscribeToColorScheme, getSystemColorScheme, getServerSnapshot);

  // Resolve the actual color scheme being used
  let colorScheme: ColorScheme = storedColorScheme === 'system' ? systemColorScheme : storedColorScheme as ColorScheme;

  // Toggle between system preference and the "other" one
  let toggleColorScheme = useCallback(() => {
    if (storedColorScheme === 'system') {
      // Currently following system, switch to the opposite of system preference
      setStoredColorScheme(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      // Currently overriding, go back to system
      setStoredColorScheme('system');
    }
  }, [storedColorScheme, systemColorScheme, setStoredColorScheme]);


  let providerColorScheme: ColorScheme | undefined = storedColorScheme === 'system' ? undefined : storedColorScheme as ColorScheme;

  return {
    colorScheme,
    toggleColorScheme,
    systemColorScheme,
    providerColorScheme
  };
}

export function SettingsContextProvider({children}: SettingsProviderProps) {
  let {colorScheme, toggleColorScheme, systemColorScheme, providerColorScheme} = useSettingsState();

  return (
    <SettingsContext.Provider
      value={{
        colorScheme,
        toggleColorScheme,
        systemColorScheme
      }}>
      <Provider colorScheme={providerColorScheme}>
        {children}
      </Provider>
    </SettingsContext.Provider>
  );
}

export function SettingsProvider({children}: SettingsProviderProps) {
  let {colorScheme, toggleColorScheme, systemColorScheme, providerColorScheme} = useSettingsState();

  return (
    <SettingsContext.Provider
      value={{
        colorScheme,
        toggleColorScheme,
        systemColorScheme
      }}>
      <Provider colorScheme={providerColorScheme} background="layer-1">
        {children}
      </Provider>
    </SettingsContext.Provider>
  );
}
