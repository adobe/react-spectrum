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
import React from 'react';
import {Slider} from '../';
import {SpectrumSliderProps} from '@react-types/slider';
import {storiesOf} from '@storybook/react';

let message = 'Your browser may not support this set of format options.';

storiesOf('Slider', module)
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
    args => render({...args, label: null, 'aria-label': 'Label'})
  )
  .add(
    'label',
    args => render(args)
  )
  .add(
    'multitouch',
    args => (<Flex direction="column" gap="size-1000">
      {render({...args, label: 'Label'})}
      {render({...args, label: 'Label'})}
    </Flex>)
  )
  .add(
    'custom width',
    args => render({...args, width: '300px'})
  )
  .add(
    'custom width small',
    args => render({...args, width: '30px'})
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
    args => render({...args, getValueLabel: state => `A ${state} B`})
  )
  .add(
    'custom valueLabel with label overflow',
    args => render({...args, label: 'This is a rather long label for this narrow slider element.', getValueLabel: state => `A ${state} B`})
  )
  .add(
    'min/max',
    args => render({...args, minValue: 30, maxValue: 70})
  )
  .add(
    'step',
    args => render({...args, minValue: 0, maxValue: 100, step: 5})
  )
  .add(
    'isFilled: true',
    args => render({...args, isFilled: true})
  )
  .add(
    'fillOffset',
    args => render({...args, label: 'Exposure', isFilled: true, fillOffset: 0, defaultValue: 0, minValue: -7, maxValue: 5})
  )
  .add(
    'trackGradient',
    args => render({...args, trackGradient: ['blue', 'red']})
  )
  .add(
    'trackGradient with fillOffset',
    args => render({...args, trackGradient: ['blue', 'red'], isFilled: true, fillOffset: 50})
  )
  .add(
    'contextual help',
    args => render({...args, contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )})
  );
  // .add(
  //   '* orientation: vertical',
  //   args => render({...args, orientation: 'vertical'})
  // );

function render(props: SpectrumSliderProps = {}) {
  if (props.onChange == null) {
    props.onChange = action('change');
  }
  if (props.onChangeEnd == null) {
    props.onChangeEnd = action('changeEnd');
  }
  return <Slider {...props} />;
}
