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

import {classNames, filterDOMProps, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React from 'react';
import {SpectrumImageProps} from '@react-types/image';
import {useProviderProps} from '@react-spectrum/provider';

// incomplete component for show right now

function Image(props: SpectrumImageProps, ref: DOMRef<HTMLDivElement>) {
  props = useSlotProps(props, 'image');
  let {
    loaded,
    isPlaceholder,
    objectFit,
    src,
    decorative,
    alt,
    ...otherProps
  } = useProviderProps(props);
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  if (decorative) {
    alt = '';
  }

  if (alt == null) {
    console.warn(
      'Neither the `alt` prop or `decorative` were provided to an image. ' +
      'Add `alt` text for screen readers, or enable the `decorative` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be annouced by screen readers.'
    );
  }

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      className={classNames({}, styleProps.className)}
      style={{overflow: 'hidden'}}
      ref={domRef}>
      <img
        className={classNames({}, 'react-spectrum-Image', {
          'is-loaded': loaded,
          'is-placeholder': isPlaceholder
        })}
        src={src}
        alt={alt}
        style={{objectFit, height: '100%', width: '100%'}} />
    </div>
  );
}

const _Image = React.forwardRef(Image);
export {_Image as Image};
