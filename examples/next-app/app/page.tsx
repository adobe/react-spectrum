"use client";

import {Provider, defaultTheme, DatePicker} from '@adobe/react-spectrum';
import {useRouter} from 'next/navigation';

declare module '@adobe/react-spectrum' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
  }
}

export default function Home() {
  let router = useRouter();
  return (
    <Provider theme={defaultTheme} locale="en" router={{navigate: router.push}}>
      <DatePicker label="Date" />
    </Provider>
  )
}
