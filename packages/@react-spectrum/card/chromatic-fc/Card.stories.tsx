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

import {Card} from '..';
import {
  CardStory,
  WithColorfulIllustration as WithColorfulIllustrationStory,
  WithIllustration as WithIllustrationStory
} from '../chromatic/Card.stories';
import {ComponentMeta} from '@storybook/react';
import {
  Default as DefaultCard,
  Selected as SelectedStory
} from '../stories/Card.stories';

export default {
  title: 'Card/default',
  component: Card,
  excludeStories: ['WithColorfulIllustratedMessage']
} as ComponentMeta<typeof Card>;

export const Default: CardStory = DefaultCard;

export const WithIllustration: CardStory = WithIllustrationStory;

export const WithColorfulIllustration: CardStory = WithColorfulIllustrationStory;

export const Selected: CardStory = SelectedStory;
