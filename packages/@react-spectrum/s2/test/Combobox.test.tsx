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

jest.mock('@react-aria/live-announcer');
import {act, pointerMap, render, setupIntersectionObserverMock, within} from '@react-spectrum/test-utils-internal';
import {announce} from '@react-aria/live-announcer';
import {ComboBox, ComboBoxItem} from '../src';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

describe('Combobox', () => {
  let user;
  let testUtilUser = new User();
  function DynamicCombobox(props) {
    let {items, loadingState, onLoadMore, ...otherProps} = props;
    return (
      <ComboBox
        {...otherProps}
        label="Test combobox"
        items={items}
        loadingState={loadingState}
        onLoadMore={onLoadMore}>
        {(item: any) => <ComboBoxItem id={item.name} textValue={item.name}>{item.name}</ComboBoxItem>}
      </ComboBox>
    );
  }

  beforeAll(function () {
    jest.useFakeTimers();
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 50);
    user = userEvent.setup({delay: null, pointerMap});
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

  it('should omit the loader from the count of items', async () => {
    jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
    let tree = render(
      <ComboBox label="test" loadingState="loadingMore">
        <ComboBoxItem>Chocolate</ComboBoxItem>
        <ComboBoxItem>Mint</ComboBoxItem>
        <ComboBoxItem>Strawberry</ComboBoxItem>
        <ComboBoxItem>Vanilla</ComboBoxItem>
        <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container, interactionType: 'mouse'});
    await comboboxTester.open();

    expect(announce).toHaveBeenLastCalledWith('5 options available.');
    expect(within(comboboxTester.listbox!).getByRole('progressbar', {hidden: true})).toBeInTheDocument();

    await user.keyboard('C');
    expect(announce).toHaveBeenLastCalledWith('2 options available.');
  });

  it('should properly calculate the expected row index values even when the content changes', async () => {
    let items = [{name: 'Chocolate'}, {name: 'Mint'}, {name: 'Chocolate Chip'}];
    let tree = render(<DynamicCombobox items={items} />);

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container, interactionType: 'mouse'});
    await comboboxTester.open();
    let options = comboboxTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }

    tree.rerender(<DynamicCombobox items={items} loadingState="filtering" />);
    options = comboboxTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }

    // A bit contrived, but essentially testing a combinaiton of insertions/deletions along side some of the old entries remaining
    let newItems = [{name: 'Chocolate'}, {name: 'Chocolate Mint'}, {name: 'Chocolate Chip Cookie Dough'}, {name: 'Chocolate Chip'}];
    tree.rerender(<DynamicCombobox items={newItems} loadingState="idle" />);

    options = comboboxTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }
  });
});
