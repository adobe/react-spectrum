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

import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactEventHandler} from 'react';

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
  onLoad?: ReactEventHandler<HTMLImageElement>
}

export interface SpectrumImageProps extends ImageProps, DOMProps, StyleProps {
  /**
   * A slot to place the image in.
   * @default 'image'
   */
  slot?: string
}
