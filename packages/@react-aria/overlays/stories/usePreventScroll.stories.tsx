/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import React, {JSX, useState} from 'react';
import {StoryObj} from '@storybook/react';
import {usePreventScroll} from '../src';

export default {
  title: 'usePreventScroll'
};

export type AppStory = StoryObj<typeof App>;

export const Default: AppStory = {
  render: () => <App />,
  name: 'default',
  parameters: {
    description: {
      data: 'Visit this story on a touch device. Click the button, then scroll. You should actively be scrolling when the prevent scroll kicks it. It should happen without an error.'
    }
  }
};

function App(): JSX.Element {
  const [preventScroll, setPreventScroll] = useState(false);
  usePreventScroll({isDisabled: !preventScroll});

  const startPreventScroll = () => {
    setInterval(() => {
      setPreventScroll(true);
    }, 1000);
  };

  return (
    <div style={{height: '300vh'}}>
      <ActionButton onPress={startPreventScroll} margin="20px">
        Click Me in safari and then scroll
      </ActionButton>
    </div>
  );
}
