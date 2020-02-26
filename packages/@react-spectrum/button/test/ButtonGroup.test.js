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
import Brush from '@spectrum-icons/workflow/Brush';
import {cleanup, fireEvent, render} from '@testing-library/react';
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

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{}}
  `('$Name shifts button focus on left/right keyboard arrow click (ltr + horizontal)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowRight'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowLeft'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowLeft'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{}}
  `('$Name shifts button focus on up/down keyboard arrow click (ltr + horizontal)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowDown'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowUp'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowUp'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });
  
  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{}}
  `('$Name shifts button focus on left/right keyboard arrow click (rtl + horizontal)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="ar-AE">
        <ComponentGroup {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowRight'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button3, {key: 'ArrowLeft'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button3).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button3, {key: 'ArrowLeft'});
    expect(button2).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{}}
  `('$Name shifts button focus on up/down keyboard arrow click (rtl + horizontal)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="ar-AE">
        <ComponentGroup {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowDown'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button3, {key: 'ArrowUp'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button3).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button3, {key: 'ArrowUp'});
    expect(button2).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
  `('$Name shifts button focus on up/down keyboard arrow click (ltr + vertical)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup data-testid="test-group" {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = tree.getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowDown'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowUp'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowUp'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });


  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
  `('$Name shifts button focus on left/right keyboard arrow click (ltr + vertical)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup data-testid="test-group" {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = tree.getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowRight'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowLeft'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowLeft'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
  `('$Name shifts button focus on up/down keyboard arrow click (rtl + vertical)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="ar-AE">
        <ComponentGroup data-testid="test-group" {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = tree.getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowDown'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowUp'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowUp'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
  `('$Name shifts button focus on left/right keyboard arrow click (rtl + vertical)', function ({ComponentGroup, Component, props}) {
    let tree = render(
      <Provider theme={theme} locale="ar-AE">
        <ComponentGroup data-testid="test-group" {...props} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = tree.getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');

    triggerPress(button1);
    expect(button1).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button1, {key: 'ArrowRight'});
    expect(button1).toHaveAttribute('tabIndex', '-1');
    expect(button2).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(button2, {key: 'ArrowLeft'});
    expect(button1).toHaveAttribute('tabIndex', '0');
    expect(button2).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(button1, {key: 'ArrowLeft'});
    expect(button3).toHaveAttribute('tabIndex', '0');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });

  it('ButtonGroup handles single selection', function () {
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

  it('ButtonGroup handles multiple selection', function () {
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

  it('ButtonGroup handles none selection', function () {
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

  it('ButtonGroup should pass className, role and tabIndex', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ButtonGroup>
          <ActionButton UNSAFE_className={'test-class'} icon={<Brush />} data-testid="button-1">Click me</ActionButton>
        </ButtonGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    expect(button1).not.toHaveAttribute('icon');
    expect(button1).not.toHaveAttribute('unsafe_classname');
    expect(button1).toHaveAttribute('class', expect.stringContaining('test-class'));
    expect(button1).toHaveAttribute('class', expect.stringContaining('-item'));
    expect(button1).toHaveAttribute('role', 'radio');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });
});
