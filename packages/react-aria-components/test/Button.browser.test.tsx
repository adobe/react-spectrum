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

import {Button} from '../src/Button';
import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

describe('Button keyboard activation', () => {
  it.each(['button', 'submit', 'reset'] as const)(
    'should activate a %s button once per keyboard press',
    async type => {
      let onPress = vi.fn();
      let onClick = vi.fn();
      let onSubmit = vi.fn(e => e.preventDefault());
      let onReset = vi.fn();
      let {getByRole} = await render(
        <form onSubmit={onSubmit} onReset={onReset}>
          <Button type={type} onPress={onPress} onClick={onClick} autoFocus>
            Activate
          </Button>
        </form>
      );
      let button = getByRole('button');
      await expect.element(button).toHaveFocus();

      for (let [index, key] of [' ', ' ', '{Enter}'].entries()) {
        await userEvent.keyboard(key);
        expect(onPress).toHaveBeenCalledTimes(index + 1);
        expect(onClick).toHaveBeenCalledTimes(index + 1);
        expect(onPress).toHaveBeenLastCalledWith(
          expect.objectContaining({pointerType: 'keyboard'})
        );
        expect(onSubmit).toHaveBeenCalledTimes(type === 'submit' ? index + 1 : 0);
        expect(onReset).toHaveBeenCalledTimes(type === 'reset' ? index + 1 : 0);
      }

      await userEvent.click(button);
      expect(onPress).toHaveBeenCalledTimes(4);
      expect(onClick).toHaveBeenCalledTimes(4);
      (button.element() as HTMLButtonElement).click();
      expect(onPress).toHaveBeenCalledTimes(5);
      expect(onClick).toHaveBeenCalledTimes(5);
    }
  );

  it('should allow virtual activation after a canceled native keyboard click', async () => {
    let onPress = vi.fn();
    let onClick = vi.fn();
    let onSubmit = vi.fn(e => e.preventDefault());
    let {getByRole} = await render(
      <form onSubmit={onSubmit} onKeyUp={e => e.preventDefault()}>
        <Button type="submit" onPress={onPress} onClick={onClick} autoFocus>
          Activate
        </Button>
      </form>
    );
    let button = getByRole('button').element() as HTMLButtonElement;
    await expect.element(getByRole('button')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();

    button.click();
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
