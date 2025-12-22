'use client';

import {type ColorScheme, type ColorSchemePreference, type PackageManager, SettingsContext, type StyleSolution, type VanillaCSSTheme} from './SettingsContext';
import {Provider} from '@react-spectrum/s2';
import React, {ReactNode} from 'react';
import {useLocalStorage} from './useLocalStorage';

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({children}: SettingsProviderProps) {
  let [colorScheme, setColorScheme] = useLocalStorage('colorScheme', 'system');
  let [packageManager, setPackageManager] = useLocalStorage('packageManager', 'npm');
  let [styleSolution, setStyleSolution] = useLocalStorage('style', 'Vanilla CSS');
  let [vanillaCSSTheme, setVanillaCSSTheme] = useLocalStorage('theme', 'indigo');
  
  let providerColorScheme: ColorScheme | undefined = colorScheme === 'system' ? undefined : (colorScheme as ColorScheme);

  return (
    <SettingsContext.Provider
      value={{
        colorScheme: colorScheme as ColorSchemePreference,
        setColorScheme: setColorScheme as (value: ColorSchemePreference) => void,
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
