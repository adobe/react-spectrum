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

import {act, pointerMap, renderv3 as render, within} from '@react-spectrum/test-utils-internal';
import {ColorEditor, ColorPicker} from '../src';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

describe('ColorPicker', function () {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  it('renders', async function () {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <ColorPicker label="Fill" defaultValue="#f00">
          <ColorEditor />
        </ColorPicker>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('Fill');
    expect(within(button).getByLabelText('vibrant red')).toBeInTheDocument();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby'))).toHaveTextContent('Fill');

    let sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(3);

    let picker = getAllByRole('button')[1];
    expect(picker).toHaveTextContent('Hex');

    let colorField = getAllByRole('textbox')[0];
    expect(colorField).toHaveAttribute('aria-label', 'Hex');

    let alpha = getAllByRole('textbox')[1];
    expect(alpha).toHaveAttribute('aria-label', 'Alpha');

    act(() => colorField.focus());
    await user.clear(colorField);
    await user.keyboard('00f');

    act(() => dialog.focus());
    await user.keyboard('{Escape}');
    act(() => {jest.runAllTimers();});
    expect(within(button).getByLabelText('dark vibrant blue')).toBeInTheDocument();
  });

  it('should have default value of black', async function () {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <ColorPicker label="Fill">
          <ColorEditor />
        </ColorPicker>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('Fill');
    expect(within(button).getByLabelText('black')).toBeInTheDocument();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby'))).toHaveTextContent('Fill');

    let sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(3);

    let picker = getAllByRole('button')[1];
    expect(picker).toHaveTextContent('Hex');

    let colorField = getAllByRole('textbox')[0];
    expect(colorField).toHaveAttribute('aria-label', 'Hex');

    let alpha = getAllByRole('textbox')[1];
    expect(alpha).toHaveAttribute('aria-label', 'Alpha');
  });


  it('allows switching color space', async function () {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <ColorPicker label="Fill" defaultValue="#f00">
          <ColorEditor />
        </ColorPicker>
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);

    let picker = getAllByRole('button')[1];
    expect(picker).toHaveTextContent('Hex');
    await user.click(picker);
    await user.click(getAllByRole('option')[1]);
    act(() => {jest.runAllTimers();});
    expect(picker).toHaveTextContent('RGB');

    let colorFields = getAllByRole('textbox');
    expect(colorFields).toHaveLength(4);

    act(() => colorFields[1].focus());
    await user.clear(colorFields[1]);
    await user.keyboard('120');

    act(() => getByRole('dialog').focus());
    await user.keyboard('{Escape}');
    act(() => {jest.runAllTimers();});
    expect(within(button).getByLabelText('vibrant orange')).toBeInTheDocument();
  });
});
