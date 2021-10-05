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

import React from 'react';
import {StatusLight} from '../';

export default {
  title: 'StatusLight',

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const VariantCelery = () => render({variant: 'celery'});

VariantCelery.story = {
  name: 'variant: celery'
};

export const VariantYellow = () => render({variant: 'yellow'});

VariantYellow.story = {
  name: 'variant: yellow'
};

export const VariantFuchsia = () => render({variant: 'fuchsia'});

VariantFuchsia.story = {
  name: 'variant: fuchsia'
};

export const VariantIndigo = () => render({variant: 'indigo'});

VariantIndigo.story = {
  name: 'variant: indigo'
};

export const VariantSeafoam = () => render({variant: 'seafoam'});

VariantSeafoam.story = {
  name: 'variant: seafoam'
};

export const VariantChartreuse = () => render({variant: 'chartreuse'});

VariantChartreuse.story = {
  name: 'variant: chartreuse'
};

export const VariantMagenta = () => render({variant: 'magenta'});

VariantMagenta.story = {
  name: 'variant: magenta'
};

export const VariantPurple = () => render({variant: 'purple'});

VariantPurple.story = {
  name: 'variant: purple'
};

export const VariantNeutral = () => render({variant: 'neutral'});

VariantNeutral.story = {
  name: 'variant: neutral'
};

export const VariantInfo = () => render({variant: 'info'});

VariantInfo.story = {
  name: 'variant: info'
};

export const VariantPositive = () => render({variant: 'positive'});

VariantPositive.story = {
  name: 'variant: positive'
};

export const VariantNotice = () => render({variant: 'notice'});

VariantNotice.story = {
  name: 'variant: notice'
};

export const VariantNegative = () => render({variant: 'negative'});

VariantNegative.story = {
  name: 'variant: negative'
};

export const IsDisabledTrue = () =>
  render({variant: 'positive', isDisabled: true});

IsDisabledTrue.story = {
  name: 'isDisabled: true'
};

function render(props: any = {}) {
  return <StatusLight {...props}>Status light of love</StatusLight>;
}
