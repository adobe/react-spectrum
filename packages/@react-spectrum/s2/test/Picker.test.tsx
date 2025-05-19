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

import {act, render, setupIntersectionObserverMock} from '@react-spectrum/test-utils-internal';
import {Picker, PickerItem} from '../src';
import React from 'react';
import {User} from '@react-aria/test-utils';

describe('Picker', () => {
  let testUtilUser = new User();
  function DynamicPicker(props) {
    let {items, loadingState, onLoadMore, ...otherProps} = props;
    return (
      <Picker
        {...otherProps}
        label="Test picker"
        items={items}
        loadingState={loadingState}
        onLoadMore={onLoadMore}>
        {(item: any) => <PickerItem id={item.name} textValue={item.name}>{item.name}</PickerItem>}
      </Picker>
    );
  }

  beforeAll(function () {
    jest.useFakeTimers();
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 50);
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('should only call loadMore whenever intersection is detected', async () => {
    let onLoadMore = jest.fn();
    let observe = jest.fn();
    let observer = setupIntersectionObserverMock({
      observe
    });

    let tree = render(
      <Picker label="test" loadingState="loadingMore" onLoadMore={onLoadMore}>
        <PickerItem>Chocolate</PickerItem>
        <PickerItem>Mint</PickerItem>
        <PickerItem>Strawberry</PickerItem>
        <PickerItem>Vanilla</PickerItem>
        <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
      </Picker>
    );

    let selectTester = testUtilUser.createTester('Select', {root: tree.container});
    expect(selectTester.listbox).toBeFalsy();
    selectTester.setInteractionType('mouse');
    await selectTester.open();

    expect(onLoadMore).toHaveBeenCalledTimes(0);
    let sentinel = tree.getByTestId('loadMoreSentinel');
    expect(observe).toHaveBeenLastCalledWith(sentinel);

    act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
    act(() => {jest.runAllTimers();});

    tree.rerender(
      <Picker label="test" onLoadMore={onLoadMore}>
        <PickerItem>Chocolate</PickerItem>
        <PickerItem>Mint</PickerItem>
        <PickerItem>Strawberry</PickerItem>
        <PickerItem>Vanilla</PickerItem>
        <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
      </Picker>
    );

    act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
    act(() => {jest.runAllTimers();});
    // Note that if this was using useAsyncList, we'd be shielded from extranous onLoadMore calls but
    // we want to leave that to user discretion
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('should properly calculate the expected row index values', async () => {
    let items = [{name: 'Chocolate'}, {name: 'Mint'}, {name: 'Chocolate Chip'}];
    let tree = render(<DynamicPicker items={items} />);

    let selectTester = testUtilUser.createTester('Select', {root: tree.container});
    await selectTester.open();
    let options = selectTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }

    tree.rerender(<DynamicPicker items={items} loadingState="loadingMore" />);
    options = selectTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }

    let newItems = [...items, {name: 'Chocolate Mint'}, {name: 'Chocolate Chip Cookie Dough'}];
    tree.rerender(<DynamicPicker items={newItems} />);

    options = selectTester.options();
    for (let [index, option] of options.entries()) {
      expect(option).toHaveAttribute('aria-posinset', `${index + 1}`);
    }
  });
});
