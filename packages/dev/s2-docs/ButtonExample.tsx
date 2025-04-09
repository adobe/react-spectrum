"use client";

import { pressScale } from '@react-spectrum/s2';
import { baseColor, style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { useRef } from 'react';
import {Button as RACButton, ButtonProps} from 'react-aria-components';

const buttonStyle = style({
  borderRadius: 'default',
  backgroundColor: {
    default: baseColor('pink-800'),
    isDisabled: 'disabled'
  },
  color: {
    default: 'white',
    isDisabled: 'disabled'
  },
  paddingX: 'edge-to-text',
  height: 32,
  borderStyle: 'none',
  transition: 'default'
});

export function Button(props: ButtonProps) {
  let ref = useRef(null);
  return <RACButton {...props} ref={ref} className={buttonStyle} style={pressScale(ref)} />;
}
