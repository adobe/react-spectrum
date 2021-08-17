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

import {ImgAvatar, ImgAvatarProps} from './ImgAvatar';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {SvgAvatar, SvgAvatarProps} from './SvgAvatar';

const SRC_URL_1 = 'https://i.imgur.com/xIe7Wlb.png';

const meta: Meta<ImgAvatarProps | SvgAvatarProps> = {
  title: 'useAvatar'
};

export default meta;

const ImgAvatarTemplate: Story<ImgAvatarProps> = (args) => (
  <ImgAvatar {...args} />
);

export const ImageTypeAvatar = ImgAvatarTemplate.bind({});
ImageTypeAvatar.args = {alt: 'Pensive', src: SRC_URL_1};
ImageTypeAvatar.storyName = 'img type avatar';

const SvgAvatarTemplate: Story<SvgAvatarProps> = ({src, ...otherArgs}) => (
  <SvgAvatar src={src} {...otherArgs} />
);

export const SvgTypeAvatar = SvgAvatarTemplate.bind({});
SvgTypeAvatar.args = {alt: 'Pensive', src: SRC_URL_1};
SvgTypeAvatar.storyName = 'svg type avatar';
