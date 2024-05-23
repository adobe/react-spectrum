/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {Button} from 'react-aria-components';
import React, {useState} from 'react';

export default {
  title: 'React Aria Components'
};

export const ButtonExample = () => {
  return (
    <Button data-testid="button-example" onPress={() => alert('Hello world!')}>Press me</Button>
  );
};

export const PendingButton = {
  render: (args) => <PendingButtonExample {...args} />,
  args: {
    children: 'Press me',
    className: ({defaultClassName}) => `${defaultClassName} pending-button`
  }
};

export const PendingButtonComplexChildren = {
  render: (args) => <PendingButtonExample {...args} />,
  args: {
    children: (
      <div style={{display: 'flex', gap: '5px'}}>
        <span>
          <svg aria-label="circle" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
            <circle r="5" cx="5" cy="5" fill="red" />
          </svg>
        </span>
        <span>
          circle dot dot
        </span>
      </div>
    ),
    className: ({defaultClassName}) => `${defaultClassName} pending-button`
  }
};

let timerValue = 5000;
function PendingButtonExample(props) {
  let [isPending, setPending] = useState(false);

  let handlePress = (e) => {
    action('pressed')(e);
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, timerValue);
  };

  return (
    <Button
      {...props}
      isPending={isPending}
      onPress={handlePress}
      renderPendingState={'pending'}>
      {props.children}
    </Button>
  );
}
