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
import React, {useState} from 'react';
import {Slider} from '../';
import {SpectrumSliderProps} from '@react-types/slider';
import {storiesOf} from '@storybook/react';

storiesOf('Slider', module)
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
    () => render({label: 'Label', defaultValue: 50, isDisabled: true})
  )
  .add(
    'custom width',
    () => render({label: 'Label', width: '200px'})
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
      let [state, setState] = useState(0);
      return render({label: 'Label', value: state, onChange: setState, valueLabel: `A ${state} B`});
    }
  )
  .add(
    'labelPosition: side',
    () => render({label: 'Label', labelPosition: 'side'})
  )
  .add(
    'min/max',
    () => render({label: 'Label', minValue: 30, maxValue: 70})
  )
  .add(
    'step',
    () => render({label: 'Label', minValue: 0, maxValue: 100, step: 10})
  )
  .add(
    'isFilled: true',
    () => render({label: 'Label', isFilled: true})
  )
  .add(
    'fillOffset',
    () => render({label: 'Exposure', isFilled: true, fillOffset: 0, defaultValue: 0, minValue: -7, maxValue: 5})
  )
  .add(
    'ticks',
    () => render({label: 'Label', tickCount: 4})
  )
  .add(
    'showTickLabels: true',
    () => render({label: 'Label', tickCount: 4, showTickLabels: true})
  )
  .add(
    'showTickLabels, custom formatOptions',
    // @ts-ignore
    () => render({label: 'Label', tickCount: 5, showTickLabels: true, minValue: -10, maxValue: 10, width: '200px', formatOptions: {style: 'unit', unit: 'centimeter'}})
  )
  .add(
    'tickLabels',
    () => render({label: 'Label', tickCount: 3, showTickLabels: true, tickLabels: ['A', 'B', 'C']})
  )
  .add(
    'trackGradient',
    () => render({label: 'Label', trackGradient: ['blue', 'red']})
  )
  .add(
    'trackGradient with fillOffset',
    () => render({label: 'Label', trackGradient: ['blue', 'red'], isFilled: true, fillOffset: 50})
  )
  .add(
    '* orientation: vertical',
    () => render({label: 'Label', orientation: 'vertical'})
  );

function render(props: SpectrumSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = action('change');
  }
  return <Slider {...props} />;
}
