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

export interface ImgAvatarProps extends AriaAvatarProps<'img'> {
  src: string
}

export const ImgAvatar = ({src, ...otherProps}: ImgAvatarProps) => {
  const {avatarProps: {alt, ...otherAvatarProps}} = useAvatar({...otherProps, elementType: 'img'});

  return (<img alt={alt} src={src} style={{height: '50px', width: '50px', borderRadius: '50%'}} {...otherAvatarProps} />);
};
