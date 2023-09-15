import { Html, Head, Main, NextScript } from 'next/document'
import {LocalizedStringProvider} from '@adobe/react-spectrum/intl';

export default function Document(props) {
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
