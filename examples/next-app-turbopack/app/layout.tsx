import './globals.css';

import {LocalizedStringProvider} from 'react-aria-components/i18n';

import {ClientProviders} from './client-providers';

const locale = 'de-AT';

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang={locale}>
      <body>
        <LocalizedStringProvider locale={locale} />
        <ClientProviders locale={locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
