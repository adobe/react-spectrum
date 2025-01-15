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

import {ContextValue, SlotProps} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import {DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, StylesPropWithoutWidth, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {Image} from './Image';
import {style} from '../style' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface AvatarProps extends UnsafeStyles, DOMProps, SlotProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithoutWidth,
  /**
   * The size of the avatar.
   * @default 24
   */
  size?: 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 80 | 96 | 112 | (number & {}),
  /** Whether the avatar is over a color background. */
  isOverBackground?: boolean
}

const imageStyles = style({
  borderRadius: 'full',
  size: 20,
  flexShrink: 0,
  flexGrow: 0,
  disableTapHighlight: true,
  outlineStyle: {
    default: 'none',
    isOverBackground: 'solid'
  },
  outlineColor: '--s2-container-bg',
  outlineWidth: {
    default: 1,
    isLarge: 2
  }
}, getAllowedOverrides({width: false}));

export const AvatarContext = createContext<ContextValue<AvatarProps, DOMRefValue<HTMLImageElement>>>(null);

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an organization.
 */
export const Avatar = forwardRef(function Avatar(props: AvatarProps, ref: DOMRef<HTMLImageElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AvatarContext);
  let domRef = useDOMRef(ref);
  let {
    alt = '',
    src,
    UNSAFE_style,
    UNSAFE_className = '',
    size = 24,
    isOverBackground,
    slot = 'avatar',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);

  let remSize = size / 16 + 'rem';
  let isLarge = size >= 64;
  return (
    <Image
      {...domProps}
      ref={domRef}
      slot={slot}
      alt={alt}
      UNSAFE_style={{
        ...UNSAFE_style,
        width: remSize,
        height: remSize
      }}
      UNSAFE_className={UNSAFE_className}
      styles={imageStyles({isOverBackground, isLarge}, props.styles)}
      src={src} />
  );
});
