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
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '../';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

storiesOf('ButtonGroup', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'orientation: vertical, align: end',
    () => render({orientation: 'vertical', align: 'end'})
  )
  .add(
    'isDisabled, orientation: vertical',
    () => render({isDisabled: true, orientation: 'vertical'})
  );

function render(props) {
  return <Component {...props} />;
}

let Component = (props) => {
  let [show, setShow] = useState(false);
  return (
    <ButtonGroup {...props}>
      <Button variant="primary" onPress={action('press')}>Button 1</Button>
      <Button variant="negative" onPress={action('press')}>Button long long long name</Button>
      <Button variant="cta" isQuiet onPress={action('press')}>Quiet button</Button>
      <Button variant="primary" isDisabled onPress={action('press')}>Disabled button</Button>
      <Button variant="secondary" onPress={() => setShow(show => !show)}>
        <Bell />
        <Text>Click me to make Button larger</Text>
        {show && <Text>to test overflow resizing :D</Text>}
      </Button>
    </ButtonGroup>
  );
};
