/*
 * Copyright 2021 Adobe. All rights reserved.
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

export interface AvatarProps {
  /**
   * Text description of the avatar.
   *
   * @default null
   */
  alt?: string,
  /**
   * The image URL for the avatar.
   */
  src: string
}

export interface SpectrumAvatarProps extends AvatarProps, DOMProps, Omit<StyleProps, 'width' | 'height'> {
  /**
   * Whether the avatar is disabled.
   */
  isDisabled?: boolean,
  /**
   * Size of the avatar. Affects both height and width.
   *
   * @default avatar-size-100
   */
  size?:
    | 'avatar-size-50'
    | 'avatar-size-75'
    | 'avatar-size-100'
    | 'avatar-size-200'
    | 'avatar-size-300'
    | 'avatar-size-400'
    | 'avatar-size-500'
    | 'avatar-size-600'
    | 'avatar-size-700'
    // This allows autocomplete to work properly and not collapse the above options into just `string`.
    // See https://github.com/microsoft/TypeScript/issues/29729.
    | (string & {})
    | number
}
