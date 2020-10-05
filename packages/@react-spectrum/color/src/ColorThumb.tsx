/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames} from '@react-spectrum/utils';
import {Color} from '@react-stately/color';
import {DOMProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import stylesHandle from '@adobe/spectrum-css-temp/components/colorhandle/vars.css';
import stylesLoupe from '@adobe/spectrum-css-temp/components/colorloupe/vars.css';

interface ColorThumbProps extends DOMProps {
  value: Color,
  isDisabled?: boolean,
  isDragging?: boolean, // shows the color loupe
  isFocused?: boolean, // makes the circle larger
  className?: string,
  children?: ReactElement
}

function ColorThumb(props: ColorThumbProps) {
  let {value, isDisabled, isDragging, isFocused, children, className = '', ...otherProps} = props;

  let valueCSS = value.toString('css');

  return (
    <div className={classNames(stylesHandle, 'spectrum-ColorHandle', {'is-focused': isFocused, 'is-disabled': isDisabled}) + ' ' + className} {...otherProps}>
      <div className={classNames(stylesHandle, 'spectrum-ColorHandle-color')} style={{backgroundColor: valueCSS}} />
      <svg className={classNames(stylesLoupe, 'spectrum-ColorLoupe',  {'is-open': isDragging})} aria-hidden="true">
        <path
          className={classNames(stylesLoupe, 'spectrum-ColorLoupe-inner')}
          d="M25 1a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
          fill={valueCSS} />
        <path
          className={classNames(stylesLoupe, 'spectrum-ColorLoupe-outer')}
          d="M25 3A21.98 21.98 0 003 25c0 6.2 4 14.794 11.568 24.853A144.233 144.233 0 0025 62.132a144.085 144.085 0 0010.4-12.239C42.99 39.816 47 31.209 47 25A21.98 21.98 0 0025 3m0-2a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z" />
      </svg>
      {children}
    </div>
  );
}

export {ColorThumb};
