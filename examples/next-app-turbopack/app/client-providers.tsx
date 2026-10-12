'use client';

import type {ReactNode} from 'react';
import {I18nProvider} from 'react-aria-components';

export function ClientProviders({children, locale}: {children: ReactNode; locale: string}) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
