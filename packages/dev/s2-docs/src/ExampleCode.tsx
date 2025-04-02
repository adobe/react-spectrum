'use client';

import {ActionButton} from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const example = style({
  font: 'code-lg',
  maxHeight: {
    default: '[6lh]',
    isExpanded: 600
  },
  overflow: {
    default: 'clip',
    isExpanded: 'auto'
  },
  position: 'relative',
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

export function ExampleCode({children}) {
  let [isExpanded, setExpanded] = useState(false);
  let ref = useRef(null);
  return (
    <div ref={ref} className={example({isExpanded})}>
      <div style={{maskImage: isExpanded ? undefined : 'linear-gradient(white 0% 50%, transparent)', maxHeight: isExpanded ? undefined : 'inherit'}}>
        {children}
      </div>
      <div className={expandWrapper({isExpanded})}>
        <ActionButton onPress={() => {
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
