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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Image} from '../';
import React, {useState} from 'react';

export type ImageStory = ComponentStoryObj<typeof Image>;

let meta = {
  title: 'Image',
  component: Image
} as ComponentMeta<typeof Image>;

export default meta;

export const Default: ImageStory = {
  render: (args) => {
    return (
      <Image
        {...args}
        width={'500px'}
        height={'500px'}
        src="https://i.imgur.com/Z7AzH2c.png"
        alt="Sky and roof" />
    );
  },
  parameters: {description: {data: 'You should see a 500x500 image of the sky and a roof.'}}
};

let ImageErrorExample = (props) => {
  const [isImageMissing, setIsImageMissing] = useState(false);
  const DEFAULT_IMAGE = 'https://i.imgur.com/DhygPot.jpg';

  const onErrorHandler = () => {
    setIsImageMissing(true);
  };
  return (
    <Image
      {...props}
      width={'500px'}
      height={'500px'}
      src={
        isImageMissing ? DEFAULT_IMAGE : 'https://i.imgur.com/Z7AzH2332c.png'
      }
      alt="starry sky"
      onError={onErrorHandler} />
  );
};

export const ImageOnError: ImageStory = {
  render: (args) => <ImageErrorExample {...args} />,
  parameters: {description: {data: 'You should see a picture of a starry night sky, that is the fallback image.'}}
};
