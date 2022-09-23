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
import {Content, ContextualHelp, Heading} from '@adobe/react-spectrum';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import Info from '@spectrum-icons/workflow/Info';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {TextArea} from '../';

storiesOf('TextArea', module)
  .addParameters({
    providerSwitcher: {status: 'positive'},
    args: {
      label: 'Comments',
      isQuiet: false,
      isDisabled: false,
      isReadOnly: false,
      isRequired: false,
      necessityIndicator: 'icon',
      labelPosition: 'top',
      labelAlign: 'start',
      validationState: null
    },
    argTypes: {
      labelPosition: {
        control: {
          type: 'radio',
          options: ['top', 'side']
        }
      },
      necessityIndicator: {
        control: {
          type: 'radio',
          options: ['icon', 'label']
        }
      },
      labelAlign: {
        control: {
          type: 'radio',
          options: ['start', 'end']
        }
      },
      validationState: {
        control: {
          type: 'radio',
          options: [null, 'valid', 'invalid']
        }
      }
    }
  })
  .add(
    'Default',
    args => render(args)
  )
  .add(
    'value: Test (controlled)',
    args => render({...args, value: 'Test'})
  )
  .add(
    'defaultValue: Test (uncontrolled)',
    args => render({...args, defaultValue: 'Test'})
  )
  .add(
    'autoFocus: true',
    args => render({...args, autoFocus: true})
  )
  .add(
    'icon: Info',
    args => render({...args, icon: <Info />})
  )
  .add(
    'no visible label',
    args => render({...args, label: null, 'aria-label': 'Street address'})
  )
  .add('with description',
    args => render({...args, description: 'Enter product feedback.'})
  )
  .add('with error message',
    args => render({...args, errorMessage: 'Enter at least 250 characters.', validationState: 'invalid'})
  )
  .add(
    'with contextual help',
    args => render({...args, contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )})
  )
  .add('custom width',
    args => render({...args, icon: <Info />, validationState: 'invalid', width: '300px'})
  )
  .add('custom width small',
    args => render({...args, icon: <Info />, validationState: 'invalid', width: '30px'})
  )
  .add(
    'custom height with label',
    args => (
      <Form>
        <TextArea {...args} label="Custom height" description="height: size-2000" height="size-2000" />
        <TextArea {...args} label="Custom height" description="height: size-2000" height="size-2000" isQuiet />
        <TextArea {...args} labelPosition="side" label="Custom height" description="height: size-2000" height="size-2000" />
        <TextArea {...args} labelPosition="side" label="Custom height" description="height: size-2000" height="size-2000" isQuiet />
      </Form>
    )
  )
  .add(
    'changeable helptext',
    args => <ValidationExample {...args} />,
    {description: {data: 'Verify that the changing size of the error message does not interfere with the height. To test, delete the input, then type the character "a". Height should update to match.'}}
  )
  .add(
    'changeable helptext custom height',
    args => <ValidationExample {...args} height="175px" minHeight="100px" maxHeight="50vh" />,
    {description: {data: 'Verify that the changing size of the error message does not interfere with the height. To test, delete the input, then type the character "a". Height should update to match.'}}
  )
  .add('controlled interactive',
    args => <ControlledTextArea {...args} />
  )
  .add('in flex', args => renderInFlexRowAndBlock(args))
  .add('in flex validation state', args => renderInFlexRowAndBlock({...args, validationState: 'invalid'}));

function render(props = {}) {
  return (
    <TextArea
      label="Comments"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      UNSAFE_className="custom_classname"
      {...props} />
  );
}

function ControlledTextArea(props) {
  let [value, setValue] = useState('');
  return (
    <>
      <TextArea label="megatron" value={value} onChange={setValue} {...props} isQuiet />
      <Button variant="primary" onPress={() => setValue('decepticons are evil transformers and should be kicked out of earth')}>Set Text</Button>
    </>
  );
}

function renderInFlexRowAndBlock(props = {}) {
  return (
    <Flex direction="column" gap="size-300">
      Align stretch
      <Flex gap="size-100">
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </Flex>
      Align end
      <Flex gap="size-100" alignItems="end">
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </Flex>
      Display block
      <div>
        <TextArea
          label="Default"
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
        <TextArea
          label="Quiet"
          isQuiet
          {...props} />
      </div>
    </Flex>
  );
}

function ValidationExample(props) {
  let [value, setValue] = React.useState('0');
  let isValid = React.useMemo(() => /^\d$/.test(value), [value]);

  return (
    <TextArea
      {...props}
      validationState={isValid ? 'valid' : 'invalid'}
      value={value}
      onChange={setValue}
      label="Favorite number"
      maxLength={1}
      description="Enter a single digit number."
      errorMessage={value === '' ? 'Empty input not allowed.' : 'Single digit numbers are 0-9. Lorem ipsum dolor.'} />
  );
}
