import {mergeStyles} from '../../../../@react-spectrum/s2/style/runtime';
import React from 'react';
import {style, StyleString} from '@react-spectrum/s2/style' with { type: 'macro' };

export const AdobeLogo = ({styles, size}: {styles?: StyleString, size?: number}) => {
  return (
    <svg
      className={mergeStyles(style({size: 26, flexShrink: 0}), styles)}
      style={{display: 'block', width: size, height: size}}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      viewBox="0 0 501.71 444.05">
      <path
        d="m297.58 444.05-36.45-101.4h-91.46l76.87-193.53 116.65 294.93h138.52L316.8 0H186.23L0 444.05h297.58z"
        data-name="Layer 1"
        className={style({fill: '[#eb1000]', strokeWidth: 0})} />
    </svg>
  );
};
