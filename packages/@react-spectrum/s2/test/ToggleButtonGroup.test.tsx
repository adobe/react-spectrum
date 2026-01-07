/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {render} from '@react-spectrum/test-utils-internal';
import {Text, ToggleButton, ToggleButtonGroup} from '../src';

describe('ToggleButtonGroup', () => {

  it('can disable all buttons from the group', async () => {
    let {getAllByRole} = render(
      <ToggleButtonGroup isDisabled>
        <ToggleButton id={1}><Text slot="label">Bold</Text></ToggleButton>
        <ToggleButton id={2}><Text slot="label">Italic</Text></ToggleButton>
        <ToggleButton id={3}><Text slot="label">Underline</Text></ToggleButton>
      </ToggleButtonGroup>
    );


    let buttons = getAllByRole('radio');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });
});
