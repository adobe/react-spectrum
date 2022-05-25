/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {StatusLight} from '../';

type StatusLightStory = ComponentStoryObj<typeof StatusLight>;

export default {
  title: 'StatusLight',
  component: StatusLight
} as ComponentMeta<typeof StatusLight>;

export const Default: StatusLightStory = {
  args: {children: 'Status light of love', variant: 'celery'},
  name: 'variant: celery'
};

export const VariantYellow: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'yellow'},
  name: 'variant: yellow'
};

export const VariantFuchsia: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'fuchsia'},
  name: 'variant: fuchsia'
};

export const VariantIndigo: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'indigo'},
  name: 'variant: indigo'
};

export const VariantSeafoam: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'seafoam'},
  name: 'variant: seafoam'
};

export const VariantChartreuse: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'chartreuse'},
  name: 'variant: chartreuse'
};

export const VariantMagenta: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'magenta'},
  name: 'variant: magenta'
};

export const VariantPurple: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'purple'},
  name: 'variant: purple'
};

export const VariantNeutral: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'neutral'},
  name: 'variant: neutral'
};

export const VariantInfo: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'info'},
  name: 'variant: info'
};

export const VariantPositive: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'positive'},
  name: 'variant: positive'
};

export const VariantNotice: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'notice'},
  name: 'variant: notice'
};

export const VariantNegative: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'negative'},
  name: 'variant: negative'
};

export const IsDisabledTrue: StatusLightStory = {
  ...Default,
  args: {...Default.args, variant: 'positive', isDisabled: true},
  name: 'isDisabled: true'
};
