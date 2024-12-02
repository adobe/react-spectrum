// @ts-nocheck
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
} from './Card.stories';
import {ComponentMeta} from '@storybook/react';
import React from 'react';

export default {
  title: 'Card/horizontal',
  component: Card,
  args: {
    orientation: 'horizontal'
  }
} as ComponentMeta<typeof Card>;

export const Horizontal: CardStory = {
  ...Default,
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
  args: {...DefaultSquare.args}
};

export const HorizontalTall: CardStory = {
  ...DefaultTall,
  ...Horizontal,
  args: {...DefaultTall.args}
};

export const HorizontalNoDescription: CardStory = {
  ...NoDescription,
  ...Horizontal,
  args: {...NoDescription.args}
};

export const HorizontalNoDescriptionSquare: CardStory = {
  ...NoDescriptionSquare,
  ...Horizontal,
  args: {...NoDescriptionSquare.args}
};

export const HorizontalWithIllustration: CardStory = {
  ...WithIllustration,
  ...Horizontal,
  args: {...WithIllustration.args}
};

export const HorizontalLongTitle: CardStory = {
  ...LongTitle,
  ...Horizontal,
  args: {...LongTitle.args}
};

export const HorizontalLongDescription: CardStory = {
  ...LongContent,
  ...Horizontal,
  args: {...LongContent.args}
};

export const HorizontalLongDetail: CardStory = {
  ...LongDetail,
  ...Horizontal,
  args: {...LongDetail.args}
};
