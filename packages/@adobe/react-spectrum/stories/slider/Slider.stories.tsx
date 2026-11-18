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

import {action} from 'storybook/actions';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {ErrorBoundary} from '@react-spectrum/story-utils';
import {Flex} from '../../src/layout/Flex';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {Slider, SpectrumSliderProps} from '../../src/slider/Slider';

let message = 'Your browser may not support this set of format options.';

export default {
  title: 'Slider',
  decorators: [story => <ErrorBoundary message={message}>{story()}</ErrorBoundary>],
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

export type SliderStory = StoryObj<typeof Slider>;

export const Default: SliderStory = {
  render: args => render({...args, label: null, 'aria-label': 'Label'})
};
export const Label: SliderStory = {
  render: args => render(args),
  name: 'label'
};

export const Multitouch: SliderStory = {
  render: args => (
    <Flex direction="column" gap="size-1000">
      {render({...args, label: 'Label'})}
      {render({...args, label: 'Label'})}
    </Flex>
  ),
  name: 'multitouch'
};

export const CustomWidth: SliderStory = {
  render: args => render({...args, width: '300px'}),
  name: 'custom width'
};

export const CustomWidthSmall: SliderStory = {
  render: args => render({...args, width: '30px'}),
  name: 'custom width small'
};

export const LabelOverflow: SliderStory = {
  render: args =>
    render({
      ...args,
      label: 'This is a rather long label for this narrow slider element.',
      maxValue: 1000,
      width: '300px'
    }),
  name: 'label overflow'
};

export const ShowValueLabelFalse: SliderStory = {
  render: args => render({...args, showValueLabel: false}),
  name: 'showValueLabel: false'
};

export const FormatOptionsPercent: SliderStory = {
  render: args =>
    render({...args, minValue: 0, maxValue: 1, step: 0.01, formatOptions: {style: 'percent'}}),
  name: 'formatOptions percent'
};

export const FormatOptionsCentimeter: SliderStory = {
  render: args =>
    render({...args, maxValue: 1000, formatOptions: {style: 'unit', unit: 'centimeter'}}),
  name: 'formatOptions centimeter'
};

export const CustomValueLabel: SliderStory = {
  render: args => render({...args, getValueLabel: state => `A ${state} B`}),
  name: 'custom valueLabel'
};

export const CustomValueLabelWithLabelOverflow: SliderStory = {
  render: args =>
    render({
      ...args,
      label: 'This is a rather long label for this narrow slider element.',
      getValueLabel: state => `A ${state} B`
    }),
  name: 'custom valueLabel with label overflow'
};

export const MinMax: SliderStory = {
  render: args => render({...args, minValue: 30, maxValue: 70}),
  name: 'min/max'
};

export const Step: SliderStory = {
  render: args => render({...args, minValue: 0, maxValue: 100, step: 5}),
  name: 'step'
};

export const IsFilledTrue: SliderStory = {
  render: args => render({...args, isFilled: true}),
  name: 'isFilled: true'
};

export const FillOffset: SliderStory = {
  render: args =>
    render({
      ...args,
      label: 'Exposure',
      isFilled: true,
      fillOffset: 0,
      defaultValue: 0,
      minValue: -7,
      maxValue: 5
    }),
  name: 'fillOffset'
};

export const TrackGradient: SliderStory = {
  render: args => render({...args, trackGradient: ['blue', 'red']}),
  name: 'trackGradient'
};

export const TrackGradientWithFillOffset: SliderStory = {
  render: args => render({...args, trackGradient: ['blue', 'red'], isFilled: true, fillOffset: 50}),
  name: 'trackGradient with fillOffset'
};

export const _ContextualHelp: SliderStory = {
  render: args =>
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
    }),
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
