'use client';

import { style, space, focusRing, baseColor } from "@react-spectrum/s2/style" with {type: 'macro'};
import Chevron from "../../../@react-spectrum/s2/ui-icons/Chevron";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";
import More from '@react-spectrum/s2/icons/More';
import { pressScale } from "@react-spectrum/s2";
import { useRef } from "react";

const trigger = style({
  ...focusRing(),
  borderRadius: 'sm',
  padding: 0,
  marginStart: space(-16),
  backgroundColor: 'transparent',
  borderStyle: 'none',
  whiteSpace: 'normal',
  fontFamily: '[inherit]',
  fontSize: '[inherit]'
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
  marginEnd: 8
});

const more = style({
  backgroundColor: baseColor('gray-100'),
  transition: 'default',
  borderRadius: 'sm',
  paddingX: 4,
  marginStart: 4,
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  '--iconPrimary': {
    type: 'fill',
    value: 'gray-1000'
  }
});

export function Collapse({children}) {
  let ref = useRef(null);
  return (
    <Disclosure>
      {({isExpanded}) => <>
        <Button
          slot="trigger"
          className={trigger}>
          {({isHovered, isPressed, isFocusVisible}) => <>
            <Chevron size="M" aria-hidden className={chevronStyles({isExpanded, isHovered, isPressed, isFocusVisible})} />
            {children[0]}{!isExpanded 
              ? <><span ref={ref} style={pressScale(ref)({isPressed})} className={more({isHovered, isPressed, isFocusVisible})}><More UNSAFE_style={{width: 14}} /></span>{' '}{children.at(-1)}</> 
              : null}
          </>}
        </Button>
        <DisclosurePanel>{children.slice(1)}</DisclosurePanel>
      </>}
    </Disclosure>
  );
}
