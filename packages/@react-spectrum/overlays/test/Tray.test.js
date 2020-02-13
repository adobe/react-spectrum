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
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {Tray} from '../';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Tray', function () {
  afterEach(cleanup);

  it('should render nothing if isOpen is not set', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should render when isOpen is true', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(document.body).toHaveStyle('overflow: hidden');
  });

  it('hides the tray when pressing the escape key', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );
    await waitForDomChange(); // wait for animation
    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the tray when clicking outside', async function () {
    let onClose = jest.fn();
    render(
      <Provider theme={theme}>
        <Tray isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );
    await waitForDomChange(); // wait for animation
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
