/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AvatarContext} from './Avatar';
import {Children, ReactNode} from 'react';
import {DOMProps} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};


interface AvatarGroupProps extends StyleProps, DOMProps {
  /** Avatar children of the avatar group. */
  children: ReactNode,

  /** The label for the avatar group. */
  label?: string,

  /**
   * The size of the avatar group.
   *
   * @default 'M'
   * */
  size?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'
}

const avatar = style({
  marginStart: {
    default: {
      size: {
        S: size(-5),
        M: size(-6),
        L: size(-7),
        XL: size(-8),
        XXL: size(-9),
        XXXL: size(-10)
      }
    },
    isFirst: 0
  },
  size: {
    size: {
      S: 20,
      M: 24,
      L: 28,
      XL: 32,
      XXL: 36,
      XXXL: 40
    }
  }
});

const text = style({
  marginStart: 8,
  fontFamily: 'sans',
  fontSize: {
    size: {
      S: 'ui-sm',
      M: 'ui',
      L: 'ui-lg',
      XL: 'ui-xl',
      XXL: 'ui-2xl',
      XXXL: 'ui-3xl'
    }
  }
});

const container = style({display: 'flex', alignItems: 'center'}, getAllowedOverrides());

export function AvatarGroup(props: AvatarGroupProps) {
  let {children, label, size = 'M'} = props;

  return (
    <div className={container(null, props.styles)}>
      {
        Children.map(children, (child, index) => (
          <AvatarContext.Provider value={{styles: avatar({size, isFirst: index === 0}), strokeColor: 'white'}}>
            {child}
          </AvatarContext.Provider>
        ))
      }
      {label && <span className={text({size})}>{label}</span>}
    </div>
  );
}
