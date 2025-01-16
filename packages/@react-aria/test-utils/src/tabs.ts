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

import {act, within} from '@testing-library/react';
import {Direction, Orientation, TabsTesterOpts, UserOpts} from './types';
import {pressElement} from './events';

interface TriggerTabOptions {
  /**
   * What interaction type to use when triggering a tab. Defaults to the interaction type set on the tester.
   */
  interactionType?: UserOpts['interactionType'],
  /**
   * The index, text, or node of the tab to toggle selection for.
   */
  tab: number | string | HTMLElement,
  /**
   * Whether the tab needs to be activated manually rather than on focus.
   */
  manualActivation?: boolean
}

export class TabsTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _tablist: HTMLElement;
  private _direction: Direction;

  constructor(opts: TabsTesterOpts) {
    let {root, user, interactionType, direction} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._direction = direction || 'ltr';

    this._tablist = root;
    let tablist = within(root).queryAllByRole('tablist');
    if (tablist.length > 0) {
      this._tablist = tablist[0];
    }
  }

  /**
   * Set the interaction type used by the tabs tester.
   */
  setInteractionType(type: UserOpts['interactionType']) {
    this._interactionType = type;
  }

  // TODO: This is pretty similar across most the utils, refactor to make it generic?
  /**
   * Returns a tab matching the specified index or text content.
   */
  findTab(opts: {tabIndexOrText: number | string}): HTMLElement {
    let {
      tabIndexOrText
    } = opts;

    let tab;
    let tabs = this.tabs;
    if (typeof tabIndexOrText === 'number') {
      tab = tabs[tabIndexOrText];
    } else if (typeof tabIndexOrText === 'string') {
      tab = (within(this._tablist).getByText(tabIndexOrText).closest('[role=tab]'))! as HTMLElement;
    }

    return tab;
  }

  // TODO: also quite similar across more utils albeit with orientation, refactor to make generic
  private async keyboardNavigateToTab(opts: {tab: HTMLElement, orientation?: Orientation}) {
    let {tab, orientation = 'vertical'} = opts;
    let tabs = this.tabs;
    let targetIndex = tabs.indexOf(tab);
    if (targetIndex === -1) {
      throw new Error('Tab provided is not in the tablist');
    }

    if (!this._tablist.contains(document.activeElement)) {
      let selectedTab = this.selectedTab;
      if (selectedTab != null) {
        act(() => selectedTab.focus());
      } else {
        act(() => tabs.find(tab => !(tab.hasAttribute('disabled') || tab.getAttribute('aria-disabled') === 'true'))?.focus());
      }
    }

    let currIndex = this.tabs.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the tablist');
    }

    let arrowUp = 'ArrowUp';
    let arrowDown = 'ArrowDown';
    if (orientation === 'horizontal') {
      if (this._direction === 'ltr') {
        arrowUp = 'ArrowLeft';
        arrowDown = 'ArrowRight';
      } else {
        arrowUp = 'ArrowRight';
        arrowDown = 'ArrowLeft';
      }
    }

    let movementDirection = targetIndex > currIndex ? 'down' : 'up';
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${movementDirection === 'down' ? arrowDown : arrowUp}]`);
    }
  };

  /**
   * Triggers the specified tab. Defaults to using the interaction type set on the tabs tester.
   */
  async triggerTab(opts: TriggerTabOptions) {
    let {
      tab,
      interactionType = this._interactionType,
      manualActivation
    } = opts;

    if (typeof tab === 'string' || typeof tab === 'number') {
      tab = this.findTab({tabIndexOrText: tab});
    }

    if (!tab) {
      throw new Error('Target tab not found in the tablist.');
    } else if (tab.hasAttribute('disabled')) {
      throw new Error('Target tab is disabled.');
    }

    if (interactionType === 'keyboard') {
      if (document.activeElement !== this._tablist || !this._tablist.contains(document.activeElement)) {
        act(() => this._tablist.focus());
      }

      let tabsOrientation = this._tablist.getAttribute('aria-orientation') || 'horizontal';
      await this.keyboardNavigateToTab({tab, orientation: tabsOrientation as Orientation});
      if (manualActivation) {
        await this.user.keyboard('[Enter]');
      }
    } else {
      await pressElement(this.user, tab, interactionType);
    }
  }

  /**
   * Returns the tablist.
   */
  get tablist(): HTMLElement {
    return this._tablist;
  }

  /**
   * Returns the tabpanels.
   */
  get tabpanels(): HTMLElement[] {
    let tabpanels = [] as HTMLElement[];
    for (let tab of this.tabs) {
      let controlId = tab.getAttribute('aria-controls');
      let panel = controlId != null ? document.getElementById(controlId) : null;
      if (panel != null) {
        tabpanels.push(panel);
      }
    }

    return tabpanels;
  }

  /**
   * Returns the tabs in the tablist.
   */
  get tabs(): HTMLElement[] {
    return within(this.tablist).queryAllByRole('tab');
  }

  /**
   * Returns the currently selected tab in the tablist if any.
   */
  get selectedTab(): HTMLElement | null {
    return this.tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || null;
  }

  /**
   * Returns the currently active tabpanel if any.
   */
  get activeTabpanel(): HTMLElement | null {
    let activeTabpanelId = this.selectedTab?.getAttribute('aria-controls');
    return activeTabpanelId ? document.getElementById(activeTabpanelId) : null;
  }
}
