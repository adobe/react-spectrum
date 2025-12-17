'use client';

import {baseColor, focusRing, space, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getBaseUrl} from './pageUtils';
import {LinkButtonProps, LinkProps, pressScale, Link as S2Link, LinkButton as S2LinkButton} from '@react-spectrum/s2';
import {mergeRefs} from '@react-aria/utils';
import {mergeStyles} from '../../../@react-spectrum/s2/style/runtime';
import {Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import React, {Ref, useMemo, useRef} from 'react';
import {registerLink, registerSpectrumLink} from './prefetch';

export function BaseLink({ref, ...props}: RACLinkProps & {ref?: Ref<HTMLAnchorElement>}) {
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

export function LinkButton({href, ...props}: LinkButtonProps) {
  if (href?.startsWith('s2:') || href?.startsWith('react-aria:')) {
    let url = new URL(href);
    href = getBaseUrl(url.protocol.slice(0, -1) as any) + '/' + url.pathname;
  }

  return (
    <S2LinkButton {...props} ref={registerSpectrumLink} href={href} {...getAnchorProps(href)} />
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

const linkStyle = style({
  ...focusRing(),
  outlineColor: {
    default: 'focus-ring',
    staticColor: {
      auto: 'transparent-overlay-1000',
      white: 'white'
    }
  },
  font: 'ui',
  color: {
    default: 'neutral',
    staticColor: {
      auto: 'transparent-overlay-800',
      white: 'white'
    }
  },
  textDecoration: 'none',
  transition: 'default',
  backgroundColor: {
    default: {
      ...baseColor('gray-100'),
      default: 'transparent'
    },
    staticColor: {
      auto: {
        ...baseColor('transparent-overlay-100'),
        default: 'transparent'
      },
      white: {
        ...baseColor('transparent-white-100'),
        default: 'transparent'
      }
    }
  },
  height: 32,
  paddingX: {
    default: 'edge-to-text',
    ':has(svg:only-child)': space(6)
  },
  display: 'flex',
  alignItems: 'center',
  borderRadius: 'lg'
});

export function HeaderLink(props: RACLinkProps & {staticColor?: 'auto' | 'white', styles?: StyleString}) {
  let {staticColor, styles, ...otherProps} = props;
  let ref = useRef(null);
  return (
    <BaseLink
      {...otherProps}
      ref={ref}
      className={renderProps => mergeStyles(linkStyle({...renderProps, staticColor}), styles)}
      style={pressScale(ref)} />
  );
}
