'use client';

// eslint-disable-next-line monorepo/no-internal-import
import BrowserError from '@react-spectrum/s2/illustrations/linear/BrowserError';
import {Content, Heading, IllustratedMessage} from '@react-spectrum/s2';

export default function Error() {
  return (
    <div style={{display: 'flex', alignItems: 'center', height: '50vh', justifyContent: 'center', flexDirection: 'row'}}>
      <IllustratedMessage>
        <BrowserError />
        <Heading>Error 404: Page not found</Heading>
        <Content>This page isn't available. Try checking the URL or visit a different page.</Content>
      </IllustratedMessage>
    </div>
  );
}
