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
import {cleanup, render} from '@testing-library/react';
import {Overlay} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function ExampleOverlay() {
  return <span data-testid="contents">Overlay</span>;
}

describe('Overlay', function () {
  afterEach(cleanup);

  it('should render nothing if isOpen is not set', function () {
    let overlayRef = React.createRef();
    render(
      <Provider theme={theme}>
        <Overlay ref={overlayRef}>
          <ExampleOverlay />
        </Overlay>
      </Provider>
    );

    expect(overlayRef.current).toBe(null);
  });

  it('should render into a portal in the body', function () {
    let providerRef = React.createRef();
    let overlayRef = React.createRef();
    render(
      <Provider theme={theme} ref={providerRef}>
        <Overlay isOpen ref={overlayRef}>
          <ExampleOverlay />
        </Overlay>
      </Provider>
    );

    let overlayNode = overlayRef.current.UNSAFE_getDOMNode();
    expect(overlayNode).not.toBe(providerRef.current);
    expect(overlayNode.parentNode).toBe(document.body);
    expect(overlayNode).toHaveStyle('position: absolute; z-index: 100000');
  });
});
