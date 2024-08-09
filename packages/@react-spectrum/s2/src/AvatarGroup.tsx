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

import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps, useId} from '@react-aria/utils';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import type {StyleString} from '../style/types';


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
  size?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
  /* stroke color (should match the container background color) */

  strokeColor?: 'base' | 'layer-1' | 'layer-2' | 'pasteboard'
}

interface AvatarGroupItemProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src: string
}

interface AvatarGroupContextProps extends Pick<AvatarGroupProps, 'strokeColor'> {
  styles?: StyleString
}

const avatar = style({
  flexShrink: 0,
  flexGrow: 0,
  marginStart: {
    size: {
      S: size(-5),
      M: size(-6),
      L: size(-7),
      XL: size(-8),
      XXL: size(-9),
      XXXL: size(-10)
    },
    ':first-child': 0
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
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
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

const imageStyles = style({
  borderRadius: 'full',
  borderWidth: 1,
  borderStyle: 'solid',
  '--avatarBorder': {
    type: 'backgroundColor',
    value: {
      strokeColor: {
        base: 'base',
        'layer-1': 'layer-1',
        'layer-2': 'layer-2',
        pasteboard: 'pasteboard'
      }
    }
  },
  borderColor: '[var(--avatarBorder)]',
  size: 20,
  disableTapHighlight: true
}, getAllowedOverrides({height: true}));

const AvatarGroupContext = createContext<AvatarGroupContextProps>({});

const container = style({
  display: 'flex',
  alignItems: 'center',
  margin: 0
}, getAllowedOverrides());

function AvatarGroup(props: AvatarGroupProps) {
  let {children, label, size = 'M', strokeColor = 'base', styles, UNSAFE_style, UNSAFE_className, ...otherProps} = props;
  let groupId = useId();
  let labelId = useId();

  return (
    <AvatarGroupContext.Provider value={{styles: avatar({size}), strokeColor}}>
      <div
        id={groupId}
        aria-labelledby={`${groupId} ${labelId}`}
        aria-label="online members"
        {...filterDOMProps(otherProps)}
        role="group"
        className={(UNSAFE_className ?? '') + container(null, styles)}
        style={UNSAFE_style}>
        {children}
        {label && <span id={labelId} className={text({size})}>{label}</span>}
      </div>
    </AvatarGroupContext.Provider>
  );
}

let _AvatarGroup = forwardRef(AvatarGroup);
export {_AvatarGroup as AvatarGroup};

export function AvatarGroupItem(props: AvatarGroupItemProps) {
  let {
    alt = '',
    src
  } = props;
  let {styles, strokeColor} = useContext(AvatarGroupContext);
  return (
    <img
      alt={alt}
      className={styles + imageStyles({strokeColor})}
      src={src} />
  );
}
