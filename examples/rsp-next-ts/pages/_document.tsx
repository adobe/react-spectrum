import { Html, Head, Main, NextScript } from 'next/document'
import {LocalizedStringProvider} from '@adobe/react-spectrum/i18n';

export default function Document(props: any) {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <LocalizedStringProvider locale="en" />
        <NextScript />
      </body>
    </Html>
  )
}
