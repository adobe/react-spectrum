/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {cleanup, fireEvent, render, waitForElement, within} from '@testing-library/react';
import React from 'react';
import {shallow} from 'enzyme';
import {Tab, TabView} from '../../src/TabView';
import {TabList} from '../../src/TabList';
// TODO: add this as a pre test run step
afterEach(cleanup);

describe('TabView', function () {
  it.skip('renders a tab list and the selected tab body', async function () {
    let tree = render(
      <TabView>
        <Tab label="Tab 1">Foo</Tab>
        <Tab label="Tab 2">Bar</Tab>
      </TabView>
    );
    await waitForElement(() => tree.getByTestId('horizontal'));

    let tabs = tree.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    within(tabs[0]).getByText('Tab 1');
    within(tabs[1]).getByText('Tab 2');

    let tabpanel = tree.getByRole('tabpanel');
    within(tabpanel).getByText('Foo');
  });

  it.only('clicking on a tab changes the tab body', async function () {
    const onSelect = jest.fn();
    const tree = render(
      <TabView onSelect={onSelect}>
        <Tab label="Tab 1">Foo</Tab>
        <Tab label="Tab 2">Bar</Tab>
      </TabView>
    );

    await waitForElement(() => tree.getByText('Tab 1'));

    let tabs = tree.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    // Verify that the first tab is selected by default since Tab 1 appears
    tree.getByText('Foo');
    fireEvent.click(tree.getByText('Tab 2'));

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    tree.getByText('Bar');
    expect(onSelect.mock.calls.length).toBe(1);
  });

  it.only('does not change state in controlled mode', async function () {
    const onSelect = jest.fn();
    const tree = render(
      <TabView onSelect={onSelect} selectedIndex={1}>
        <Tab label="Tab 1">Foo</Tab>
        <Tab label="Tab 2">Bar</Tab>
      </TabView>
    );

    await waitForElement(() => tree.getByText('Tab 1'));

    let tabs = tree.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    tree.getByText('Bar');
    fireEvent.click(tree.getByText('Tab 1'));

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    tree.getByText('Bar');
    expect(onSelect.mock.calls.length).toBe(1);
    expect(onSelect.mock.calls[0][0]).toBe(0);
  });

  // TODO: Decide how to handle tests like these two in the possible React Testing Library World
  // Options:
  // 1: Make a parent component wrapping TabView that that can add a child via button click so that we are still
  // testing using DOM actions
  // 2: Keep test as is, and reserve enzyme for purely for test cases like this
  // 3: Scrap the test
  it('changing the children resets the selected index', function () {
    const tree = shallow(
      <TabView>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );

    tree.find(TabList).simulate('change', 1);

    tree.setProps({
      children: [
        <Tab label="Hi">Hi</Tab>
      ]
    });

    assert.equal(tree.find(TabList).prop('selectedIndex'), 0);
  });

  it('children should have renderChildren prop and allow null in children', function () {
    const tree = shallow(
      <TabView>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
        {null}
      </TabView>
    );

    assert.equal(tree.find(Tab).at(0).prop('renderChildren'), false);
  });
});
