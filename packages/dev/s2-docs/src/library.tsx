import {AdobeLogo} from './icons/AdobeLogo';
import {InternationalizedLogo} from './icons/InternationalizedLogo';
import React from 'react';
import {ReactAriaLogo} from './icons/ReactAriaLogo';

export type Library = 'react-spectrum' | 'react-aria' | 'internationalized';

export function getLibraryFromUrl(url: string): Library {
  if (url.includes('/react-aria/')) {
    return 'react-aria';
  }
  if (url.includes('/internationalized/')) {
    return 'internationalized';
  }
  if (url.includes('/s2/')) {
    return 'react-spectrum';
  }
  return 'react-spectrum';
}

export function getLibraryFromPage(page: {url: string}): Library {
  return getLibraryFromUrl(page.url);
}

export function getLibraryLabel(library: Library): string {
  switch (library) {
    case 'react-aria':
      return 'React Aria';
    case 'internationalized':
      return 'Internationalized';
    default:
      return 'React Spectrum';
  }
}

export function getLibraryIcon(library: Library): React.ReactNode {
  switch (library) {
    case 'react-aria':
      return <ReactAriaLogo />;
    case 'internationalized':
      return <InternationalizedLogo />;
    default:
      return <AdobeLogo />;
  }
}
