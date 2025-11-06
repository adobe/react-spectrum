'use client';

import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {LinkProps, Link as S2Link} from '@react-spectrum/s2';
import {Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import React from 'react';

export function Link({href, ...props}: LinkProps) {
  return (
    <S2Link {...props} href={href} {...getAnchorProps(href)} />
  );
}

export function getAnchorProps(href) {
  if (!/^http/.test(href) || /localhost|reactspectrum\.blob\.core\.windows\.net|react-spectrum\.(corp\.)?adobe\.com|^#/.test(href)) {
    return {};
  }

  if (/^\//.test(href)) {
    return {};
  }

  return {target: '_blank', rel: 'noreferrer'};
}

const colorLink = style({
  ...focusRing(),
  borderRadius: 'sm',
  color: {
    // Keep these colors in sync with Code.tsx
    default: 'red-1000',
    type: {
      keyword: 'magenta-1000',
      variable: 'fuchsia-1000'
    },
    forcedColors: 'LinkText'
  },
  textDecoration: 'underline',
  disableTapHighlight: true,
  cursor: 'pointer'
});

export function ColorLink({type, ...props}: RACLinkProps & {type?: 'keyword' | 'variable'}) {
  return <RACLink {...props} className={r => colorLink({...r, type})} />;
}

export function CodeLink(props: RACLinkProps) {
  return <RACLink {...props} style={({isHovered}) => ({textDecorationStyle: isHovered ? 'solid' : 'dotted'})} />;
}

const titleLink = style({
  ...focusRing(),
  font: 'heading',
  fontSize: {
    // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
    default: 'clamp(35px, (100vw - 32px) / var(--width-per-em), 55px)',
    lg: 'heading'
  },
  marginY: 0,
  color: {
    default: 'heading',
    forcedColors: 'LinkText'
  }
});

export function TitleLink(props: RACLinkProps) {
  return <RACLink {...props} className={titleLink} />;
}
