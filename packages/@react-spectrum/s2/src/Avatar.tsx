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

import {ContextValue, useContextProps} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import {DOMProps, DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {Image} from './Image';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';

export interface AvatarProps extends UnsafeStyles, DOMProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface AvatarContextProps extends UnsafeStyles, DOMProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

const imageStyles = style({
  borderRadius: 'full',
  size: 20,
  disableTapHighlight: true,
  pointerEvents: 'none',
  userSelect: 'none',
  flexShrink: 0
}, getAllowedOverrides({height: true}));

export const AvatarContext = createContext<ContextValue<AvatarContextProps, HTMLDivElement>>({});

function Avatar(props: AvatarProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, AvatarContext);
  let {
    alt = '',
    src,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);

  return (
    <Image
      {...domProps}
      ref={domRef}
      alt={alt}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}
      styles={imageStyles(null, props.styles)}
      src={src} />
  );
}

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an organization.
 */
let _Avatar = forwardRef(Avatar);
export {_Avatar as Avatar};
