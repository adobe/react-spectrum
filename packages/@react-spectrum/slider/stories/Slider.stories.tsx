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

import {action} from '@storybook/addon-actions';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {ErrorBoundary} from '@react-spectrum/story-utils';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {Slider} from '../';
import {SpectrumSliderProps} from '@react-types/slider';

let message = 'Your browser may not support this set of format options.';

export default {
  title: 'Slider',
  decorators: [(story) => <ErrorBoundary message={message}>{story()}</ErrorBoundary>],
  args: {
    label: 'Label',
    isDisabled: false,
    labelPosition: 'top'
  },
  argTypes: {
    labelPosition: {
      control: {
        type: 'radio',
        options: ['top', 'side']
      }
    }
  }
} as Meta<SpectrumSliderProps>;

export type SliderStory = StoryFn<typeof Slider>;

export const Default: SliderStory = (args) => render({...args, label: null, 'aria-label': 'Label'});
export const Label: SliderStory = (args) => render(args);

Label.story = {
  name: 'label'
};

export const Multitouch: SliderStory = (args) => (
  <Flex direction="column" gap="size-1000">
    {render({...args, label: 'Label'})}
    {render({...args, label: 'Label'})}
  </Flex>
);

Multitouch.story = {
  name: 'multitouch'
};

export const CustomWidth: SliderStory = (args) => render({...args, width: '300px'});

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthSmall: SliderStory = (args) => render({...args, width: '30px'});

CustomWidthSmall.story = {
  name: 'custom width small'
};

export const LabelOverflow: SliderStory = (args) =>
  render({
    ...args,
    label: 'This is a rather long label for this narrow slider element.',
    maxValue: 1000,
    width: '300px'
  });

LabelOverflow.story = {
  name: 'label overflow'
};

export const ShowValueLabelFalse: SliderStory = (args) => render({...args, showValueLabel: false});

ShowValueLabelFalse.story = {
  name: 'showValueLabel: false'
};

export const FormatOptionsPercent: SliderStory = (args) =>
  render({...args, minValue: 0, maxValue: 1, step: 0.01, formatOptions: {style: 'percent'}});

FormatOptionsPercent.story = {
  name: 'formatOptions percent'
};

export const FormatOptionsCentimeter: SliderStory = (args) =>
  render({...args, maxValue: 1000, formatOptions: {style: 'unit', unit: 'centimeter'}});

FormatOptionsCentimeter.story = {
  name: 'formatOptions centimeter'
};

export const CustomValueLabel: SliderStory = (args) =>
  render({...args, getValueLabel: (state) => `A ${state} B`});

CustomValueLabel.story = {
  name: 'custom valueLabel'
};

export const CustomValueLabelWithLabelOverflow: SliderStory = (args) =>
  render({
    ...args,
    label: 'This is a rather long label for this narrow slider element.',
    getValueLabel: (state) => `A ${state} B`
  });

CustomValueLabelWithLabelOverflow.story = {
  name: 'custom valueLabel with label overflow'
};

export const MinMax: SliderStory = (args) => render({...args, minValue: 30, maxValue: 70});

MinMax.story = {
  name: 'min/max'
};

export const Step: SliderStory = (args) => render({...args, minValue: 0, maxValue: 100, step: 5});

Step.story = {
  name: 'step'
};

export const IsFilledTrue: SliderStory = (args) => render({...args, isFilled: true});

IsFilledTrue.story = {
  name: 'isFilled: true'
};

export const FillOffset: SliderStory = (args) =>
  render({
    ...args,
    label: 'Exposure',
    isFilled: true,
    fillOffset: 0,
    defaultValue: 0,
    minValue: -7,
    maxValue: 5
  });

FillOffset.story = {
  name: 'fillOffset'
};

export const TrackGradient: SliderStory = (args) => render({...args, trackGradient: ['blue', 'red']});

TrackGradient.story = {
  name: 'trackGradient'
};

export const TrackGradientWithFillOffset: SliderStory = (args) =>
  render({...args, trackGradient: ['blue', 'red'], isFilled: true, fillOffset: 50});

TrackGradientWithFillOffset.story = {
  name: 'trackGradient with fillOffset'
};

export const _ContextualHelp: SliderStory = (args) =>
  render({
    ...args,
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>
          Segments identify who your visitors are, what devices and services they use, where they
          navigated from, and much more.
        </Content>
      </ContextualHelp>
    )
  });

_ContextualHelp.story = {
  name: 'contextual help'
};

function render(props: SpectrumSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = action('change');
  }
  if (props.onChangeEnd == null) {
    props.onChangeEnd = action('changeEnd');
  }
  return <Slider {...props} />;
}
