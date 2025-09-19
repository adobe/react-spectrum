import {AdobeLogo} from './icons/AdobeLogo';
import {InternationalizedLogo} from './icons/InternationalizedLogo';
import {ReactAriaLogo} from './icons/ReactAriaLogo';
import {ReactNode} from 'react';

export type Library = 'react-spectrum' | 'react-aria' | 'internationalized';

type TabDef = {
  label: string,
  description: string,
  icon: ReactNode
};

export const TAB_DEFS: Record<Library, TabDef> = {
  'react-spectrum': {
    label: 'React Spectrum',
    description: "Components for Adobe's Spectrum design system",
    icon: <AdobeLogo />
  },
  'react-aria': {
    label: 'React Aria',
    description: 'Style-free components and hooks for building accessible UIs',
    icon: <ReactAriaLogo />
  },
  'internationalized': {
    label: 'Internationalized',
    description: 'Framework-agnostic internationalization utilities',
    icon: <InternationalizedLogo />
  }
};

