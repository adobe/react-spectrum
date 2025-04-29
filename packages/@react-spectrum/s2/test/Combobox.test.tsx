/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, render, setupIntersectionObserverMock, within} from '@react-spectrum/test-utils-internal';
import {ComboBox, ComboBoxItem} from '../src';
import React from 'react';
import {User} from '@react-aria/test-utils';

describe('Combobox', () => {
  let testUtilUser = new User();

  beforeAll(function () {
    jest.useFakeTimers();
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('should render the sentinel when the combobox is empty', async () => {
    let tree = render(
      <ComboBox label="test">
        {[]}
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    expect(comboboxTester.listbox).toBeFalsy();
    comboboxTester.setInteractionType('mouse');
    await comboboxTester.open();

    expect(comboboxTester.options()).toHaveLength(1);
    expect(within(comboboxTester.listbox!).getByTestId('loadMoreSentinel')).toBeInTheDocument();
  });

  it('should only call loadMore whenever intersection is detected', async () => {
    let onLoadMore = jest.fn();
    let observe = jest.fn();
    let observer = setupIntersectionObserverMock({
      observe
    });

    let tree = render(
      <ComboBox label="test" loadingState="loadingMore" onLoadMore={onLoadMore}>
        <ComboBoxItem>Chocolate</ComboBoxItem>
        <ComboBoxItem>Mint</ComboBoxItem>
        <ComboBoxItem>Strawberry</ComboBoxItem>
        <ComboBoxItem>Vanilla</ComboBoxItem>
        <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    expect(comboboxTester.listbox).toBeFalsy();
    comboboxTester.setInteractionType('mouse');
    await comboboxTester.open();

    expect(onLoadMore).toHaveBeenCalledTimes(0);
    let sentinel = tree.getByTestId('loadMoreSentinel');
    expect(observe).toHaveBeenLastCalledWith(sentinel);


    act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
    act(() => {jest.runAllTimers();});

    tree.rerender(
      <ComboBox label="test" loadingState="idle" onLoadMore={onLoadMore}>
        <ComboBoxItem>Chocolate</ComboBoxItem>
        <ComboBoxItem>Mint</ComboBoxItem>
        <ComboBoxItem>Strawberry</ComboBoxItem>
        <ComboBoxItem>Vanilla</ComboBoxItem>
        <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
      </ComboBox>
    );

    act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
    act(() => {jest.runAllTimers();});
    // Note that if this was using useAsyncList, we'd be shielded from extranous onLoadMore calls but
    // we want to leave that to user discretion
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });
});
