"use client";

import {Provider, defaultTheme, DatePicker} from '@adobe/react-spectrum';

export default function Home() {
  return (
    <Provider theme={defaultTheme} locale="en">
      <DatePicker label="Date" />
    </Provider>
  )
}
