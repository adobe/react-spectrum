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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorThumb, Input, SliderTrack} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('ColorPicker', function () {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders', async function () {
    let {getByRole, getAllByRole} = render(
      <ColorPicker defaultValue="#f00">
        <ColorSwatch />
        <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness"><ColorThumb /></ColorArea>
        <ColorSlider colorSpace="hsb" channel="hue"><SliderTrack><ColorThumb /></SliderTrack></ColorSlider>
        <ColorField aria-label="hex"><Input /></ColorField>
      </ColorPicker>
    );

    let swatch = getByRole('img');
    expect(swatch).toHaveAttribute('aria-label', 'vibrant red');

    let sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveValue('100');
    expect(sliders[1]).toHaveValue('0');

    let colorField = getAllByRole('textbox')[0];
    expect(colorField).toHaveValue('#FF0000');

    act(() => colorField.focus());
    await user.clear(colorField);
    await user.keyboard('00f');
    await user.tab();

    expect(swatch).toHaveAttribute('aria-label', 'dark vibrant blue');
    expect(sliders[0]).toHaveValue('100');
    expect(sliders[1]).toHaveValue('240');
    expect(colorField).toHaveValue('#0000FF');
  });
});
