'use client';

import {createContext, useContext} from 'react';

export type ColorScheme = 'light' | 'dark';
export type ColorSchemePreference = ColorScheme | 'system';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type StyleSolution = 'Vanilla CSS' | 'Tailwind';
export type VanillaCSSTheme = 'indigo' | 'blue' | 'cyan' | 'turquoise' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple';

interface SettingsContextValue {
  colorScheme: ColorSchemePreference,
  setColorScheme: (scheme: ColorSchemePreference) => void,
  packageManager: PackageManager,
  setPackageManager: (manager: PackageManager) => void,
  styleSolution: StyleSolution,
  setStyleSolution: (style: StyleSolution) => void,
  vanillaCSSTheme: VanillaCSSTheme,
  setVanillaCSSTheme: (theme: VanillaCSSTheme) => void
}

export const SettingsContext = createContext<SettingsContextValue>({
  colorScheme: 'system',
  setColorScheme: () => {},
  packageManager: 'npm',
  setPackageManager: () => {},
  styleSolution: 'Vanilla CSS',
  setStyleSolution: () => {},
  vanillaCSSTheme: 'indigo',
  setVanillaCSSTheme: () => {}
});

export function useSettings() {
  return useContext(SettingsContext);
}
