'use client';

import {baseColor, focusRing, space, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button, Disclosure, DisclosurePanel} from 'react-aria-components';
import Chevron from '../../../@react-spectrum/s2/ui-icons/Chevron';
import More from '@react-spectrum/s2/icons/More';
import {pressScale} from '@react-spectrum/s2';
import {useRef} from 'react';

const trigger = style({
  ...focusRing(),
  borderRadius: 'sm',
  padding: 0,
  marginStart: space(-12),
  backgroundColor: 'transparent',
  borderStyle: 'none',
  whiteSpace: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit'
});

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  color: 'neutral',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0,
  marginEnd: 4
});

const more = style({
  backgroundColor: baseColor('gray-100'),
  transition: 'default',
  borderRadius: 'sm',
  paddingX: 4,
  marginX: 4,
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'top',
  userSelect: 'none',
  '--iconPrimary': {
    type: 'fill',
    value: 'gray-1000'
  }
});

export function CodeFold({children}) {
  let ref = useRef(null);
  let firstChild = children[0];
  if (Array.isArray(firstChild) && firstChild.at(-1) === '\n') {
    firstChild = firstChild.slice(0, -1);
  }
  let lastChild = children.at(-1);
  if (typeof lastChild === 'string') {
    lastChild = lastChild.trim().split('\n').at(-1)?.trim();
  }

  return (
    <Disclosure>
      {({isExpanded}) => (<>
        <Button
          slot="trigger"
          className={trigger}>
          {({isHovered, isPressed, isFocusVisible}) => (<>
            <Chevron size="S" aria-hidden className={chevronStyles({isExpanded, isHovered, isPressed, isFocusVisible})} />
            {firstChild}{!isExpanded 
              ? <><span ref={ref} style={pressScale(ref)({isPressed})} className={more({isHovered, isPressed, isFocusVisible})}><More UNSAFE_style={{width: 14}} /></span>{lastChild}</> 
              : null}
          </>)}
        </Button>
        <DisclosurePanel>{children.slice(1)}</DisclosurePanel>
      </>)}
    </Disclosure>
  );
}
