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

import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, wait} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {Tooltip, TooltipTrigger} from '../';
import {triggerPress} from '@react-spectrum/test-utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('TooltipTrigger', function () {
  let onOpen = jest.fn();
  let onClose = jest.fn();

  afterEach(() => {
    onOpen.mockClear();
    onClose.mockClear();
    cleanup();
  });

  describe('click related tests', function () {

    it('a click event can open the tooltip', async function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByRole('button');
      triggerPress(button);

      let tooltip = getByRole('tooltip');

      await wait(() => {
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('a click event can close the tooltip', async function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByRole('button');
      triggerPress(button);

      let tooltip = getByRole('tooltip');

      await wait(() => {
        expect(tooltip).toBeInTheDocument();
      });

      triggerPress(button);

      await wait(() => {
        expect(tooltip).not.toBeInTheDocument();
      });
    });

    it('pressing escape should close the tooltip after a click event', async function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByRole('button');
      triggerPress(button);

      let tooltip = getByRole('tooltip');

      await wait(() => {
        expect(tooltip).toBeInTheDocument();
      });

      fireEvent.keyDown(button, {key: 'Escape'});

      await wait(() => {
        expect(tooltip).not.toBeInTheDocument();
      });
    });
  });

  describe('focus related tests', function () {

    it('pressing escape if the trigger is focused should close the tooltip', async function () {
      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="hover">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByText('Trigger');
      fireEvent.mouseOver(button);

      await new Promise((b) => setTimeout(b, 300));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();

      fireEvent.focus(button);
      fireEvent.keyDown(button, {key: 'Escape'});

      await wait(() => {
        expect(tooltip).not.toBeInTheDocument();
      });
    });
  });

  describe('hover related tests', function () {

    it('a mouseOver event can open the tooltip', async function () {
      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="hover">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByText('Trigger');
      fireEvent.mouseOver(button);

      await new Promise((c) => setTimeout(c, 300));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();
    });

    it('a mouseOver event can close the tooltip', async function () {
      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="hover">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByText('Trigger');
      fireEvent.mouseOver(button);

      await new Promise((c) => setTimeout(c, 300));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();

      fireEvent.mouseOver(button);

      await wait(() => {
        expect(tooltip).not.toBeInTheDocument();
      });
    });
  });
});
