/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {ComponentMeta} from '@storybook/react';
import {TooltipTrigger} from '../';
import {default as tooltipTriggerDefault} from './TooltipTrigger.stories';

export default {
  ...tooltipTriggerDefault,
  title: 'TooltipTriggerRTL',
  component: TooltipTrigger,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['ar-AE'],
      scales: ['large'],
      disableAnimations: true,
      express: false
    },
    // chromatic needs a bit more time than disableAnimations allows
    chromatic: {
      pauseAnimationAtEnd: true
    }
  }
} as ComponentMeta<typeof TooltipTrigger>;

export {
  Default,
  PlacementStart,
  PlacementEnd,
  Offset50,
  CrossOffset50,
  ContainerPadding50AtEdge,
  ArrowPositioningAtEdge,
  PlacementNoFlip
} from './TooltipTrigger.stories';
