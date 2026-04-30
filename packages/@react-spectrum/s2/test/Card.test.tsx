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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Card} from '../src/Card';
import {Content, Text} from '../src/Content';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Card', () => {
  let user;
  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders as a plain div when no press callbacks are provided', () => {
    let {getByText} = render(
      <Card>
        <Content><Text slot="title">Static Card</Text></Content>
      </Card>
    );
    let el = getByText('Static Card').closest('[class]')!.parentElement!;
    expect(el.tagName).toBe('DIV');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('tabindex');
  });

  it('renders as role=button and fires onPress when onPress is provided', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress}>
        <Content><Text slot="title">Interactive Card</Text></Content>
      </Card>
    );

    let card = getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabindex', '0');

    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onAction when onAction is provided', async () => {
    let onAction = jest.fn();
    let {getByRole} = render(
      <Card onAction={onAction}>
        <Content><Text slot="title">Action Card</Text></Content>
      </Card>
    );

    let card = getByRole('button');
    await user.click(card);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('fires both onPress and onAction when both are provided', async () => {
    let onPress = jest.fn();
    let onAction = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress} onAction={onAction}>
        <Content><Text slot="title">Both Callbacks Card</Text></Content>
      </Card>
    );

    let card = getByRole('button');
    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('fires onPressStart and onPressEnd when provided', async () => {
    let onPressStart = jest.fn();
    let onPressEnd = jest.fn();
    let {getByRole} = render(
      <Card onPressStart={onPressStart} onPressEnd={onPressEnd}>
        <Content><Text slot="title">Press Events Card</Text></Content>
      </Card>
    );

    let card = getByRole('button');
    await user.click(card);
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
  });

  it('does not fire press callbacks when disabled', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress} isDisabled>
        <Content><Text slot="title">Disabled Card</Text></Content>
      </Card>
    );

    let card = getByRole('button');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveAttribute('aria-disabled', 'true');

    await user.click(card);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not expose role=button when no press callbacks are provided', () => {
    let {queryByRole} = render(
      <Card>
        <Content><Text slot="title">Static Card</Text></Content>
      </Card>
    );
    expect(queryByRole('button')).toBeNull();
  });
});
