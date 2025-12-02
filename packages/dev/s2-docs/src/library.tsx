import {AdobeLogo} from './icons/AdobeLogo';
import {InternationalizedLogoFilled} from './icons/InternationalizedLogoFilled';
import React from 'react';
import {ReactAriaLogo} from './icons/ReactAriaLogo';

export type Library = 'react-spectrum' | 'react-aria' | 'internationalized';

export function getLibraryFromUrl(name: string): Library {
  if (name.startsWith('react-aria/internationalized/')) {
    return 'internationalized';
  }
  if (name.startsWith('react-aria/')) {
    return 'react-aria';
  }
  if (name.startsWith('s2/')) {
    return 'react-spectrum';
  }
  return 'react-spectrum';
}

export function getLibraryFromPage(page: {name: string}): Library {
  return getLibraryFromUrl(page.name);
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
      return <InternationalizedLogoFilled />;
    default:
      return <AdobeLogo />;
  }
}
