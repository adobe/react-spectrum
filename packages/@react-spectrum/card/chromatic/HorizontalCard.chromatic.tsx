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

import {Card} from '../index';
import {
  CardStory,
  Default,
  DefaultSquare,
  DefaultTall,
  LongContent,
  LongDetail,
  LongTitle,
  NoDescription,
  NoDescriptionSquare,
  WithIllustration
} from './Card.chromatic';
import {ComponentMeta} from '@storybook/react';
import React from 'react';

export default {
  title: 'Card/horizontal',
  component: Card
} as ComponentMeta<typeof Card>;

export const Horizontal: CardStory = {
  ...Default,
  args: {...Default.args, orientation: 'horizontal'},
  decorators: [
    (Story) => (
      <div style={{height: '90px'}}>
        <Story />
      </div>
    )
  ]
};

export const HorizontalSquare: CardStory = {
  ...DefaultSquare,
  ...Horizontal,
  args: {...DefaultSquare.args, orientation: 'horizontal'}
};

export const HorizontalTall: CardStory = {
  ...DefaultTall,
  ...Horizontal,
  args: {...DefaultTall.args, orientation: 'horizontal'}
};

export const HorizontalNoDescription: CardStory = {
  ...NoDescription,
  ...Horizontal,
  args: {...NoDescription.args, orientation: 'horizontal'}
};

export const HorizontalNoDescriptionSquare: CardStory = {
  ...NoDescriptionSquare,
  ...Horizontal,
  args: {...NoDescriptionSquare.args, orientation: 'horizontal'}
};

export const HorizontalWithIllustration: CardStory = {
  ...WithIllustration,
  ...Horizontal,
  args: {...WithIllustration.args, orientation: 'horizontal'}
};

export const HorizontalLongTitle: CardStory = {
  ...LongTitle,
  ...Horizontal,
  args: {...LongTitle.args, orientation: 'horizontal'}
};

export const HorizontalLongDescription: CardStory = {
  ...LongContent,
  ...Horizontal,
  args: {...LongContent.args, orientation: 'horizontal'}
};

export const HorizontalLongDetail: CardStory = {
  ...LongDetail,
  ...Horizontal,
  args: {...LongDetail.args, orientation: 'horizontal'}
};
