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

import {fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useOverlay} from '../';

function Example(props) {
  let ref = useRef();
  let {overlayProps} = useOverlay(props, ref);
  return <div ref={ref} {...overlayProps} data-testid={props['data-testid'] || 'test'}>{props.children}</div>;
}

describe('useOverlay', function () {
  it('should not focus the overlay if a child is focused', function () {
    let res = render(
      <Example isOpen>
        <input autoFocus data-testid="input" />
      </Example>
    );

    let input = res.getByTestId('input');
    expect(document.activeElement).toBe(input);
  });

  it('should hide the overlay when clicking outside if isDismissble is true', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} isDismissable />);
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should hide the overlay when clicking outside if shouldCloseOnInteractOutside returns true', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} isDismissable shouldCloseOnInteractOutside={target => target === document.body} />);
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not hide the overlay when clicking outside if shouldCloseOnInteractOutside returns false', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} isDismissable shouldCloseOnInteractOutside={target => target !== document.body} />);
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it('should not hide the overlay when clicking outside if isDismissable is false', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} isDismissable={false} />);
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it('should hide the overlay when pressing the escape key', function () {
    let onClose = jest.fn();
    let res = render(<Example isOpen onClose={onClose} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should still hide the overlay when pressing the escape key if isDismissable is false', function () {
    let onClose = jest.fn();
    let res = render(<Example isOpen onClose={onClose} isDismissable={false} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should only hide the top-most overlay', function () {
    let onCloseFirst = jest.fn();
    let onCloseSecond = jest.fn();
    render(<Example isOpen onClose={onCloseFirst} isDismissable />);
    let second = render(<Example isOpen onClose={onCloseSecond} isDismissable />);

    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onCloseSecond).toHaveBeenCalledTimes(1);
    expect(onCloseFirst).not.toHaveBeenCalled();

    second.unmount();

    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onCloseFirst).toHaveBeenCalledTimes(1);
  });
});
