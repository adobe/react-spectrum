'use client';

import {type ColorScheme, type ColorSchemePreference, type PackageManager, SettingsContext, type StyleSolution, type VanillaCSSTheme} from './SettingsContext';
import {Provider} from '@react-spectrum/s2';
import React, {ReactNode, useEffect, useSyncExternalStore} from 'react';
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

export function SettingsProvider({children}: SettingsProviderProps) {
  let [colorScheme, setColorScheme] = useLocalStorage('colorScheme', 'system');
  let [packageManager, setPackageManager] = useLocalStorage('packageManager', 'npm');
  let [styleSolution, setStyleSolution] = useLocalStorage('style', 'Vanilla CSS');
  let [vanillaCSSTheme, setVanillaCSSTheme] = useLocalStorage('theme', 'indigo');
  let systemColorScheme = useSyncExternalStore(subscribeToColorScheme, getSystemColorScheme, getServerSnapshot);

  // Set data-color-scheme attribute on document root for vanilla CSS examples
  useEffect(() => {
    if (colorScheme === 'system') {
      document.documentElement.removeAttribute('data-color-scheme');
    } else {
      document.documentElement.setAttribute('data-color-scheme', colorScheme);
    }
  }, [colorScheme]);
  
  let providerColorScheme: ColorScheme | undefined = colorScheme === 'system' ? undefined : (colorScheme as ColorScheme);
  let resolvedColorScheme: ColorScheme = colorScheme === 'system' ? systemColorScheme : (colorScheme as ColorScheme);

  return (
    <SettingsContext.Provider
      value={{
        colorScheme: colorScheme as ColorSchemePreference,
        setColorScheme: setColorScheme as (value: ColorSchemePreference) => void,
        resolvedColorScheme,
        packageManager: packageManager as PackageManager,
        setPackageManager: setPackageManager as (value: PackageManager) => void,
        styleSolution: styleSolution as StyleSolution,
        setStyleSolution: setStyleSolution as (value: StyleSolution) => void,
        vanillaCSSTheme: vanillaCSSTheme as VanillaCSSTheme,
        setVanillaCSSTheme: setVanillaCSSTheme as (value: VanillaCSSTheme) => void
      }}>
      <Provider colorScheme={providerColorScheme} background="layer-1">
        {children}
      </Provider>
    </SettingsContext.Provider>
  );
}
