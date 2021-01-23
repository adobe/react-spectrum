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
import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import {Flex} from '@react-spectrum/layout';
import {PressResponder, useHover} from '@react-aria/interactions';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';

storiesOf('Button/ActionButton', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'default',
    () => render()
  )
  .add(
    'icon',
    () => (
      <Flex gap="size-100">
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          <Add />
          <Text>Default</Text>
        </ActionButton>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isDisabled>
          <Text>Disabled</Text>
          <Add />
        </ActionButton>
      </Flex>
    )
  )
  .add(
    'icon only',
    () => (
      <Flex gap="size-100">
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          <Add />
        </ActionButton>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isDisabled>
          <Add />
        </ActionButton>
      </Flex>
    )
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'move from disabled button',
    () => <App />
  );

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        Disabled
      </ActionButton>
    </Flex>
  );
}

function App() {
  let [isDisabled, setIsDisabled] = useState(false);
  let {hoverProps: hoverProps1} = useHover({
    onHoverStart: () => console.log('hover started 1'),
    onHoverEnd: () => console.log('hover ended 1')
  });
  let {hoverProps: hoverProps2} = useHover({
    onHoverStart: () => console.log('hover started 2'),
    onHoverEnd: () => console.log('hover ended 2')
  });
  return (
    <div>
      <div>Must be in Safari. Hovering a disabled Button 1 from Button 2 results in hover started, but hovering from outside both buttons will result in no such call.</div>
      <div>According to the bug, we should also see that clicking Button 1 and then moving to Button 2 shouldn't result in "hover started 2" but it does, so is this bug fixed?</div>
      <Flex>
        <PressResponder {...hoverProps1}>
          <ActionButton onPressStart={() => setIsDisabled(true)} isDisabled={isDisabled} UNSAFE_style={{borderRight: 'none'}}>Button 1</ActionButton>
        </PressResponder>
        <PressResponder {...hoverProps2}>
          <ActionButton onPress={() => setIsDisabled(false)} UNSAFE_style={{borderLeft: 'none'}}>Button 2</ActionButton>
        </PressResponder>
      </Flex>
    </div>
  );
}
