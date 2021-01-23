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

import {Flex} from '@react-spectrum/layout';
import {mergeProps} from '@react-aria/utils';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {usePress} from '../src';


storiesOf('usePress', module)
  .add(
    'overlapping',
    () => <App />
  );

function App() {
  let [isHidden, setIsHidden] = useState(false);
  return (
    <Flex justifyContent="center">
      <div style={{width: '80%'}}>Must be in chrome responsive mode. Should not see "click Button 2" in the console when clicking Button 1.</div>
      <Button onPress={() => setIsHidden(true)} isHidden={isHidden}>Button 1</Button>
      <Button onPress={() => setIsHidden(false)} isHidden={!isHidden}>Button 2</Button>
    </Flex>
  );
}

function Button(props) {
  let {pressProps, isPressed} = usePress({
    onPressStart: () => console.log('pressStart', props.children),
    onPressEnd: () => console.log('pressEnd', props.children),
    onPress: (e) => {
      console.log('press', props.children);
      props.onPress(e);
    }
  });

  return (
    <div
      {...mergeProps(pressProps, {onClick: () => console.log('click', props.children)})}
      style={{
        background: isPressed ? 'darkgreen' : 'green',
        color: 'white',
        padding: 4,
        cursor: 'pointer',
        position: 'absolute',
        top: '50px',
        left: '50px',
        display: props.isHidden ? 'none' : 'inline-block'
      }}
      role="button"
      tabIndex={0}>
      {props.children}
    </div>
  );
}
