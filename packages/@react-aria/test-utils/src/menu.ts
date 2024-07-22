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

type InteractionType = 'mouse' | 'touch' | 'keyboard'

interface MenuOptions {
  user: any,
  interactionType?: InteractionType
}
export class MenuTester {
  private user;
  private _interactionType: InteractionType;
  private _trigger: HTMLElement;

  constructor(opts: MenuOptions) {
    this.user = opts.user;
    this._interactionType = opts.interactionType || 'mouse';
  }

  setElement(element: HTMLElement) {
    // Handle case where a submenu trigger is provided to the tester
    if (element.getAttribute('role') === 'menuitem') {
      this._trigger = element;
    } else {
      // Handle case where element provided is a wrapper of the trigger button
      let trigger = within(element).queryByRole('button');
      if (trigger) {
        this._trigger = trigger;
      }
    }

    if (this._trigger == null) {
      this._trigger = element;
    }
  }

  setInteractionType(type: InteractionType) {
    this._interactionType = type;
  }

  // TODO: this has been common to select as well, maybe make select use it? Or make a generic method. Will need to make error messages generic
  // One difference will be that it supports long press as well
  async open(opts: {needsLongPress?: boolean} = {}) {
    let {
      needsLongPress
    } = opts;

    if (this._interactionType === 'mouse') {
      if (needsLongPress) {
        // TODO: add long press support once I figure out how to make it generic and not specific to jest
      } else {
        await this.user.click(this.trigger);
      }
    } else if (this._interactionType === 'keyboard') {
      act(() => this.trigger.focus());
      await this.user.keyboard('[Enter]');
    } else if (this._interactionType === 'touch') {
      await this.user.pointer({target: this.trigger, keys: '[TouchA]'});
    }

    await waitFor(() => {
      if (this.trigger.getAttribute('aria-controls') == null) {
        throw new Error('No aria-controls found on menu trigger element.');
      } else {
        return true;
      }
    });
    let menuId = this.trigger.getAttribute('aria-controls');
    await waitFor(() => {
      if (!menuId || document.getElementById(menuId) == null) {
        throw new Error(`Menu with id of ${menuId} not found in document.`);
      } else {
        return true;
      }
    });
  }

  // TODO: also very similar to select, barring potential long press support
  async selectOption(opts: {option?: HTMLElement, optionText?: string, menuSelectionMode?: 'single' | 'multiple', needsLongPress?: boolean, closesOnSelect?: boolean}) {
    let {optionText, menuSelectionMode = 'single', needsLongPress, closesOnSelect = true, option} = opts;
    if (!this.trigger.getAttribute('aria-controls')) {
      // TODO: technically this would need the user to pass in if their menu needs long press if we want calling selectOption to
      // work without needing to call open first. Bit annoying though, maybe I add opts and have one of them be needsLongPress?
      await this.open({needsLongPress});
    }

    let menu = this.menu;
    if (menu) {
      if (!option && optionText) {
        option = within(menu).getByText(optionText);
      }

      if (this._interactionType === 'keyboard') {
        if (document.activeElement !== menu || !menu.contains(document.activeElement)) {
          act(() => menu.focus());
        }

        await this.user.keyboard(optionText);
        await this.user.keyboard('[Enter]');
      } else {
        if (this._interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (option && option.getAttribute('href') == null && option.getAttribute('aria-haspopup') == null && menuSelectionMode === 'single' && closesOnSelect) {
        await waitFor(() => {
          if (document.activeElement !== this.trigger) {
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
      throw new Error("Attempted to select a option with the menu, but menu wasn't found.");
    }
  }

  // TODO: update this to remove needsLongPress if we wanna make the user call open first always
  async openSubmenu(opts: {submenuTrigger?: HTMLElement, submenuTriggerText?: string, needsLongPress?: boolean}): Promise<MenuTester | null> {
    let {submenuTrigger, submenuTriggerText, needsLongPress} = opts;
    if (!this.trigger.getAttribute('aria-controls')) {
      await this.open({needsLongPress});
    }

    let menu = this.menu;
    if (menu) {
      let submenuTriggerTester = new MenuTester({user: this.user, interactionType: this._interactionType});
      if (submenuTrigger) {
        submenuTriggerTester.setElement(submenuTrigger);
      } else if (submenuTriggerText) {
        submenuTriggerTester.setElement(within(menu).getByText(submenuTriggerText));
      }

      await submenuTriggerTester.open();

      return submenuTriggerTester;
    }

    return null;
  }

  async close() {
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
  }

  get trigger() {
    if (!this._trigger) {
      throw new Error('Menu trigger element hasn\'t been set yet. Did you call `setElement()` yet?');
    }

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
