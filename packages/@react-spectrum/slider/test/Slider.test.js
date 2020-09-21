/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render} from '@testing-library/react';
import {Provider} from '@adobe/react-spectrum';
import React from 'react';
import {Slider} from '../';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pressKeyOnButton(key, button) {
  act(() => {fireEvent.keyDown(button, {key});});
}

function pressArrowRight(button) {
  return pressKeyOnButton('ArrowRight', button);
}

function pressArrowLeft(button) {
  return pressKeyOnButton('ArrowLeft', button);
}

function pressArrowUp(button) {
  return pressKeyOnButton('ArrowUp', button);
}

function pressArrowDown(button) {
  return pressKeyOnButton('ArrowDown', button);
}

describe('Slider', function () {
  it('supports aria-label', function () {
    let {getByRole} = render(<Slider aria-label="The Label" />);

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'The Label');
  });

  it('supports label', function () {
    let {getByRole} = render(<Slider label="The Label" />);

    let group = getByRole('group');
    let labelId = group.getAttribute('aria-labelledby');
    let slider = getByRole('slider');
    expect(slider.getAttribute('aria-labelledby')).toBe(labelId);

    expect(document.getElementById(labelId)).toHaveTextContent(/^The Label$/);
  });

  // todo: aria-labeledby

  // See comment on onKeyDown in useDrag1D
  it.skip.each`
  Name                            | props                 | run
    ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowRight(slider); expect(slider).toHaveProperty('value', String(v + 1)); pressArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
    ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowRight(slider); expect(slider).toHaveProperty('value', String(v - 1)); pressArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
    ${'(up/down arrows, ltr)'}    | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowUp(slider);    expect(slider).toHaveProperty('value', String(v + 1)); pressArrowDown(slider); expect(slider).toHaveProperty('value', String(v));}}
    ${'(up/down arrows, rtl)'}    | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowUp(slider);    expect(slider).toHaveProperty('value', String(v - 1)); pressArrowDown(slider); expect(slider).toHaveProperty('value', String(v));}}
  `('$Name shifts button focus in the correct direction on key press', function ({Name, props, run}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <Slider label="Label" defaultValue={50} />
      </Provider>
    );

    let slider = tree.getByRole('slider');

    userEvent.tab();
    expect(document.activeElement).toBe(slider);

    run(slider);
  });
});
