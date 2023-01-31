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
import {storiesOf} from '@storybook/react';

let message = 'Your browser may not support this set of format options.';

storiesOf('Slider/RangeSlider', module)
  .addDecorator(story => (
    <ErrorBoundary message={message}>{story()}</ErrorBoundary>
  ))
  .addParameters({
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
  })
  .add(
    'Default',
    args => render({...args, 'aria-label': 'Label'})
  )
  .add(
    'label',
    args => render(args)
  )
  .add(
    'custom width',
    args => render({...args, width: '300px'})
  )
  .add(
    'label overflow',
    args => render({...args, label: 'This is a rather long label for this narrow slider element.', maxValue: 1000, width: '300px'})
  )
  .add(
    'showValueLabel: false',
    args => render({...args, showValueLabel: false})
  )
  .add(
    'formatOptions percent',
    args => render({...args, minValue: 0, maxValue: 1, step: 0.01, formatOptions: {style: 'percent'}})
  )
  .add(
    'formatOptions centimeter',
    // @ts-ignore TODO why is "unit" even missing? How well is it supported?
    args => render({...args, maxValue: 1000, formatOptions: {style: 'unit', unit: 'centimeter'}})
  )
  .add(
    'custom valueLabel',
    args => render({...args, getValueLabel: (value) => `${value.start} <-> ${value.end}`})
  )
  .add(
    'custom valueLabel with label overflow',
    args => render({...args, label: 'This is a rather long label for this narrow slider element.', getValueLabel: (value) => `${value.start} <-> ${value.end}`})
  )
  .add(
    'min/max',
    args => render({...args, minValue: 30, maxValue: 70})
  )
  .add(
    'contextual help',
    args => render({...args, label: 'Label', contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )})
  );

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
  return  <RangeSlider {...props} />;
}
