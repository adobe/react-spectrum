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

import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useOverlayTrigger} from '../';

function Example(props) {
  let ref = useRef();
  useOverlayTrigger({ref, ...props});
  return <div ref={ref} data-testid={props['data-testid'] || 'test'}>{props.children}</div>;
}

describe('useOverlayTrigger', function () {
  afterEach(cleanup);

  it('should close the overlay when the trigger scrolls', function () {
    let onClose = jest.fn();
    let res = render(
      <div data-testid="scrollable">
        <Example isOpen onClose={onClose} />
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close the overlay when an adjacent scrollable region scrolls', function () {
    let onClose = jest.fn();
    let res = render(
      <div>
        <Example isOpen onClose={onClose} />
        <div data-testid="scrollable">test</div>
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not close the overlay when the body scrolls', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} />);

    fireEvent.scroll(document.body);
    expect(onClose).not.toHaveBeenCalled();
  });
});
