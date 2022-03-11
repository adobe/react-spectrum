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

import {ClickThroughExample} from './ClickthroughExample';
import React from 'react';
import {storiesOf} from '@storybook/react';


storiesOf('useModal/issues', module)
  .add(
    'Click through modals',
    () => <ClickThroughExample />,
  {
    description: {
      data: `
      Test this story in responsive mode Chrome.
      In Firefox make sure to turn on simulate touch.
      Make sure to test by touching/pressing both over the enormous button as well as off of it.
      Closing the Dialog with the React Aria Button should behave no differently than the regular button.
      You should also be able to close the dialog by clicking on the backdrop.
      This should also be tested on actual mobile devices so we can verify that scrolling also works.
      If you are unable to close the Dialog, or it reopens very quickly, that means it is broken.
      `
    }
  });

