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

import {act, fireEvent} from '@react-spectrum/test-utils-internal';

function pressKeyOnButton(key, button) {
  fireEvent.keyDown(button, {key});
  fireEvent.keyUp(button, {key});
}
export const press = {
  ArrowRight: (button: HTMLElement) => pressKeyOnButton('ArrowRight', button),
  ArrowLeft: (button: HTMLElement) => pressKeyOnButton('ArrowLeft', button),
  ArrowUp: (button: HTMLElement) => pressKeyOnButton('ArrowUp', button),
  ArrowDown: (button: HTMLElement) => pressKeyOnButton('ArrowDown', button),
  Home: (button: HTMLElement) => pressKeyOnButton('Home', button),
  End: (button: HTMLElement) => pressKeyOnButton('End', button),
  PageUp: (button: HTMLElement) => pressKeyOnButton('PageUp', button),
  PageDown: (button: HTMLElement) => pressKeyOnButton('PageDown', button)
};

export function testKeypresses([sliderLeft, sliderRight], commands: any[]) {
  for (let command of commands) {
    let c = command.left ?? command.right;
    let result = command.result;
    let slider = command.left ? sliderLeft : sliderRight;
    let oldValue = Number(slider.value);
    act(() => {slider.focus();});
    c(slider);

    if (typeof result === 'string') {
      // absolute
      expect(slider).toHaveProperty('value', result);
    } else  {
      // number, relative
      expect(slider).toHaveProperty('value', String(oldValue + result));
    }
  }
}
