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
import {ElementType, HTMLAttributes, ImgHTMLAttributes, SVGAttributes} from 'react';
import {filterDOMProps, mergeProps} from '@react-aria/utils';


interface AvatarAria<T> {
  /**
   * Props for the avatar element.
   */
  avatarProps: T
}

/**
 * Provides the behavior and accessibility implementation for an avatar
 * component. An avatar is a thumbnail representation of an entity, such as a
 * user or an organization.
 */
export function useAvatar(props: AriaAvatarProps<'div'>): AvatarAria<HTMLAttributes<HTMLDivElement>>;
export function useAvatar(props: AriaAvatarProps<'img'>): AvatarAria<ImgHTMLAttributes<HTMLImageElement>>;
export function useAvatar(props: AriaAvatarProps<'svg'>): AvatarAria<SVGAttributes<SVGElement>>;
export function useAvatar(props: AriaAvatarProps<ElementType>): AvatarAria<HTMLAttributes<HTMLElement> | SVGAttributes<SVGElement>> {
  const {
    elementType = 'img',
    alt = '',
    ...otherProps
  } = props;

  const avatarProps = {
    ...(elementType === 'img' && {alt}),
    ...(elementType !== 'img' && alt && {
      'aria-label': alt,
      role: 'img'
    }),
    ...(elementType !== 'img' && !alt && {
      role: 'presentation'
    })
  };

  const domProps = filterDOMProps(otherProps);

  return {
    avatarProps: mergeProps(domProps, avatarProps)
  };
}
