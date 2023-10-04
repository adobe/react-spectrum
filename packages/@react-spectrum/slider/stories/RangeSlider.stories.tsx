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
import {Heading} from '@react-spectrum/text';
import {RangeSlider} from '../';
import React from 'react';
import {SpectrumRangeSliderProps} from '@react-types/slider';

let message = 'Your browser may not support this set of format options.';

export default {
  title: 'Slider/RangeSlider',
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
};

export const Default = (args) => render({...args, 'aria-label': 'Label', label: undefined});
export const Label = (args) => render(args);

Label.story = {
  name: 'label'
};

export const CustomWidth = (args) => render({...args, width: '300px'});

CustomWidth.story = {
  name: 'custom width'
};

export const LabelOverflow = (args) =>
  render({
    ...args,
    label: 'This is a rather long label for this narrow slider element.',
    maxValue: 1000,
    width: '300px'
  });

LabelOverflow.story = {
  name: 'label overflow'
};

export const ShowValueLabelFalse = (args) => render({...args, showValueLabel: false});

ShowValueLabelFalse.story = {
  name: 'showValueLabel: false'
};

export const FormatOptionsPercent = (args) =>
  render({...args, minValue: 0, maxValue: 1, step: 0.01, formatOptions: {style: 'percent'}});

FormatOptionsPercent.story = {
  name: 'formatOptions percent'
};

export const FormatOptionsCentimeter = (args) => // @ts-ignore TODO why is "unit" even missing? How well is it supported?
  render({...args, maxValue: 1000, formatOptions: {style: 'unit', unit: 'centimeter'}});

FormatOptionsCentimeter.story = {
  name: 'formatOptions centimeter'
};

export const CustomValueLabel = (args) =>
  render({...args, getValueLabel: (value) => `${value.start} <-> ${value.end}`});

CustomValueLabel.story = {
  name: 'custom valueLabel'
};

export const CustomValueLabelWithLabelOverflow = (args) =>
  render({
    ...args,
    label: 'This is a rather long label for this narrow slider element.',
    getValueLabel: (value) => `${value.start} <-> ${value.end}`
  });

CustomValueLabelWithLabelOverflow.story = {
  name: 'custom valueLabel with label overflow'
};

export const MinMax = (args) => render({...args, minValue: 30, maxValue: 70});

MinMax.story = {
  name: 'min/max'
};

export const _ContextualHelp = (args) =>
  render({
    ...args,
    label: 'Label',
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

function render(props: SpectrumRangeSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = (v) => {
      action('change')(v.start, v.end);
    };
  }
  if (props.onChangeEnd == null) {
    props.onChangeEnd = (v) => {
      action('changeEnd')(v.start, v.end);
    };
  }
  return <RangeSlider {...props} />;
}
