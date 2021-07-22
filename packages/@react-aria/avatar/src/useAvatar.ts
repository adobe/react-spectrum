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

import {AriaAvatarProps} from '@react-types/avatar';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {ImgHTMLAttributes} from 'react';

interface AriaAvatarOptions extends AriaAvatarProps {
  /**
   * The HTML element used to render the avatar, e.g. 'img', or 'div'.
   *
   * @default 'img'
   */
   elementType?: string
}

interface AvatarAria {
  /**
   * Props for the avatar element.
   */
  avatarProps: ImgHTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for an avatar
 * component. An avatar is a thumbnail representation of an entity, such as a
 * user or an organization.
 */
export function useAvatar(props: AriaAvatarOptions): AvatarAria {
  const {
    elementType = 'img',
    alt = '',
    ...otherProps
  } = props;

  const avatarProps = {
    ...(elementType === 'img' && {alt}),
    ...(elementType !== 'img' && {
      'aria-label': alt,
      role: 'img'
    })
  };

  const domProps = filterDOMProps(otherProps);

  return {
    avatarProps: mergeProps(domProps, avatarProps)
  };
}
