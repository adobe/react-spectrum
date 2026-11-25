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

import {Direction, Key, Orientation} from '@react-types/shared';
import {ListKeyboardDelegate, ListKeyboardDelegateOptions} from '../selection/ListKeyboardDelegate';

export interface TabsKeyboardDelegateOptions<T> extends Omit<
  ListKeyboardDelegateOptions<T>,
  'layout'
> {}

export class TabsKeyboardDelegate<T> extends ListKeyboardDelegate<T> {
  private _orientation: Orientation;
  private _direction: Direction;

  // @ts-expect-error - Reset to nullable because of the override
  getKeyBelow?(key: Key): Key | null;
  // @ts-expect-error - Reset to nullable because of the override
  getKeyAbove?(key: Key): Key | null;
  // @ts-expect-error - Reset to nullable because of the override
  getKeyPageAbove?(key: Key): Key | null;
  // @ts-expect-error - Reset to nullable because of the override
  getKeyPageBelow?(key: Key): Key | null;

  constructor(opts: TabsKeyboardDelegateOptions<T>) {
    let orientation = opts.orientation || 'horizontal';
    let direction = opts.direction || 'ltr';
    super({...opts, layout: 'stack', orientation, direction});
    this._orientation = orientation;
    this._direction = direction;

    this.getKeyPageAbove = undefined;
    this.getKeyPageBelow = undefined;

    if (this._orientation === 'vertical') {
      super.getKeyLeftOf = this._getKeyLeftOf;
      super.getKeyRightOf = this._getKeyRightOf;
    } else {
      this.getKeyAbove = undefined;
      this.getKeyBelow = undefined;
    }
  }

  private _getKeyLeftOf(key: Key): Key | null {
    if (this._orientation === 'vertical') {
      return this._direction === 'rtl' ? super.getKeyBelow(key) : super.getKeyAbove(key);
    }
    return super.getKeyLeftOf!(key);
  }

  private _getKeyRightOf(key: Key): Key | null {
    if (this._orientation === 'vertical') {
      return this._direction === 'rtl' ? super.getKeyAbove(key) : super.getKeyBelow(key);
    }
    return super.getKeyRightOf!(key);
  }
}
