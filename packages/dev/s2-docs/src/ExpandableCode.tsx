'use client';

import {ActionButton} from '@react-spectrum/s2';
import {flushSync} from 'react-dom';
import React, {ReactNode, useRef, useState} from 'react';
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
  borderBottomRadius: 'xl'
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

export function ExpandableCode({children}: {children: ReactNode}) {
  let [isExpanded, setExpanded] = useState(false);
  let ref = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref} className={example({isExpanded})}>
      <div style={{maskImage: isExpanded ? undefined : 'linear-gradient(white 0% 50%, transparent)', maxHeight: isExpanded ? undefined : 'inherit'}}>
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
