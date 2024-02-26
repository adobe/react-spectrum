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
import {ComponentMeta, ComponentStory} from '@storybook/react';
import {Image, SpectrumImageProps} from '../';
import React, {useState} from 'react';

let meta = {
  title: 'Image',
  component: Image
} as ComponentMeta<typeof Image>;

export default meta;

export const Default: ComponentStory<typeof Image> = (
  args: SpectrumImageProps
) => {
  return (
    <Image
      {...args}
      width={'500px'}
      height={'500px'}
      src="https://i.imgur.com/Z7AzH2c.png"
      alt="Sky and roof" />
  );
};

export const ImageOnError: ComponentStory<typeof Image> = (
  args: SpectrumImageProps
) => {
  const [isImageMissing, setIsImageMissing] = useState(false);
  const DEFAULT_IMAGE = 'https://i.imgur.com/DhygPot.jpg';

  const onErrorHandler = () => {
    setIsImageMissing(true);
  };
  return (
    <Image
      {...args}
      width={'500px'}
      height={'500px'}
      src={
        isImageMissing ? DEFAULT_IMAGE : 'https://i.imgur.com/Z7AzH2332c.png'
      }
      alt="starry sky"
      onError={onErrorHandler} />
  );
};
