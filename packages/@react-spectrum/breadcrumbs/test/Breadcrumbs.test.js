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

import {Breadcrumbs} from '../';
import {cleanup, render, within} from '@testing-library/react';
import {Item} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Breadcrumbs from '@react/react-spectrum/Breadcrumbs';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Breadcrumbs', function () {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.className === 'spectrum-Breadcrumbs-item') {
        return {width: 100};
      }
      if (this.className === 'spectrum-Breadcrumbs') {
        return {width: 250};
      }
      return {top: 0, bottom: 0, eft: 0, right: 0};
    });

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect.mockRestore();
    HTMLElement.prototype.scrollIntoView.mockRestore();
    cleanup();
  });

  it.each`
    Name               | Component        | props
    ${'Breadcrumbs'}   | ${Breadcrumbs}   | ${{}}
    ${'V2Breadcrumbs'} | ${V2Breadcrumbs} | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props} id="breadcrumbs-id" aria-label="breadcrumbs-test" />);

    let breadcrumbs = getByLabelText('breadcrumbs-test');
    expect(breadcrumbs).toHaveAttribute('id', 'breadcrumbs-id');
  });

  // v3 functionality, omitting v2 component
  it('Handles UNSAFE_className', () => {
    let {getByRole} = render(
      <Breadcrumbs UNSAFE_className="test-class">
        <Item>Folder 1</Item>
      </Breadcrumbs>
    );
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it('Handles multiple items', () => {
    let {getByTestId} = render(
      <Breadcrumbs className="test-class">
        <Item data-testid="item-1" >Folder 1</Item>
        <Item data-testid="item-2" >Folder 2</Item>
        <Item data-testid="item-3" >Folder 3</Item>
      </Breadcrumbs>
    );
    let item1 = getByTestId('item-1');
    expect(item1.tabIndex).toBe(0);
    expect(item1).not.toHaveAttribute('aria-current');
    let item2 = getByTestId('item-2');
    expect(item2.tabIndex).toBe(0);
    expect(item2).not.toHaveAttribute('aria-current');
    let item3 = getByTestId('item-3');
    expect(item3.tabIndex).toBe(-1);
    expect(item3).toHaveAttribute('aria-current', 'page');
  });

  it('Should handle forward ref', function () {
    let ref;
    let Component = () => {
      ref = useRef();
      return (
        <Breadcrumbs ref={ref} aria-label="breadcrumbs-test">
          <Item>Folder 1</Item>
        </Breadcrumbs>
      );
    };
    let {getByLabelText} = render(<Component />);
    let breadcrumb = getByLabelText('breadcrumbs-test');
    expect(breadcrumb).toBe(ref.current.UNSAFE_getDOMNode());
  });

  it('Handles size="L"', () => {
    let {getByRole} = render(
      <Breadcrumbs size="L">
        <Item>Folder 1</Item>
      </Breadcrumbs>
    );
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveAttribute('class', expect.stringContaining('--multiline'));
  });

  it('Handles isHeading and headingAriaLevel', () => {
    let {getByRole} = render(
      <Breadcrumbs headingAriaLevel={2} isHeading>
        <Item>Folder 1</Item>
      </Breadcrumbs>
    );
    let heading = getByRole('heading');
    expect(heading).toHaveAttribute('aria-level', '2');
  });

  it('Handles max visible items', () => {
    let {getByText, getByRole} = render(
      <Provider theme={theme}>
        <Breadcrumbs maxVisibleItems="3" >
          <Item >Folder 1</Item>
          <Item >Folder 2</Item>
          <Item >Folder 3</Item>
          <Item >Folder 4</Item>
          <Item >Folder 5</Item>
        </Breadcrumbs>
      </Provider>
    );
    let {children} = getByRole('list');
    expect(within(children[0]).getByRole('button')).toBeTruthy();
    expect(() => getByText('Folder 1')).toThrow();
    expect(() => getByText('Folder 2')).toThrow();
    expect(() => getByText('Folder 3')).toThrow();
    expect(getByText('Folder 4')).toBeTruthy();
    expect(getByText('Folder 5')).toBeTruthy();
  });

  it('Handles max visible items with showRoot', () => {
    let {getByText, getByRole} = render(
      <Provider theme={theme}>
        <Breadcrumbs maxVisibleItems="3" showRoot>
          <Item >Folder 1</Item>
          <Item >Folder 2</Item>
          <Item >Folder 3</Item>
          <Item >Folder 4</Item>
          <Item >Folder 5</Item>
        </Breadcrumbs>
      </Provider>
    );
    let {children} = getByRole('list');
    expect(getByText('Folder 1')).toBeTruthy();
    expect(within(children[1]).getByRole('button')).toBeTruthy();
    expect(() => getByText('Folder 2')).toThrow();
    expect(() => getByText('Folder 3')).toThrow();
    expect(() => getByText('Folder 4')).toThrow();
    expect(getByText('Folder 5')).toBeTruthy();
  });

  it('Handles isDisabled', () => {
    let {getByTestId} = render(
      <Breadcrumbs isDisabled>
        <Item data-testid="item-1" >Folder 1</Item>
        <Item data-testid="item-2" >Folder 2</Item>
      </Breadcrumbs>
    );

    let item1 = getByTestId('item-1');
    expect(item1).toHaveAttribute('aria-disabled', 'true');
    let item2 = getByTestId('item-2');
    expect(item2).toHaveAttribute('aria-disabled', 'true');
  });


  it('Handles max visible items auto', () => {
    let {getByText, getByRole} = render(
      <Provider theme={theme}>
        <Breadcrumbs maxVisibleItems="auto" >
          <Item >Folder 1</Item>
          <Item >Folder 2</Item>
          <Item >Folder 3</Item>
          <Item >Folder 4</Item>
          <Item >Folder 5</Item>
        </Breadcrumbs>
      </Provider>
    );

    let {children} = getByRole('list');
    expect(within(children[0]).getByRole('button')).toBeTruthy();
    expect(() => getByText('Folder 1')).toThrow();
    expect(() => getByText('Folder 2')).toThrow();
    expect(() => getByText('Folder 3')).toThrow();
    expect(getByText('Folder 4')).toBeTruthy();
    expect(getByText('Folder 5')).toBeTruthy();
  });

  it('Handles max visible items auto with showRoot', () => {
    let {getByText, getByRole} = render(
      <Provider theme={theme}>
        <Breadcrumbs maxVisibleItems="auto" showRoot>
          <Item >Folder 1</Item>
          <Item >Folder 2</Item>
          <Item >Folder 3</Item>
          <Item >Folder 4</Item>
          <Item >Folder 5</Item>
        </Breadcrumbs>
      </Provider>
    );

    let {children} = getByRole('list');
    expect(getByText('Folder 1')).toBeTruthy();
    expect(within(children[1]).getByRole('button')).toBeTruthy();
    expect(() => getByText('Folder 2')).toThrow();
    expect(() => getByText('Folder 3')).toThrow();
    expect(() => getByText('Folder 4')).toThrow();
    expect(getByText('Folder 5')).toBeTruthy();
  });


  it('Handles max visible items auto with dialog', () => {
    let onPress = jest.fn();
    let {getAllByText, getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <Breadcrumbs maxVisibleItems="auto" showRoot>
          <Item onPress={() => onPress('Folder 1')}>Folder 1</Item>
          <Item >Folder 2</Item>
          <Item >Folder 3</Item>
          <Item >Folder 4</Item>
          <Item >Folder 5</Item>
        </Breadcrumbs>
      </Provider>
    );

    let menuButton = getByRole('button');
    triggerPress(menuButton);

    let menu = getByRole('presentation');
    expect(menu).toBeTruthy();
    // menu contains all breadcrumb items
    expect(getAllByRole('menuitem').length).toBe(5);

    let item1 = getAllByText('Folder 1');
    expect(item1.length).toBe(2);

    // breadcrumb root item
    expect(item1[0]).toHaveAttribute('role', 'link');
    triggerPress(item1[0]);
    expect(onPress).toHaveBeenCalledWith('Folder 1');

    // menu item
    expect(item1[1]).not.toHaveAttribute('role');
    triggerPress(item1[1]);
    expect(onPress).toHaveBeenCalledWith('Folder 1');
  });
});
