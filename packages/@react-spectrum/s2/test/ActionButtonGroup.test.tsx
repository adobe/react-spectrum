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

import {ActionButton, ActionButtonGroup, Text} from '../src';
import {render} from '@react-spectrum/test-utils-internal';

describe('ActionButtonGroup', () => {

  it('can disable all buttons from the group', async () => {
    let {getAllByRole} = render(
      <ActionButtonGroup isDisabled>
        <ActionButton><Text slot="label">Bold</Text></ActionButton>
        <ActionButton><Text slot="label">Italic</Text></ActionButton>
        <ActionButton><Text slot="label">Underline</Text></ActionButton>
      </ActionButtonGroup>
    );


    let buttons = getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });

  it('can set disable individually', async () => {
    let {getAllByRole} = render(
      <ActionButtonGroup>
        <ActionButton isDisabled><Text slot="label">Bold</Text></ActionButton>
        <ActionButton><Text slot="label">Italic</Text></ActionButton>
        <ActionButton><Text slot="label">Underline</Text></ActionButton>
      </ActionButtonGroup>
    );


    let buttons = getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
    expect(buttons[2]).not.toBeDisabled();
  });

  it('can override the group disable', async () => {
    let {getAllByRole} = render(
      <ActionButtonGroup isDisabled>
        <ActionButton isDisabled={false}><Text slot="label">Bold</Text></ActionButton>
        <ActionButton><Text slot="label">Italic</Text></ActionButton>
        <ActionButton><Text slot="label">Underline</Text></ActionButton>
      </ActionButtonGroup>
    );


    let buttons = getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });
});
