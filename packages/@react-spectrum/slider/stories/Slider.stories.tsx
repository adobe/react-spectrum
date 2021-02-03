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
import {Flex} from '@adobe/react-spectrum';
import React from 'react';
import {Slider} from '../';
import {SpectrumSliderProps} from '@react-types/slider';
import {storiesOf} from '@storybook/react';

let message = 'Your browser may not support this set of format options.';

storiesOf('Slider', module)
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
    'multitouch',
    () => (<Flex direction="column" gap="size-1000">
      {render({label: 'Label'})}
      {render({label: 'Label'})}
    </Flex>)
  )
  .add(
    'isDisabled',
    () => render({label: 'Label', defaultValue: 50, isDisabled: true})
  )
  .add(
    'custom width',
    () => render({label: 'Label', width: '300px'})
  )
  .add(
    'custom width small',
    () => render({label: 'Label', width: '30px'})
  )
  .add(
    'label overflow',
    () => render({label: 'This is a rather long label for this narrow slider element.', maxValue: 1000, width: '300px'})
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
    () => render({label: 'Label', getValueLabel: state => `A ${state} B`})
  )
  .add(
    'custom valueLabel with label overflow',
    () => render({label: 'This is a rather long label for this narrow slider element.', getValueLabel: state => `A ${state} B`})
  )
  .add(
    'labelPosition: side',
    () => render({label: 'Label', labelPosition: 'side'})
  )
  .add(
    'labelPosition: side, customWidth',
    () => render({label: 'Label', labelPosition: 'side', width: '400px'})
  )
  .add(
    'labelPosition: side, customWidth small',
    () => render({label: 'Label', labelPosition: 'side', width: '30px'})
  )
  .add(
    'min/max',
    () => render({label: 'Label', minValue: 30, maxValue: 70})
  )
  .add(
    'step',
    () => render({label: 'Label', minValue: 0, maxValue: 100, step: 5})
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
    'trackGradient',
    () => render({label: 'Label', trackGradient: ['blue', 'red']})
  )
  .add(
    'trackGradient with fillOffset',
    () => render({label: 'Label', trackGradient: ['blue', 'red'], isFilled: true, fillOffset: 50})
  );
  // .add(
  //   '* orientation: vertical',
  //   () => render({label: 'Label', orientation: 'vertical'})
  // );

function render(props: SpectrumSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = action('change');
  }
  return <Slider {...props} />;
}
