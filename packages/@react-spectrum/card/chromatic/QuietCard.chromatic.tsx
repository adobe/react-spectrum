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
  NoDescriptionSquare, Selected,
  WithIllustration
} from './Card.chromatic';
import {ComponentMeta} from '@storybook/react';
import React from 'react';

export default {
  title: 'Card/quiet',
  component: Card
} as ComponentMeta<typeof Card>;

export const Quiet: CardStory = {
  ...Default,
  args: {...Default.args, isQuiet: true}
};

export const QuietSquare = {
  ...DefaultSquare,
  args: {...DefaultSquare.args, isQuiet: true}
};

export const QuietTall = {
  ...DefaultTall,
  args: {...DefaultTall.args, isQuiet: true}
};

export const QuietNoDescription = {
  ...NoDescription,
  args: {...NoDescription.args, isQuiet: true}
};

export const QuietNoDescriptionSquare = {
  ...NoDescriptionSquare,
  args: {...NoDescriptionSquare.args, isQuiet: true}
};

export const QuietWithIllustration = {
  ...WithIllustration,
  args: {...WithIllustration.args, isQuiet: true}
};

export const QuietLongTitle = {
  ...LongTitle,
  args: {...LongTitle.args, isQuiet: true}
};

export const QuietLongDescription = {
  ...LongDescription,
  args: {...LongDescription.args, isQuiet: true}
};

export const QuietLongContentPoorWordSize = {
  ...LongContentPoorWordSize,
  args: {...LongContentPoorWordSize.args, isQuiet: true}
};

export const QuietLongDetail = {
  ...LongDetail,
  args: {...LongDetail.args, isQuiet: true}
};

export const QuietLongEverything = {
  ...LongEverything,
  args: {...LongEverything.args, isQuiet: true}
};

export const QuietSelected = {
  ...Selected,
  args: {...Selected.args, isQuiet: true},
  name: 'Selected'
};
