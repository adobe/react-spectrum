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
import React, {useRef} from 'react';
import {useDialog} from '../';

function Example(props) {
  let ref = useRef();
  let {dialogProps} = useDialog({ref, ...props});
  return <div ref={ref} {...dialogProps} data-testid="test">{props.children}</div>;
}

describe('useDialog', function () {
  afterEach(cleanup);

  it('should have role="dialog" by default', function () {
    let res = render(<Example />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'dialog');
  });

  it('should accept role="alertdialog"', function () {
    let res = render(<Example role="alertdialog" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'alertdialog');
  });

  it('should focus the overlay on mount', function () {
    let res = render(<Example />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(el);
  });

  it('should not focus the overlay if something inside is auto focused', function () {
    let res = render(
      <Example>
        <input data-testid="input" autoFocus />
      </Example>
    );
    let input = res.getByTestId('input');
    expect(document.activeElement).toBe(input);
  });
});
