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
import {ActionButton, ButtonGroup} from '../';
import {cleanup, render} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Button from '@react/react-spectrum/Button';
import V2ButtonGroup from '@react/react-spectrum/ButtonGroup';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('ButtonGroup', function () {
  afterEach(() => {
    cleanup();
  });

  it.each`
  Name               | ComponentGroup   | Component
  ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}
  `('$Name handles defaults', function ({ComponentGroup, Component}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup>
          <Component >Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    expect(getByRole('radiogroup')).toBeTruthy();
    expect(getAllByRole('radio')).toBeTruthy();
  });

  it.each`
  Name               | ComponentGroup   | Component       | props
  ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{selectionMode: 'multiple'}}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{multiple: true, role: 'toolbar'}}
  `('$Name handles multiple selection', function ({ComponentGroup, Component, props}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component >Click me</Component>
          <Component >Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    expect(getByRole('toolbar')).toBeTruthy();
    let button = getAllByRole('checkbox');
    expect(button.length).toBe(2);
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{orientation: 'vertical', role: 'toolbar'}}
  `('$Name handles vertical', function ({ComponentGroup, Component, props}) {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} data-testid="test-group" >
          <Component>Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{isDisabled: true}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{disabled: true}}
  `('$Name handles disabeld', function ({ComponentGroup, Component, props}) {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component>Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });

  it('SideNav handles single selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ButtonGroup >
          <ActionButton data-testid="button-1">Click me</ActionButton>
          <ActionButton data-testid="button-2">Click me</ActionButton>
        </ButtonGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    let button2 = getByTestId('button-2');
    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'false');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('SideNav handles multiple selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ButtonGroup selectionMode="multiple">
          <ActionButton data-testid="button-1">Click me</ActionButton>
          <ActionButton data-testid="button-2">Click me</ActionButton>
        </ButtonGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    let button2 = getByTestId('button-2');
    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('SideNav handles none selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ButtonGroup selectionMode="none">
          <ActionButton data-testid="button-1">Click me</ActionButton>
        </ButtonGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'false');
  });
});
