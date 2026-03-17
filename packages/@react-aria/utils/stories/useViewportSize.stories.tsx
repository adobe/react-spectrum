/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Meta} from '@storybook/react';
import React from 'react';
import {useViewportSize} from '@react-aria/utils';

export default {
  title: 'useViewportSize',
  component: Example
} as Meta<typeof Example>;

export function Example() {
  const viewportSize = useViewportSize();

  return (
    <div>
      {JSON.stringify(viewportSize)}
      <input />
      <div style={{height: '200vh'}} />
    </div>
  );
}

Example.parameters = {
  description: {
    data: 'Clicking the input and then clicking outside should not cause the viewport size to change.'
  }
};
