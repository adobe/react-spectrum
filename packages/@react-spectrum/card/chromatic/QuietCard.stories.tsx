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
  LongContentPoorWordSize,
  LongDescription,
  LongDetail,
  LongEverything,
  LongTitle,
  NoDescription,
  NoDescriptionSquare,
  Selected,
  WithIllustration
} from './Card.stories';
import {Meta} from '@storybook/react';

export default {
  title: 'Card/quiet',
  component: Card,
  args: {
    isQuiet: true
  }
} as Meta<typeof Card>;

export const Quiet: CardStory = {
  ...Default
};

export const QuietSquare: CardStory = {
  ...DefaultSquare
};

export const QuietTall: CardStory = {
  ...DefaultTall
};

export const QuietNoDescription: CardStory = {
  ...NoDescription
};

export const QuietNoDescriptionSquare: CardStory = {
  ...NoDescriptionSquare
};

export const QuietWithIllustration: CardStory = {
  ...WithIllustration
};

export const QuietLongTitle: CardStory = {
  ...LongTitle
};

export const QuietLongDescription: CardStory = {
  ...LongDescription
};

export const QuietLongContentPoorWordSize: CardStory = {
  ...LongContentPoorWordSize
};

export const QuietLongDetail: CardStory = {
  ...LongDetail
};

export const QuietLongEverything: CardStory = {
  ...LongEverything
};

export const QuietSelected: CardStory = {
  ...Selected,
  name: 'Selected'
};
