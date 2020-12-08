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
import {ErrorBoundary} from '@react-spectrum/story-utils';
import {RangeSlider} from '../';
import React, {useState} from 'react';
import {SpectrumRangeSliderProps} from '@react-types/slider';
import {storiesOf} from '@storybook/react';

let message = 'Your browser may not support this set of format options.';

storiesOf('Slider/RangeSlider', module)
  .addDecorator(story => (
    <ErrorBoundary message={message}>{story()}</ErrorBoundary>
  ))
  .add(
    'Default',
    () => render({'aria-label': 'Label'})
  )
  .add(
    'label',
    () => render({label: 'Label'})
  )
  .add(
    'isDisabled',
    () => render({label: 'Label', defaultValue: {start: 30, end: 70}, isDisabled: true})
  )
  .add(
    'custom width',
    () => render({label: 'Label', width: '300px'})
  )
  .add(
    'label overflow',
    () => render({label: 'This is a rather long label for this narrow slider element.', maxValue: 1000, width: '100px'})
  )
  .add(
    'showValueLabel: false',
    () => render({label: 'Label', showValueLabel: false})
  )
  .add(
    'formatOptions percent',
    () => render({label: 'Label', minValue: 0, maxValue: 1, step: 0.01, formatOptions: {style: 'percent'}})
  )
  .add(
    'formatOptions centimeter',
    // @ts-ignore TODO why is "unit" even missing? How well is it supported?
    () => render({label: 'Label', maxValue: 1000, formatOptions: {style: 'unit', unit: 'centimeter'}})
  )
  .add(
    'custom valueLabel',
    () => {
      let [state, setState] = useState({start: 20, end: 50});
      return render({label: 'Label', value: state, onChange: setState, valueLabel: `${state.start} <-> ${state.end}`});
    }
  )
  .add(
    'labelPosition: side',
    () => render({label: 'Label', labelPosition: 'side'})
  )
  .add(
    'min/max',
    () => render({label: 'Label', minValue: 30, maxValue: 70})
  );

function render(props: SpectrumRangeSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = (v) => {
      action('change')(v.start, v.end);
    };
  }
  return  <RangeSlider {...props} />;
}
