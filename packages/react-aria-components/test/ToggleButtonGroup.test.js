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

import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {ToggleButton, ToggleButtonGroup} from '../';
import userEvent from '@testing-library/user-event';

function renderGroup(props) {
  return render(
    <ToggleButtonGroup {...props}>
      <ToggleButton id="foo">Foo</ToggleButton>
      <ToggleButton id="bar">Bar</ToggleButton>
    </ToggleButtonGroup>
  );
}

describe('ToggleButtonGroup', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a toggle button group with default class', () => {
    let {getByRole} = renderGroup();
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('class', 'react-aria-ToggleButtonGroup');
  });

  it('should render a toggle button group with a custom class', () => {
    let {getByRole} = renderGroup({className: 'custom'});
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('class', 'custom');
  });

  it('should support render props', () => {
    let {getByRole} = renderGroup({'data-foo': 'bar'});
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('data-foo', 'bar');
  });

  it('should support disabled state', () => {
    let {getByRole, getAllByRole} = renderGroup({isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : 'enabled'});
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('class', 'disabled');
    expect(group).toHaveAttribute('data-disabled', 'true');
    expect(group).toHaveAttribute('aria-disabled', 'true');
    for (let radio of getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('should support uncontrolled single selection', async () => {
    let onSelectionChange = jest.fn();
    let {getByRole, getAllByRole} = renderGroup({selectionMode: 'single', onSelectionChange});
    expect(getByRole('radiogroup')).toBeInTheDocument();
    let radios = getAllByRole('radio');
    for (let radio of radios) {
      expect(radio).toHaveAttribute('aria-checked', 'false');
      expect(radio).not.toHaveAttribute('aria-pressed');
    }

    await user.click(radios[1]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['bar']));
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[0]).not.toHaveAttribute('aria-pressed');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).not.toHaveAttribute('aria-pressed');

    await user.click(radios[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['foo']));
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).not.toHaveAttribute('aria-pressed');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).not.toHaveAttribute('aria-pressed');
  });

  it('should support controlled single selection', async () => {
    let onSelectionChange = jest.fn();
    let {getByRole, getAllByRole} = renderGroup({selectionMode: 'single', selectedKeys: [], onSelectionChange});
    expect(getByRole('radiogroup')).toBeInTheDocument();
    let radios = getAllByRole('radio');
    for (let radio of radios) {
      expect(radio).toHaveAttribute('aria-checked', 'false');
      expect(radio).not.toHaveAttribute('aria-pressed');
    }

    await user.click(radios[1]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['bar']));
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[0]).not.toHaveAttribute('aria-pressed');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).not.toHaveAttribute('aria-pressed');
  });

  it('should support uncontrolled multiple selection', async () => {
    let onSelectionChange = jest.fn();
    let {getByRole, getAllByRole} = renderGroup({selectionMode: 'multiple', onSelectionChange});
    expect(getByRole('toolbar')).toBeInTheDocument();
    let buttons = getAllByRole('button');
    for (let button of buttons) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }

    await user.click(buttons[1]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['bar']));
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');

    await user.click(buttons[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['bar', 'foo']));
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('should support controlled multiple selection', async () => {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderGroup({selectionMode: 'multiple', selectedKeys: ['foo'], onSelectionChange});
    let buttons = getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');

    await user.click(buttons[1]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['foo', 'bar']));
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
  });

  it('should support horizontal keyboard navigation', async () => {
    let {getAllByRole} = renderGroup();
    let radios = getAllByRole('radio');
    await user.tab();
    expect(document.activeElement).toBe(radios[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(radios[1]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(radios[0]);
  });

  it('should support vertical keyboard navigation', async () => {
    let {getAllByRole} = renderGroup({orientation: 'vertical'});
    let radios = getAllByRole('radio');
    await user.tab();
    expect(document.activeElement).toBe(radios[0]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radios[1]);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(radios[0]);
  });

  it('supports aria labeling', () => {
    let {getByRole} = renderGroup({'aria-label': 'Test'});
    let radiogroup = getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-label', 'Test');

    ({getByRole} = renderGroup({selectionMode: 'multiple', 'aria-label': 'Test'}));
    let toolbar = getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Test');
  });
});
