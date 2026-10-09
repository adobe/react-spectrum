/*
 * Copyright 2026 Adobe. All rights reserved.
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

  it('renders as a plain div when no press callbacks are provided', async () => {
    let {queryAllByRole} = render(
      <Card>
        <Content>
          <Text slot="title">Static Card</Text>
        </Content>
      </Card>
    );
    expect(queryAllByRole('button')).toHaveLength(0);
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('renders as role=button and fires onPress when onPress is provided', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress}>
        <Content>
          <Text slot="title">Interactive Card</Text>
        </Content>
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
        <Content>
          <Text slot="title">Action Card</Text>
        </Content>
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
        <Content>
          <Text slot="title">Both Callbacks Card</Text>
        </Content>
      </Card>
    );

    let card = getByRole('button');
    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    // onPress should fire before onAction.
    expect(onPress.mock.invocationCallOrder[0]).toBeLessThan(onAction.mock.invocationCallOrder[0]);
  });

  it('fires onPressStart and onPressEnd when provided', async () => {
    let onPressStart = jest.fn();
    let onPressEnd = jest.fn();
    let {getByRole} = render(
      <Card onPressStart={onPressStart} onPressEnd={onPressEnd}>
        <Content>
          <Text slot="title">Press Events Card</Text>
        </Content>
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
        <Content>
          <Text slot="title">Disabled Card</Text>
        </Content>
      </Card>
    );

    let card = getByRole('button');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toBeDisabled();

    await user.click(card);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('fires onPress when activated with the keyboard', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress}>
        <Content>
          <Text slot="title">Interactive Card</Text>
        </Content>
      </Card>
    );

    await user.tab();
    let card = getByRole('button');
    expect(card).toHaveFocus();

    await user.keyboard('[Enter]');
    expect(onPress).toHaveBeenCalledTimes(1);

    await user.keyboard('[Space]');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('reflects hover and keyboard focus state visually', async () => {
    let {getByRole} = render(
      <Card onPress={() => {}}>
        <Content>
          <Text slot="title">Interactive Card</Text>
        </Content>
      </Card>
    );
    let card = getByRole('button');
    let baseClassName = card.className;

    await user.hover(card);
    expect(card.className).not.toBe(baseClassName);
    await user.unhover(card);
    expect(card.className).toBe(baseClassName);

    await user.tab();
    expect(card).toHaveFocus();
    expect(card.className).not.toBe(baseClassName);
  });

  it('is accessible via aria-label even without a title in Content', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card onPress={onPress} aria-label="Labelled card">
        <Content>
          <Text>Some description, no title slot here</Text>
        </Content>
      </Card>
    );

    let card = getByRole('button', {name: 'Labelled card'});
    await user.click(card);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards press callbacks to the underlying link when href is provided', async () => {
    let onPress = jest.fn();
    let onAction = jest.fn();
    let {getByRole} = render(
      // Use a fragment href so jsdom treats the click as a same-document hash
      // change rather than attempting (unimplemented) navigation.
      <Card href="#link-card" onPress={onPress} onAction={onAction}>
        <Content>
          <Text slot="title">Link Card</Text>
        </Content>
      </Card>
    );

    let link = getByRole('link');
    expect(link).toHaveAttribute('href', '#link-card');

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('fires press callbacks on a link card activated with the keyboard', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card href="#keyboard-link-card" onPress={onPress}>
        <Content>
          <Text slot="title">Keyboard Link Card</Text>
        </Content>
      </Card>
    );

    await user.tab();
    let link = getByRole('link');
    expect(link).toHaveFocus();

    await user.keyboard('[Enter]');
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire press callbacks on a disabled link card', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Card href="#disabled-link-card" onPress={onPress} isDisabled>
        <Content>
          <Text slot="title">Disabled Link Card</Text>
        </Content>
      </Card>
    );

    let card = getByRole('link');
    expect(card).toHaveAttribute('aria-disabled', 'true');

    await user.click(card);
    expect(onPress).not.toHaveBeenCalled();

    await user.tab();
    expect(card).not.toHaveFocus();
  });
});
