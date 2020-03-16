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

import {BreadcrumbItem, Breadcrumbs} from '../';
import {cleanup, render, within} from '@testing-library/react';
import React, {useRef} from 'react';
import V2Breadcrumbs from '@react/react-spectrum/Breadcrumbs';
import {testSlotsAPI} from '@react-spectrum/test-utils';


describe('Breadcrumbs', function () {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.className === 'spectrum-Breadcrumbs-item') {
        return {width: 100};
      }
      if (this.className === 'spectrum-Breadcrumbs') {
        return {width: 250};
      }
    });
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect.mockRestore();
    cleanup();
  });

  it('uses slots api', () => {
    testSlotsAPI(Breadcrumbs);
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
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it('Handles multiple items', () => {
    let {getByTestId} = render(
      <Breadcrumbs className="test-class">
        <BreadcrumbItem data-testid="item-1" >Folder 1</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-2" >Folder 2</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-3" >Folder 3</BreadcrumbItem>
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
          <BreadcrumbItem>Folder 1</BreadcrumbItem>
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
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveAttribute('class', expect.stringContaining('--multiline'));
  });

  it('Handles isHeading and headingAriaLevel', () => {
    let {getByRole} = render(
      <Breadcrumbs headingAriaLevel={2} isHeading>
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let heading = getByRole('heading');
    expect(heading).toHaveAttribute('aria-level', '2');
  });

  it('Handles max visible items', () => {
    let {getByText, getByRole} = render(
      <Breadcrumbs maxVisibleItems="3" >
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
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
      <Breadcrumbs maxVisibleItems="3" showRoot>
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
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
        <BreadcrumbItem data-testid="item-1" >Folder 1</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-2" >Folder 2</BreadcrumbItem>
      </Breadcrumbs>
    );

    let item1 = getByTestId('item-1');
    expect(item1).toHaveAttribute('aria-disabled', 'true');
    let item2 = getByTestId('item-2');
    expect(item2).toHaveAttribute('aria-disabled', 'true');
  });


  it('Handles max visible items auto', () => {
    let {getByText, getByRole} = render(
      <Breadcrumbs maxVisibleItems="auto" >
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
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
      <Breadcrumbs maxVisibleItems="auto" showRoot>
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
    );

    let {children} = getByRole('list');
    expect(getByText('Folder 1')).toBeTruthy();
    expect(within(children[1]).getByRole('button')).toBeTruthy();
    expect(() => getByText('Folder 2')).toThrow();
    expect(() => getByText('Folder 3')).toThrow();
    expect(() => getByText('Folder 4')).toThrow();
    expect(getByText('Folder 5')).toBeTruthy();
  });
});
