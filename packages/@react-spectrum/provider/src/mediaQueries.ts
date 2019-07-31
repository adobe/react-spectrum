import {ColorScheme, Scale, Theme} from './types';
import {useMediaQuery} from '@react-spectrum/utils';

export function useColorScheme(theme: Theme, defaultColorScheme: ColorScheme): ColorScheme {
  let matchesDark = useMediaQuery('(prefers-color-scheme: dark)');
  let matchesLight = useMediaQuery('(prefers-color-scheme: light)');

  if (theme.dark && (matchesDark || defaultColorScheme === 'dark' || !theme.light)) {
    return 'dark';
  }

  if (theme.light && (matchesLight || defaultColorScheme === 'light' || !theme.dark)) {
    return 'light';
  }
}

export function useScale(theme: Theme): Scale {
  let matchesFine = useMediaQuery('(any-pointer: fine)');
  if (matchesFine && theme.medium) {
    return 'medium';
  }

  if (theme.large) {
    return 'large';
  }

  return 'medium';
}
