import {Flex} from '@react-spectrum/layout';
import {Link} from '@adobe/react-spectrum';
import React from 'react';
// @ts-ignore
import url from 'url:../assets/wallpaper_collaborative_S2_desktop.webp';

export function WelcomeBanner() {
  return (
    <header
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        padding: '48px',
        marginTop: '-24px',
        marginLeft: '-24px',
        marginRight: '-24px',
        marginBottom: '32px',
        borderRadius: '12px'
      }}>
      <Flex direction="row" alignItems="center" gap="size-100" wrap>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.3
          }}>
          <Link variant="overBackground">
            <a href="https://react-aria.adobe.com/index.html">
              React Aria
            </a>
          </Link>
          {' and '}
          <Link variant="overBackground">
            <a href="https://react-spectrum.adobe.com/index.html">
              React Spectrum
            </a>
          </Link>
          {' have a new home!'}
        </span>
      </Flex>
    </header>
  );
}
