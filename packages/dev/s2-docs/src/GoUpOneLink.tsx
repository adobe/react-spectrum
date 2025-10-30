'use client';

import {ButtonRenderProps, Link, Provider} from 'react-aria-components';
import {baseColor, focusRing, fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import ChevronLeftIcon from '@react-spectrum/s2/icons/ChevronLeft';
import { IconContext } from '@react-spectrum/s2';
import { centerBaseline } from '../../../@react-spectrum/s2/src/CenterBaseline';
import React from 'react';
import { control } from '../../../@react-spectrum/s2/src/style-utils' with { type: 'macro' };


const controlStyle = control({shape: 'default', icon: true});
export const btnStyles = style<ButtonRenderProps>({
  ...focusRing(),
  ...controlStyle,
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
  return (
    <Link href="/">
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
