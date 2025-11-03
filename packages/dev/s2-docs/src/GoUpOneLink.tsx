'use client';

import {baseColor, focusRing, fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {ButtonRenderProps, Link, Provider} from 'react-aria-components';
import {centerBaseline} from '../../../@react-spectrum/s2/src/CenterBaseline';
import ChevronLeftIcon from '@react-spectrum/s2/icons/ChevronLeft';
import {IconContext} from '@react-spectrum/s2';
import {pressScale} from '../../../@react-spectrum/s2/src/pressScale';
import React, {useRef} from 'react';


export const btnStyles = style<Omit<ButtonRenderProps, 'isPending'>>({
  ...focusRing(),
  borderRadius: 'default',
  position: 'relative',
  justifyContent: 'center',
  flexShrink: 0,
  fontWeight: 'medium',
  userSelect: 'none',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'transparent',
    forcedColors: {
      default: 'ButtonFace'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: {
        default: 'GrayText'
      }
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  borderStyle: 'none',
  disableTapHighlight: true,
  '--iconWidth': {
    type: 'width',
    value: fontRelative(20)
  }
});

export function GoUpOneLink() {
  let ref = useRef(null);
  // How to add aria-label to the Link component
  return (
    <Link href="./index.html" className={btnStyles} style={pressScale(ref)} ref={ref} aria-label="Go to all releases">
      <Provider
        values={[
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        <ChevronLeftIcon />
      </Provider>
    </Link>
  );
}
