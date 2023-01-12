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
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Checkbox} from '@react-spectrum/checkbox';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import React, {useState} from 'react';
import {SpectrumToastOptions} from '../src/ToastContainer';
import {storiesOf} from '@storybook/react';
import {ToastContainer, ToastQueue} from '../';

storiesOf('Toast', module)
  .addParameters({
    args: {
      shouldCloseOnAction: false,
      timeout: null
    },
    argTypes: {
      timeout: {
        control: {
          type: 'radio',
          options: [null, 5000]
        }
      }
    }
  })
  .addDecorator((story, {parameters}) => (
    <>
      {!parameters.disableToastContainer && <ToastContainer />}
      {story()}
    </>
  ))
  .add(
    'Default',
    args => <RenderProvider {...args} />
  )
  .add(
    'With action',
    args => <RenderProvider {...args} actionLabel="Action" onAction={action('onAction')} />
  )
  .add(
    'With dialog',
    args => (
      <DialogTrigger isDismissable>
        <Button variant="accent">Open dialog</Button>
        <Dialog>
          <Heading>Toasty</Heading>
          <Content>
            <RenderProvider {...args} />
          </Content>
        </Dialog>
      </DialogTrigger>
    )
  )
  .add(
    'multiple ToastContainers',
    args => <Multiple {...args} />,
    {disableToastContainer: true}
  )
  .add(
    'programmatically closing',
    args => <ToastToggle {...args} />
  );

function RenderProvider(options: SpectrumToastOptions) {
  return (
    <ButtonGroup>
      <Button
        onPress={() => ToastQueue.neutral('Toast available', {...options, onClose: action('onClose')})}
        variant="secondary">
        Show Neutral Toast
      </Button>
      <Button
        onPress={() => ToastQueue.positive('Toast is done!', {...options, onClose: action('onClose')})}
        variant="primary">
        Show Positive Toast
      </Button>
      <Button
        onPress={() => ToastQueue.negative('Toast is burned!', {...options, onClose: action('onClose')})}
        variant="negative">
        Show Negative Toast
      </Button>
      <Button
        onPress={() => ToastQueue.info('Toasting…', {...options, onClose: action('onClose')})}
        variant="accent"
        style="outline">
        Show Info Toast
      </Button>
    </ButtonGroup>
  );
}

function ToastToggle(options: SpectrumToastOptions) {
  let [close, setClose] = useState(null);

  return (
    <Button
      onPress={() => {
        if (!close) {
          let close = ToastQueue.negative('Unable to save', {...options, onClose: () => setClose(null)});
          setClose(() => close);
        } else {
          close();
        }
      }}
      variant="primary">
      {close ? 'Hide' : 'Show'} Toast
    </Button>
  );
}

function Multiple(options: SpectrumToastOptions) {
  let [isMounted1, setMounted1] = useState(true);

  return (
    <Flex direction="column">
      <Checkbox isSelected={isMounted1} onChange={setMounted1}>First mounted</Checkbox>
      {isMounted1 && <ToastContainer />}
      <MultipleInner />
      <RenderProvider {...options} />
    </Flex>
  );
}

function MultipleInner() {
  let [isMounted2, setMounted2] = useState(true);

  return (
    <>
      <Checkbox isSelected={isMounted2} onChange={setMounted2}>Second mounted</Checkbox>
      {isMounted2 && <ToastContainer />}
    </>
  );
}
