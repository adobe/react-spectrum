'use client';

import {ActionButton} from '@react-spectrum/s2';
import {flushSync} from 'react-dom';
import React, {CSSProperties, ReactNode, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const example = style({
  font: 'code-lg',
  maxHeight: {
    default: '[6lh]',
    isExpanded: 'unset'
  },
  overflow: {
    default: 'clip',
    isExpanded: 'visible'
  },
  position: 'relative',
  width: 'full',
  borderBottomRadius: 'xl',
  '--import-display': {
    type: 'display',
    value: {
      default: 'none',
      isExpanded: 'inline'
    }
  }
});

const expandWrapper = style({
  position: {
    default: 'absolute',
    isExpanded: 'static'
  },
  bottom: 0,
  insetX: 0,
  display: 'flex',
  justifyContent: 'center',
  paddingY: 8
});

export function ExpandableCode({children, hasHighlightedLine}: {children: ReactNode, hasHighlightedLine?: boolean}) {
  let [isExpanded, setExpanded] = useState(false);
  let ref = useRef<HTMLDivElement | null>(null);
  let mask: string | undefined;
  let padding: string | undefined;
  if (!isExpanded) {
    if (hasHighlightedLine) {
      // mask the top, bottom, and right sides
      mask = 'linear-gradient(transparent, white 25% 50%, transparent), linear-gradient(to right, white 0% 85%, transparent)';
      padding = '0px';
    } else {
      // only mask the bottom
      mask = 'linear-gradient(white 0% 50%, transparent)';
    }
  }

  return (
    <div ref={ref} className={example({isExpanded})}>
      <div style={{maskImage: mask, maskComposite: 'intersect', maxHeight: isExpanded ? undefined : 'inherit', '--code-padding-y': padding} as CSSProperties}>
        {children}
      </div>
      <div className={expandWrapper({isExpanded})}>
        <ActionButton
          onPress={() => {
            viewTransition(() => {
              setExpanded(!isExpanded);
              ref.current?.scrollTo(0, 0);
            });
          }}>
          {isExpanded ? 'Collapse code' : 'Expand code'}
        </ActionButton>
      </div>
    </div>
  );
}

function viewTransition(cb) {
  if ('startViewTransition' in document) {
    // @ts-ignore
    document.startViewTransition(() => flushSync(() => cb()));
  } else {
    cb();
  }
}
