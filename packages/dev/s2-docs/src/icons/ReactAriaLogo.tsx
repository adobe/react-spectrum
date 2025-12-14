import {mergeStyles} from '../../../../@react-spectrum/s2/style/runtime';
import React from 'react';
import {style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};

export const ReactAriaLogo = ({styles}: {styles?: StyleString}) => {
  return (
    <svg className={mergeStyles(style({width: 28, height: 27, flexShrink: 0}), styles)} viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'block'}}>
      <circle cx="22.3718" cy="20.4558" r="5.62767" fill="#EB1000" />
      <circle cx="5.62767" cy="20.4558" r="5.62767" fill="#EB1000" />
      <ellipse cx="14.1713" cy="5.66926" rx="5.58336" ry="5.66926" fill="#EB1000" />
      <path d="M0.705078 17.7L9.27507 2.92188L14.0655 11.3362C13.8012 11.3362 13.7351 11.3362 13.3121 11.4258C7.81464 13.5732 12.439 22.6797 18.2535 16.5987V24.2969C16.0573 21.9635 11.5277 22.3752 10.0179 24.0224L0.705078 17.7Z" fill="#EB1000" />
    </svg>
  );
};
