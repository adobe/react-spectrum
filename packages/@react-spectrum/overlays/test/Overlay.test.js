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

import {Overlay} from '../';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import {render} from '../../../../lib/customRTL';
import {theme} from '@react-spectrum/theme-default';

function ExampleOverlay() {
  return <span data-testid="contents">Overlay</span>;
}

describe('Overlay', function () {
  it('should render nothing if isOpen is not set', function () {

    let Component = () => {
      let overlayRef = useRef();
      return (
        <Provider theme={theme}>
          <Overlay nodeRef={overlayRef}>
            <ExampleOverlay />
          </Overlay>
        </Provider>
      );
    };
    let {queryByTestId} = render(<Component />);

    expect(queryByTestId('contents')).toBe(null);
  });

  it('should render into a portal in the body', function () {

    let Component = () => {
      let providerRef = useRef();
      let overlayRef = useRef();
      return (
        <Provider data-testid="provider" theme={theme} ref={providerRef}>
          <Overlay isOpen nodeRef={overlayRef}>
            <ExampleOverlay />
          </Overlay>
        </Provider>
      );
    };
    let {getByTestId} = render(<Component />);

    let contents = getByTestId('contents');
    expect(contents).toBeInTheDocument();

    let overlayNode = contents.parentNode;
    let provider = getByTestId('provider');

    expect(overlayNode).not.toBe(provider);
    expect(overlayNode.parentNode).toBe(document.body);
  });
});
