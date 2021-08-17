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
import React from 'react';
import {useAvatar} from '..';

export interface SvgAvatarProps extends AriaAvatarProps<'svg'> {
  src: string
}

export const SvgAvatar = (props: SvgAvatarProps) => {
  const {src, ...otherProps} = props;
  const {avatarProps} = useAvatar({...otherProps, elementType: 'svg'});

  return (
    <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" style={{borderRadius: '50%'}} {...avatarProps}>
      <image href={src} height="50" width="50" />
    </svg>
  );
};
