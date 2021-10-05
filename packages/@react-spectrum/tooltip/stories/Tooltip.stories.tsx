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
import {Tooltip} from '../src';

export default {
  title: 'Tooltip'
};

export const Default = () => render('This is a tooltip.');

Default.story = {
  name: 'default'
};

export const PlacementLeft = () =>
  render('This is a tooltip.', {placement: 'left'});

PlacementLeft.story = {
  name: 'placement: left'
};

export const PlacementRight = () =>
  render('This is a tooltip.', {placement: 'right'});

PlacementRight.story = {
  name: 'placement: right'
};

export const PlacementTop = () =>
  render('This is a tooltip.', {placement: 'top'});

PlacementTop.story = {
  name: 'placement: top'
};

export const PlacementBottom = () =>
  render('This is a tooltip.', {placement: 'bottom'});

PlacementBottom.story = {
  name: 'placement: bottom'
};

export const VariantNeutral = () =>
  render('This is a tooltip.', {variant: 'neutral'});

VariantNeutral.story = {
  name: 'variant: neutral'
};

export const VariantPositive = () =>
  render('This is a tooltip.', {variant: 'positive'});

VariantPositive.story = {
  name: 'variant: positive'
};

export const VariantNegative = () =>
  render('This is a tooltip.', {variant: 'negative'});

VariantNegative.story = {
  name: 'variant: negative'
};

export const VariantInfo = () =>
  render('This is a tooltip.', {variant: 'info'});

VariantInfo.story = {
  name: 'variant: info'
};

export const VariantNeutralIcon = () =>
  render('This is a tooltip.', {variant: 'neutral', showIcon: true});

VariantNeutralIcon.story = {
  name: 'variant: neutral, icon'
};

export const VariantPositiveIcon = () =>
  render('This is a tooltip.', {variant: 'positive', showIcon: true});

VariantPositiveIcon.story = {
  name: 'variant: positive, icon'
};

export const VariantNegativeIcon = () =>
  render('This is a tooltip.', {variant: 'negative', showIcon: true});

VariantNegativeIcon.story = {
  name: 'variant: negative, icon'
};

export const VariantInfoIcon = () =>
  render('This is a tooltip.', {variant: 'info', showIcon: true});

VariantInfoIcon.story = {
  name: 'variant: info, icon'
};

export const LongContent = () => render(longMarkup);

LongContent.story = {
  name: 'long content'
};

const longMarkup = (
  <div>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames
    ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget,
    tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
    ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est
    et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed,
    commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
    condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.
  </div>
);

function render(content, props = {}) {
  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip {...props} isOpen>
        {content}
      </Tooltip>
    </div>
  );
}
