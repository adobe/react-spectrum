'use client';

import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Link} from '@react-spectrum/s2';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import React, {ReactNode} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';

function childrenToString(children: ReactNode) {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children.reduce((p, c) => p + childrenToString(c), '');
  }

  return '';
}

function anchorId(children: ReactNode) {
  return childrenToString(children).replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

function AnchorLink({anchorId, isHovered, level, headingText}) {
  let {isFocusVisible, focusProps} = useFocusRing({within: true});
  const href = `#${anchorId}`;
  return (
    <span
      {...focusProps}
      className={style({
        opacity: {
          default: 0,
          isHovered: 1,
          isFocusVisible: 1
        },
        marginStart: {
          default: 8,
          level: {
            3: 4,
            4: 4
          }
        },
        transition: '[opacity 0.2s ease-in-out]'
      })({isHovered, isFocusVisible, level})}>
      <Link href={href} aria-label={`Link to ${headingText}`}>
        <LinkIcon
          styles={iconStyle({size: 'S', marginBottom: 4})} 
          UNSAFE_style={{marginBottom: (level === 3 || level === 4) ? 0 : undefined}} />
      </Link>
    </span>
  );
}

export function H2({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h2 {...props} id={id} className={style({font: 'heading-xl', marginTop: 48, marginBottom: 24})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={2} headingText={children} />
    </h2>
  );
}

export function H3({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h3 {...props} id={id} className={style({font: 'heading', marginTop: 32, marginBottom: 24})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={3} headingText={children} />
    </h3>
  );
}

export function H4({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h4 {...props} id={id} className={style({font: 'heading-sm'})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={4} headingText={children} />
    </h4>
  );
}
