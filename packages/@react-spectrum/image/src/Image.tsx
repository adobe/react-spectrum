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

import {classNames, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {ReactEventHandler} from 'react';
import styles from '@adobe/spectrum-css-temp/components/image/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

export interface ImageProps {
  /**
   * The URL of the image.
   */
  src: string,
  /**
   * Text description of the image.
   */
  alt?: string,
  /**
   * Sets the Image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) style.
   */
  objectFit?: any, // move to styleProps for images and type better
  /**
   * Called if an error occurs while loading or rendering an image, see [Image loading errors](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#image_loading_errors).
   */
  onError?: ReactEventHandler<HTMLImageElement>,
  /**
   * Called when the image has successfully loaded, see [load event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/load_event).
   */
  onLoad?: ReactEventHandler<HTMLImageElement>,
  /**
   * Indicates if the fetching of the image must be done using a CORS request.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin).
   */
  crossOrigin?: 'anonymous' | 'use-credentials'
}

export interface SpectrumImageProps extends ImageProps, DOMProps, StyleProps {
  /**
   * A slot to place the image in.
   * @default 'image'
   */
  slot?: string
}

/**
 * Image is used to insert and display an image within a component.
 */
export const Image = React.forwardRef(// incomplete component for show right now

function Image(props: SpectrumImageProps, ref: DOMRef<HTMLDivElement>) {
  /* Slots should be able to pass an alt for default behavior, but in Images, the child may know better. */
  let userProvidedAlt = props.alt;
  props = useSlotProps(props, 'image');
  props = useProviderProps(props);
  let {
    objectFit,
    src,
    alt,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  if (alt == null && process.env.NODE_ENV !== 'production') {
    console.warn(
      'The `alt` prop was not provided to an image. ' +
      'Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be announced by screen readers.'
    );
  }

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      className={classNames(styles, styleProps.className)}
      style={{
        ...styleProps.style,
        overflow: 'hidden'
      }}
      ref={domRef}>
      <img
        src={src}
        alt={userProvidedAlt || alt}
        style={{objectFit}}
        className={classNames(styles, 'spectrum-Image-img')} 
        onError={props?.onError}
        onLoad={props?.onLoad} 
        crossOrigin={props?.crossOrigin} />
    </div>
  );
});
