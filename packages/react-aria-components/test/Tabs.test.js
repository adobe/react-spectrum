/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render} from '@react-spectrum/test-utils';
import React from 'react';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from '../';
import userEvent from '@testing-library/user-event';

let renderTabs = (tabsProps, tablistProps, tabProps, tabpanelProps) => render(
  <Tabs {...tabsProps}>
    <TabList {...tablistProps} aria-label="Test">
      <Tab {...tabProps} id="a">A</Tab>
      <Tab {...tabProps} id="b">B</Tab>
      <Tab {...tabProps} id="c">C</Tab>
    </TabList>
    <TabPanels>
      <TabPanel {...tabpanelProps} id="a">A</TabPanel>
      <TabPanel {...tabpanelProps} id="b">B</TabPanel>
      <TabPanel {...tabpanelProps} id="c">C</TabPanel>
    </TabPanels>
  </Tabs>
);

describe('Tabs', () => {
  it('should render tabs with default classes', () => {
    let {getByRole, getAllByRole} = renderTabs();
    let tablist = getByRole('tablist');
    let tabs = tablist.closest('.react-aria-Tabs');
    expect(tabs).toBeInTheDocument();
    expect(tablist).toHaveAttribute('class', 'react-aria-TabList');
    expect(tablist).toHaveAttribute('aria-label', 'Test');

    for (let tab of getAllByRole('tab')) {
      expect(tab).toHaveAttribute('class', 'react-aria-Tab');
    }

    let tabpanel = getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('class', 'react-aria-TabPanel');
  });

  it('should render tabs with custom classes', () => {
    let {getByRole, getAllByRole} = renderTabs({className: 'tabs'}, {className: 'tablist'}, {className: 'tab'}, {className: 'tabpanel'});
    let tablist = getByRole('tablist');
    let tabs = tablist.closest('.tabs');
    expect(tabs).toBeInTheDocument();
    expect(tablist).toHaveAttribute('class', 'tablist');
    for (let tab of getAllByRole('tab')) {
      expect(tab).toHaveAttribute('class', 'tab');
    }

    let tabpanel = getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('class', 'tabpanel');
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderTabs({'data-test': 'tabs'}, {'data-test': 'tablist'}, {'data-test': 'tab'}, {'data-test': 'tabpanel'});
    let tablist = getByRole('tablist');
    let tabs = tablist.closest('.react-aria-Tabs');
    expect(tabs).toHaveAttribute('data-test', 'tabs');
    expect(tablist).toHaveAttribute('data-test', 'tablist');
    for (let tab of getAllByRole('tab')) {
      expect(tab).toHaveAttribute('data-test', 'tab');
    }

    let tabpanel = getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('data-test', 'tabpanel');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <Tabs orientation="horizontal">
        {({orientation}) => (
          <>
            <TabList aria-label={`Test ${orientation}`}>
              <Tab id="a">A</Tab>
              <Tab id="b">B</Tab>
              <Tab id="c">C</Tab>
            </TabList>
            <TabPanels>
              <TabPanel id="a">A</TabPanel>
              <TabPanel id="b">B</TabPanel>
              <TabPanel id="c">C</TabPanel>
            </TabPanels>
          </>
        )}
      </Tabs>
    );
    let tablist = getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Test horizontal');
  });

  it('should support hover', () => {
    let {getAllByRole} = renderTabs({}, {}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let tab = getAllByRole('tab')[0];

    expect(tab).not.toHaveAttribute('data-hovered');
    expect(tab).not.toHaveClass('hover');

    userEvent.hover(tab);
    expect(tab).toHaveAttribute('data-hovered', 'true');
    expect(tab).toHaveClass('hover');

    userEvent.unhover(tab);
    expect(tab).not.toHaveAttribute('data-hovered');
    expect(tab).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getAllByRole} = renderTabs({}, {}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let tab = getAllByRole('tab')[0];

    expect(tab).not.toHaveAttribute('data-focus-visible');
    expect(tab).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(tab);
    expect(tab).toHaveAttribute('data-focus-visible', 'true');
    expect(tab).toHaveClass('focus');

    userEvent.tab();
    expect(tab).not.toHaveAttribute('data-focus-visible');
    expect(tab).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderTabs({}, {}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let tab = getAllByRole('tab')[0];

    expect(tab).not.toHaveAttribute('data-pressed');
    expect(tab).not.toHaveClass('pressed');

    fireEvent.mouseDown(tab);
    expect(tab).toHaveAttribute('data-pressed', 'true');
    expect(tab).toHaveClass('pressed');

    fireEvent.mouseUp(tab);
    expect(tab).not.toHaveAttribute('data-pressed');
    expect(tab).not.toHaveClass('pressed');
  });

  it('should support disabled state on all tabs', () => {
    let {getAllByRole} = renderTabs({}, {isDisabled: true}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let tab = getAllByRole('tab')[0];

    expect(tab).toHaveAttribute('aria-disabled', 'true');
    expect(tab).toHaveClass('disabled');
  });

  it('should support disabled state on tab', () => {
    let className = ({isDisabled}) => isDisabled ? 'disabled' : '';
    let {getAllByRole} = renderTabs({}, {disabledKeys: ['a'], className}, {className});
    let tab = getAllByRole('tab')[0];

    expect(tab).toHaveAttribute('aria-disabled', 'true');
    expect(tab).toHaveClass('disabled');
  });

  it('should support selected state', () => {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderTabs({}, {onSelectionChange}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let tabs = getAllByRole('tab');

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveClass('selected');

    userEvent.click(tabs[1]);
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    expect(tabs[0]).not.toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).not.toHaveClass('selected');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveClass('selected');

    userEvent.click(tabs[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveClass('selected');
  });

  it('should support orientation', () => {
    let className = ({orientation}) => orientation;
    let {getByRole} = renderTabs({orientation: 'vertical', className}, {className});
    let tablist = getByRole('tablist');
    let tabs = tablist.parentElement;

    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    expect(tablist).toHaveClass('vertical');

    expect(tabs).toHaveAttribute('data-orientation', 'vertical');
    expect(tabs).toHaveClass('vertical');
  });

  it('should support refs', () => {
    let tabsRef = React.createRef();
    let tabListRef = React.createRef();
    let tabRef = React.createRef();
    let tabPanelRef = React.createRef();
    render(
      <Tabs ref={tabsRef}>
        <TabList ref={tabListRef}>
          <Tab id="a" ref={tabRef}>A</Tab>
          <Tab id="b">B</Tab>
          <Tab id="c">C</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="a" ref={tabPanelRef}>A</TabPanel>
          <TabPanel id="b">B</TabPanel>
          <TabPanel id="c">C</TabPanel>
        </TabPanels>
      </Tabs>
    );
    expect(tabsRef.current).toBeInstanceOf(HTMLElement);
    expect(tabListRef.current).toBeInstanceOf(HTMLElement);
    expect(tabRef.current).toBeInstanceOf(HTMLElement);
    expect(tabPanelRef.current).toBeInstanceOf(HTMLElement);
  });
});
