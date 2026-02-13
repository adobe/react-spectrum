/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render} from '@react-spectrum/test-utils-internal';
import {TextArea} from '../src';

describe('TextField', () => {
  it('should focus textarea when tapping invalid icon', async () => {
    let {getByRole} = render(
      <TextArea label="Description" isInvalid  />
    );

    let textarea = getByRole('textbox');
    // svg doesn't have a role so grab it via queryselector
    let icon = getByRole('presentation').querySelector('svg')!;
    expect(icon).toBeInTheDocument();
    // user event with touch doesn't cause touchEnd to trigger so using fireEvent
    fireEvent.touchStart(icon);
    fireEvent.touchEnd(icon);

    expect(document.activeElement).toBe(textarea);
  });
});
