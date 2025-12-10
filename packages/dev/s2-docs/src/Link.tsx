'use client';

import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getBaseUrl} from './pageUtils';
import {LinkProps, Link as S2Link} from '@react-spectrum/s2';
import {mergeRefs} from '@react-aria/utils';
import {Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import React, {Ref, useMemo} from 'react';
import {registerLink, registerSpectrumLink} from './prefetch';

export function BaseLink({ref, ...props}: LinkProps & {ref?: Ref<HTMLAnchorElement>}) {
  return (
    <RACLink
      {...props}
      ref={useMemo(() => mergeRefs(ref, registerLink), [ref])} />
  );
}

export function Link({href, ...props}: LinkProps) {
  if (href?.startsWith('s2:') || href?.startsWith('react-aria:')) {
    let url = new URL(href);
    href = getBaseUrl(url.protocol.slice(0, -1) as any) + '/' + url.pathname;
  }

  return (
    <S2Link {...props} ref={registerSpectrumLink} href={href} {...getAnchorProps(href)} />
  );
}

const baseUrl = getBaseUrl((process.env.LIBRARY as any) || 'react-aria');
export function getAnchorProps(href) {
  if (!/^http/.test(href) || href.startsWith(baseUrl)) {
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
  return <RACLink {...props} style={({isHovered}) => ({cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: isHovered ? 'solid' : 'dotted'})} />;
}

const titleLink = style({
  ...focusRing(),
  font: 'title',
  marginY: 0,
  color: {
    default: 'heading',
    forcedColors: 'LinkText'
  }
});

export function TitleLink(props: RACLinkProps) {
  return <RACLink {...props} className={titleLink} />;
}
