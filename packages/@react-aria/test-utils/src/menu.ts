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

import {act, waitFor, within} from '@testing-library/react';
import {BaseTesterOpts, UserOpts} from './user';
import {triggerLongPress} from './events';

export interface MenuOptions extends UserOpts, BaseTesterOpts {
  user: any
}
export class MenuTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _trigger: HTMLElement;

  constructor(opts: MenuOptions) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;

    // Handle case where a submenu trigger is provided to the tester
    if (root.getAttribute('role') === 'menuitem') {
      this._trigger = root;
    } else {
      // Handle case where element provided is a wrapper of the trigger button
      let trigger = within(root).queryByRole('button');
      if (trigger) {
        this._trigger = trigger;
      } else {
        this._trigger = root;
      }
    }
  }

  setInteractionType = (type: UserOpts['interactionType']) => {
    this._interactionType = type;
  };

  // TODO: this has been common to select as well, maybe make select use it? Or make a generic method. Will need to make error messages generic
  // One difference will be that it supports long press as well
  open = async (opts: {needsLongPress?: boolean, interactionType?: UserOpts['interactionType']} = {}) => {
    let {
      needsLongPress,
      interactionType = this._interactionType
    } = opts;

    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');
    if (interactionType === 'mouse' || interactionType === 'touch') {
      if (needsLongPress) {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }
        let pointerType = interactionType === 'mouse' ? 'mouse' : 'touch';
        await triggerLongPress({element: trigger, advanceTimer: this._advanceTimer, pointerOpts: {pointerType}});
      } else if (interactionType === 'mouse') {
        await this.user.click(trigger);
      } else {
        await this.user.pointer({target: trigger, keys: '[TouchA]'});
      }
    } else if (interactionType === 'keyboard' && !isDisabled) {
      act(() => trigger.focus());
      await this.user.keyboard('[Enter]');
    }

    await waitFor(() => {
      if (trigger.getAttribute('aria-controls') == null && !isDisabled) {
        throw new Error('No aria-controls found on menu trigger element.');
      } else {
        return true;
      }
    });
    if (!isDisabled) {
      let menuId = trigger.getAttribute('aria-controls');
      await waitFor(() => {
        if (!menuId || document.getElementById(menuId) == null) {
          throw new Error(`Menu with id of ${menuId} not found in document.`);
        } else {
          return true;
        }
      });
    }
  };

  // TODO: also very similar to select, barring potential long press support
  // Close on select is also kinda specific?
  selectOption = async (opts: {option?: HTMLElement, optionText?: string, menuSelectionMode?: 'single' | 'multiple', needsLongPress?: boolean, closesOnSelect?: boolean, interactionType?: UserOpts['interactionType']}) => {
    let {
      optionText,
      menuSelectionMode = 'single',
      needsLongPress,
      closesOnSelect = true,
      option,
      interactionType = this._interactionType
    } = opts;
    let trigger = this.trigger;
    if (!trigger.getAttribute('aria-controls')) {
      await this.open({needsLongPress});
    }

    let menu = this.menu;
    if (menu) {
      if (!option && optionText) {
        option = within(menu).getByText(optionText);
      }

      if (interactionType === 'keyboard') {
        if (document.activeElement !== menu || !menu.contains(document.activeElement)) {
          act(() => menu.focus());
        }

        await this.user.keyboard(optionText);
        await this.user.keyboard('[Enter]');
      } else {
        if (interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (option && option.getAttribute('href') == null && option.getAttribute('aria-haspopup') == null && menuSelectionMode === 'single' && closesOnSelect) {
        await waitFor(() => {
          if (document.activeElement !== trigger) {
            throw new Error(`Expected the document.activeElement after selecting an option to be the menu trigger but got ${document.activeElement}`);
          } else {
            return true;
          }
        });

        if (document.contains(menu)) {
          throw new Error('Expected menu element to not be in the document after selecting an option');
        }
      }
    } else {
      throw new Error("Attempted to select a option in the menu, but menu wasn't found.");
    }
  };

  // TODO: update this to remove needsLongPress if we wanna make the user call open first always
  openSubmenu = async (opts: {submenuTrigger?: HTMLElement, submenuTriggerText?: string, needsLongPress?: boolean, interactionType?: UserOpts['interactionType']}): Promise<MenuTester | null> => {
    let {
      submenuTrigger,
      submenuTriggerText,
      needsLongPress,
      interactionType = this._interactionType
    } = opts;
    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');
    if (!trigger.getAttribute('aria-controls') && !isDisabled) {
      await this.open({needsLongPress});
    }
    if (!isDisabled) {
      let menu = this.menu;
      if (menu) {
        let submenu;
        if (submenuTrigger) {
          submenu = submenuTrigger;
        } else if (submenuTriggerText) {
          submenu = within(menu).getByText(submenuTriggerText);
        }

        let submenuTriggerTester = new MenuTester({user: this.user, interactionType: interactionType, root: submenu});
        await submenuTriggerTester.open();

        return submenuTriggerTester;
      }
    }

    return null;
  };

  close = async () => {
    let menu = this.menu;
    if (menu) {
      act(() => menu.focus());
      await this.user.keyboard('[Escape]');

      await waitFor(() => {
        if (document.activeElement !== this.trigger) {
          throw new Error(`Expected the document.activeElement after closing the menu to be the menu trigger but got ${document.activeElement}`);
        } else {
          return true;
        }
      });

      if (document.contains(menu)) {
        throw new Error('Expected the menu to not be in the document after closing it.');
      }
    }
  };

  get trigger() {
    return this._trigger;
  }

  get menu() {
    let menuId = this.trigger.getAttribute('aria-controls');
    return menuId ? document.getElementById(menuId) : undefined;
  }

  get options(): HTMLElement[] | never[] {
    let menu = this.menu;
    let options = [];
    if (menu) {
      options = within(menu).queryAllByRole('menuitem');
      if (options.length === 0) {
        options = within(menu).queryAllByRole('menuitemradio');
        if (options.length === 0) {
          options = within(menu).queryAllByRole('menuitemcheckbox');
        }
      }
    }

    return options;
  }

  get sections() {
    let menu = this.menu;
    if (menu) {
      return within(menu).queryAllByRole('group');
    } else {
      return [];
    }
  }

  get submenuTriggers() {
    let options = this.options;
    if (options.length > 0) {
      return this.options.filter(item => item.getAttribute('aria-haspopup') != null);
    }

    return [];
  }
}
