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

import {ColorSwatch, ColorSwatchPicker, ColorSwatchPickerItem, parseColor} from '../src';
import {pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('ColorSwatchPicker', function () {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders a listbox', async function () {
    let onChange = jest.fn();
    let {getByRole} = render(
      <ColorSwatchPicker onChange={onChange}>
        <ColorSwatchPickerItem color="#f00"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0f0"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0ff"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#00f"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label', 'Color swatches');
    expect(listbox).toHaveAttribute('class', 'react-aria-ColorSwatchPicker');

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute('class', 'react-aria-ColorSwatchPickerItem');
    expect(within(options[0]).getByRole('img')).toHaveAttribute('aria-label', 'vibrant red');

    await user.click(options[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(parseColor('#0f0'));
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('supports custom class', function () {
    let {getByRole} = render(
      <ColorSwatchPicker className="picker">
        <ColorSwatchPickerItem color="#f00" className="item"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'picker');

    let options = within(listbox).getAllByRole('option');
    expect(options[0]).toHaveAttribute('class', 'item');
  });

  it('supports custom aria-label', async function () {
    let {getByRole} = render(
      <ColorSwatchPicker aria-label="test">
        <ColorSwatchPickerItem color="#f00"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0f0"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0ff"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#00f"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label', 'test');
  });

  it('supports custom aria-labelledby', async function () {
    let {getByRole} = render(
      <ColorSwatchPicker aria-labelledby="test">
        <ColorSwatchPickerItem color="#f00"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0f0"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0ff"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#00f"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-labelledby', 'test');
    expect(listbox).not.toHaveAttribute('aria-label');
  });

  it('supports defaultValue', async function () {
    let {getByRole} = render(
      <ColorSwatchPicker defaultValue="#0ff">
        <ColorSwatchPickerItem color="#f00"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0f0"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0ff"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#00f"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('handles keyboard input', async function () {
    let onChange = jest.fn();
    let {getByRole} = render(
      <ColorSwatchPicker onChange={onChange}>
        <ColorSwatchPickerItem color="#f00"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0f0"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#0ff"><ColorSwatch /></ColorSwatchPickerItem>
        <ColorSwatchPickerItem color="#00f"><ColorSwatch /></ColorSwatchPickerItem>
      </ColorSwatchPicker>
    );

    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(4);

    await user.tab();
    expect(document.activeElement).toBe(options[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(options[1]);

    await user.keyboard('{Enter}');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });
});
